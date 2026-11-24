# AGENTS.md

Static Hugo site for hk27-planning, deployed via GitHub Actions to GitHub
Pages. Toolchain (Hugo, Go, Node, Dart Sass, Python) is pinned in
`pixi.toml`; details and upgrade steps in
[`docs/maintenance.md`](docs/maintenance.md).

## Stack

- Generator: [Hugo](https://gohugo.io/) (extended), config in `hugo.toml`.
- Theme: [Docsy](https://www.docsy.dev/) as a Hugo module
  (`github.com/docsy/docsy/theme`, pinned in `go.mod`). Its Bootstrap and
  Font Awesome come from npm (`package.json`, `packages/hugoautogen/`,
  `pixi run npm-deps`). Never copy Docsy templates wholesale; override the
  smallest partial or hook (current overrides: `layouts/`).
- Styling: `assets/scss/_variables_project.scss` (HK25 palette, fonts) and
  `_styles_project.scss`. Fonts are self-hosted (`static/fonts/`,
  `_fonts.scss`): don't add Google Fonts or other third-party requests.

## Content model

- First-level folders under `content/` are the sections in the top navbar
  (`sectionPagesMenu`, ordered by the section's `weight`). No hand-written
  menu entries.
- Hierarchy: a sub-folder with an `_index.md` becomes a collapsible group
  in the sidebar. `weight` orders pages, `linkTitle` sets a shorter nav
  label.
- Moving or renaming a page: add the old URL to `aliases` in its front
  matter, so links keep working.
- `content/_index.md` is the home page: `hero` and `tile` shortcodes
  (`layouts/_shortcodes/`) plus Docsy's `blocks/section`. All other pages
  get Docsy's docs layout through `[[cascade]] type = "docs"`.
- Math: `$...$` / `$$...$$` are rendered to HTML at build time
  (`layouts/_markup/render-passthrough.html`, KaTeX via
  `transform.ToMath`). No JS.
- Callouts: GitHub-style alerts (`> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`,
  `[!WARNING]`, `[!CAUTION]`). Non-Hugo syntax like HedgeDoc's `:::info`
  renders as literal text; convert it.
- Tables stay markdown tables: scientists edit them directly.
- Home-page map: pins come from `data/map-pins.yaml` (name, lat, lon);
  `scripts/make_map.py` draws `assets/images/hero-map.svg` (`pixi run map`,
  also run by `serve`/`build`). Commit the regenerated SVG; CI fails if it
  is stale.
- Footer links: `params.footerLinks` in `hugo.toml`.

## Commands

```sh
pixi install && pixi run npm-deps   # once after clone / dependency changes
pixi run serve                      # local preview; prints the URL
pixi run build                      # production build -> ./public, fails on warnings
pixi run lint && pixi run test      # ruff + pytest for scripts/
```

## CI/CD

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml): `pull_request`
  targeting `main` → lint, test, build, map-freshness check, upload
  `./public` as workflow artifact `site` (7 days). No deploy.
- [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): `push`
  to `main` → same build, deploy via `actions/deploy-pages`.
- Both use `prefix-dev/setup-pixi`, so tool versions come from
  `pixi.lock`. Repo setting: **Settings → Pages → Source: GitHub Actions**.

## Conventions

- Keep this file updated when the content model, theme, or CI changes.
