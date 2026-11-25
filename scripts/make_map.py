"""Draw the home-page world map with a pin per hackathon node.

Reads pin coordinates from data/map-pins.yaml, land outlines from Natural Earth
(scripts/data/ne_110m_land.geojson, public domain), and writes an SVG that the
home page inlines (layouts/_shortcodes/hero.html).

Usage: python scripts/make_map.py [--nodes ...] [--land ...] [--out ...]
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from xml.sax.saxutils import escape

import yaml

ROOT = Path(__file__).resolve().parent.parent

# Map frame: Miller cylindrical, cropped to the inhabited latitudes.
LON_MIN, LON_MAX = -180.0, 180.0
LAT_MIN, LAT_MAX = -57.0, 84.0
WIDTH = 1000.0

# Land gradient west -> east, after the HK25 logo.
GRADIENT = [
    (0.00, "#1d5fa8"),
    (0.15, "#18a3cc"),
    (0.32, "#5cc2c4"),
    (0.47, "#6db96a"),
    (0.62, "#a9d07e"),
    (0.78, "#f2e48f"),
    (1.00, "#f9eaa3"),
]
PIN_COLOR = "#3a4766"
PIN_SCALE = 1.5  # pin height is 24 * PIN_SCALE map units


class MapError(Exception):
    """Invalid input data."""


@dataclass(frozen=True)
class Node:
    label: str
    lat: float
    lon: float


def miller_y(lat: float) -> float:
    """Miller projection northing (radians-scaled) for a latitude in degrees."""
    phi = math.radians(lat)
    return 1.25 * math.log(math.tan(math.pi / 4 + 0.4 * phi))


Y_TOP, Y_BOTTOM = miller_y(LAT_MAX), miller_y(LAT_MIN)
HEIGHT = round(WIDTH * (Y_TOP - Y_BOTTOM) / math.radians(LON_MAX - LON_MIN), 1)


def project(lat: float, lon: float) -> tuple[float, float]:
    """Map (lat, lon) in degrees to SVG (x, y) in the map frame."""
    lat = min(max(lat, LAT_MIN), LAT_MAX)
    x = (lon - LON_MIN) / (LON_MAX - LON_MIN) * WIDTH
    y = (Y_TOP - miller_y(lat)) / (Y_TOP - Y_BOTTOM) * HEIGHT
    return x, y


def load_nodes(path: Path) -> list[Node]:
    """Pins from the YAML file: a 'pins' list of {name, lat, lon}."""
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    except (OSError, yaml.YAMLError) as err:
        raise MapError(f"cannot read {path}: {err}") from err
    entries = data.get("pins") if isinstance(data, dict) else None
    if not isinstance(entries, list):
        raise MapError(f"{path}: expected a 'pins' list")
    nodes = []
    for i, entry in enumerate(entries):
        if not isinstance(entry, dict) or not {"lat", "lon"} <= entry.keys():
            raise MapError(f"{path}: pins[{i}] needs lat and lon")
        try:
            lat, lon = float(entry["lat"]), float(entry["lon"])
        except (TypeError, ValueError) as err:
            raise MapError(f"{path}: pins[{i}] lat/lon not numeric") from err
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            raise MapError(f"{path}: pins[{i}] lat/lon out of range: {lat}, {lon}")
        nodes.append(Node(label=str(entry.get("name") or f"pin {i}"), lat=lat, lon=lon))
    return nodes


def ring_path(ring: list[list[float]]) -> str:
    """SVG path data for one closed polygon ring of [lon, lat] points."""
    points = []
    last = None
    for lon, lat in ring:
        x, y = project(lat, lon)
        pt = f"{x:.1f} {y:.1f}"
        if pt != last:
            points.append(pt)
            last = pt
    if len(points) < 3:
        return ""
    return "M" + "L".join(points) + "Z"


def land_path(path: Path) -> str:
    """SVG path data for all land polygons (outer rings and holes) north of the crop."""
    try:
        geo: dict[str, Any] = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as err:
        raise MapError(f"cannot read {path}: {err}") from err
    parts = []
    for feature in geo.get("features", []):
        geom = feature.get("geometry") or {}
        polygons = {
            "Polygon": [geom.get("coordinates")],
            "MultiPolygon": geom.get("coordinates"),
        }.get(geom.get("type"), [])
        for polygon in polygons:
            if max(lat for _, lat in polygon[0]) < LAT_MIN:  # Antarctica
                continue
            parts.extend(ring_path(ring) for ring in polygon)
    return "".join(p for p in parts if p)


def pin(node: Node) -> str:
    """A map pin whose tip sits on the node, with a hover title."""
    x, y = project(node.lat, node.lon)
    return (
        f'<g class="pin" transform="translate({x:.1f} {y:.1f}) scale({PIN_SCALE:g})">'
        f"<title>{escape(node.label)}</title>"
        '<path d="M0 0C-2-6-8-10-8-16a8 8 0 0 1 16 0c0 6-6 10-8 16Z"/>'
        '<circle cy="-16" r="3.4" fill="#fff" stroke="none"/></g>'
    )


TOP_PAD = 24 * PIN_SCALE  # room above the frame for pins near LAT_MAX


def render_svg(land: str, nodes: list[Node]) -> str:
    stops = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in GRADIENT)
    pins = "".join(pin(n) for n in sorted(nodes, key=lambda n: -n.lat))
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -{TOP_PAD:g} {WIDTH:g} {HEIGHT + TOP_PAD:g}" '
        'class="hero-map" role="img" aria-labelledby="hero-map-title">'
        '<title id="hero-map-title">Map of the hackathon nodes</title>'
        '<defs><linearGradient id="hero-land" x1="0" x2="1" y1="0" y2="0">'
        f"{stops}</linearGradient></defs>"
        f'<path class="land" fill="url(#hero-land)" fill-rule="evenodd" d="{land}"/>'
        f'<g class="pins" fill="{PIN_COLOR}" stroke="#fff" stroke-width="0.8">'
        f"{pins}</g></svg>\n"
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--nodes", type=Path, default=ROOT / "data/map-pins.yaml")
    parser.add_argument(
        "--land", type=Path, default=ROOT / "scripts/data/ne_110m_land.geojson"
    )
    parser.add_argument("--out", type=Path, default=ROOT / "assets/images/hero-map.svg")
    args = parser.parse_args(argv)
    try:
        nodes = load_nodes(args.nodes)
        svg = render_svg(land_path(args.land), nodes)
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(svg, encoding="utf-8")
    except (MapError, OSError) as err:
        print(f"make_map: {err}", file=sys.stderr)
        return 1
    print(f"make_map: {len(nodes)} pins -> {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
