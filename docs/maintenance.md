# Maintenance

## Toolchain

`pixi.toml` pins Hugo (extended), Go (Hugo modules), Node (npm packages
for Docsy), Dart Sass (Docsy's SCSS), Python with PyYAML, pytest and ruff
(`scripts/`). CI installs exactly `pixi.lock`.

Upgrade a tool: edit the version range in `pixi.toml`, run `pixi install`,
build, and commit `pixi.toml` and `pixi.lock`.

## Docsy upgrade

Docsy is pinned in `go.mod`. Upgrade on a fixed schedule (e.g. twice a
year), not ad hoc.

1. `pixi run hugo mod get github.com/docsy/docsy/theme@vX.Y.Z`, then
   `pixi run hugo mod npm pack` and `pixi run npm install`. Commit
   `go.mod`, `go.sum`, `package.json`, `package-lock.json`,
   `packages/hugoautogen/`.
2. Read Docsy's changelog for renamed params (`params.ui.*`), CSS classes
   and hooks.
3. Diff the Docsy files we depend on between the versions:
   - overridden: `_partials/footer/center.html` → our
     `layouts/_partials/footer/center.html`;
   - called: `_partials/scripts/math.html` (from our
     `layouts/_markup/render-passthrough.html`), `_shortcodes/blocks/section.html`;
   - Sass names used in `assets/scss/`: `$td-navbar-bg-color`,
     `$td-enable-google-fonts`, `.td-navbar .navbar-brand__logo`,
     `.navbar-brand__name`, `.td-content`, `.td-box`.
4. `pixi run build` (fails on warnings), then look at the home page (light
   and dark), a page with math (`simulations/data-request`), a wide table
   (`simulations/models`), and the sidebar on a nested section, at desktop
   and phone width.

## Third-party requests

Pages load everything from the site itself, except Lunr for the search
box (`unpkg.com`, hardcoded in Docsy's `_partials/head.html`). Removing it
means overriding that whole template.

## Map and emblem

- `scripts/make_map.py`: Natural Earth 110 m land
  (`scripts/data/ne_110m_land.geojson`, public domain), Miller projection
  cropped to 57° S–84° N, HK25 gradient. Pins from `data/map-pins.yaml`.
- `static/images/emblem.webp` and `assets/icons/logo.svg` (navbar, inlined
  by Docsy) are the lighthouse emblem cut from the HK25 logo
  (github.com/digital-earths-global-hackathon/hk25, MIT).
