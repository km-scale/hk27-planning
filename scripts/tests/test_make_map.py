"""Tests for scripts/make_map.py."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import make_map


def test_project_corners_and_equator():
    assert make_map.project(make_map.LAT_MAX, -180) == pytest.approx((0, 0))
    x, y = make_map.project(make_map.LAT_MIN, 180)
    assert (x, y) == pytest.approx((make_map.WIDTH, make_map.HEIGHT))
    x, y = make_map.project(0, 0)
    assert x == pytest.approx(make_map.WIDTH / 2)
    assert 0 < y < make_map.HEIGHT


def test_project_clamps_latitude():
    assert make_map.project(89, 0) == make_map.project(make_map.LAT_MAX, 0)


def test_load_nodes(tmp_path):
    f = tmp_path / "pins.yaml"
    f.write_text("pins:\n  - {name: Lima, lat: -12.05, lon: -77.04}\n")
    assert make_map.load_nodes(f) == [make_map.Node("Lima", -12.05, -77.04)]


@pytest.mark.parametrize(
    "body",
    [
        "nodes: []",
        "pins:\n  - {name: X, lat: 1}",
        "pins:\n  - {name: X, lat: north, lon: 1}",
        "pins:\n  - {name: X, lat: 95, lon: 1}",
        "pins: [",
    ],
)
def test_load_nodes_rejects_bad_input(tmp_path, body):
    f = tmp_path / "pins.yaml"
    f.write_text(body)
    with pytest.raises(make_map.MapError):
        make_map.load_nodes(f)


def test_render_escapes_labels():
    svg = make_map.render_svg("M0 0Z", [make_map.Node("A & B <x>", 0, 0)])
    assert "<title>A &amp; B &lt;x&gt;</title>" in svg
    assert svg.count('class="pin"') == 1


def test_main_writes_svg(tmp_path):
    pins = tmp_path / "pins.yaml"
    pins.write_text("pins:\n  - {name: Zurich, lat: 47.38, lon: 8.54}\n")
    out = tmp_path / "map.svg"
    assert make_map.main(["--nodes", str(pins), "--out", str(out)]) == 0
    assert out.read_text().startswith("<svg")


def test_main_reports_errors(tmp_path, capsys):
    assert make_map.main(["--nodes", str(tmp_path / "missing.yaml")]) == 1
    assert "make_map: cannot read" in capsys.readouterr().err
