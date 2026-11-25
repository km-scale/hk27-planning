# hk27-planning

Planning docs for HK27, published at
[km-scale.github.io/hk27-planning](https://km-scale.github.io/hk27-planning/).

Built with [Hugo](https://gohugo.io/) and the [Docsy](https://www.docsy.dev/)
theme.

## Running locally

Tools come from [pixi](https://pixi.sh/):

```sh
pixi install && pixi run npm-deps   # once
pixi run serve                      # open the URL it prints
```

## Editing content

The easiest way: the **Edit this page** link on every page opens the file on
GitHub.

- **Pages**: markdown files under `content/`. Each top-level folder is a
  section in the top menu (`nodes/`, `simulations/`, `technical/`). Put a
  folder with an `_index.md` inside a section to group pages; it shows up
  nested in the sidebar. Front matter `weight` orders pages (lower first),
  `title` is the page title, `linkTitle` an optional shorter menu label.
- **Home page**: `content/_index.md`.
- **Map pins** on the home page: `data/map-pins.yaml` (name, latitude,
  longitude), then `pixi run map` and commit `assets/images/hero-map.svg`.
- **Math**: write `$inline$` or `$$display$$` LaTeX directly in markdown.
- **Callouts**: GitHub-style alerts, e.g.
  ```markdown
  > [!NOTE]
  > Some supplementary info.
  ```
  (`NOTE` / `TIP` / `IMPORTANT` / `WARNING` / `CAUTION`).
- **Footer links**: `params.footerLinks` in `hugo.toml`.

## Deployment

Pushing to `main` runs
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds
the site and deploys it to GitHub Pages. Pull requests into `main` run
[`.github/workflows/ci.yml`](.github/workflows/ci.yml): the same build
without deploying, with the built site as a downloadable workflow artifact.

Repo setting required (already set): **Settings → Pages → Source: GitHub
Actions**.
