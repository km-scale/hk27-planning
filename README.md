# hk27-planning

Planning docs for HK27, published at
[km-scale.github.io/hk27-planning](https://km-scale.github.io/hk27-planning/).

Built with [Hugo](https://gohugo.io/) using the
[hugo-book](https://github.com/alex-shpak/hugo-book) theme (a docs/wiki
layout with sidebar navigation and search).

## Running locally

The theme is a git submodule, so clone with `--recurse-submodules`, or run
after the fact:

```sh
git submodule update --init --recursive
```

Then, with Hugo installed (or via [uv](https://docs.astral.sh/uv/)):

```sh
hugo server # use uvx hugo server to run via uv
```

Open the url displayed by hugo.

## Editing content

- **Pages**: add `.md` files under `content/docs/`. Front matter `weight`
  controls ordering in the sidebar; `title` sets the nav label.
- **Landing page**: `content/_index.md`.
- **Math**: write `$inline$` or `$$display$$` LaTeX directly in markdown —
  KaTeX is loaded automatically on every page, no shortcode needed.
- **Callouts**: use GitHub-style markdown alerts, e.g.
  ```markdown
  > [!NOTE]
  > Some supplementary info.
  ```
  (`NOTE` / `TIP` / `IMPORTANT` / `WARNING` / `CAUTION`).
- **Legal/privacy footer links**: `layouts/_partials/docs/inject/footer.html`.

## Deployment

Publishing is automatic: pushing to `main` runs
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which
builds the site with Hugo and deploys it via GitHub Pages. Pull requests
into `main` run [`.github/workflows/ci.yml`](.github/workflows/ci.yml), the
same build for validation, without deploying, and upload the built site as
a downloadable workflow artifact.

Repo setting required (already set): **Settings → Pages → Source: GitHub
Actions**.
