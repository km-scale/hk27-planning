# AGENTS.md

Static Hugo site for hk27-planning, deployed via GitHub Actions to GitHub
Pages. No package manager, no build step beyond Hugo itself.

## Stack

- Generator: [Hugo](https://gohugo.io/) (extended), config in `hugo.toml`.
- Theme: [`hugo-book`](https://github.com/alex-shpak/hugo-book), vendored
  as a git submodule at `themes/hugo-book`. Do not edit files under
  `themes/hugo-book/` — override via `layouts/` or `assets/` at the repo
  root instead (Hugo's filesystem overlay: site-root files of the same
  path win over the theme's).
- `params.BookSection = 'docs'` — book pages live under `content/docs/`;
  the sidebar is generated from that section's structure.

## Content model (hugo-book specifics)

- `content/_index.md` and `content/docs/_index.md` need `type: docs` in
  front matter to render through the book layout.
- Every page under `content/docs/` uses `weight` in front matter to order
  itself in the sidebar (lower first).
- **Math**: `[markup.goldmark.extensions.passthrough]` is enabled in
  `hugo.toml` so `$...$` / `$$...$$` LaTeX survives Goldmark untouched
  (otherwise underscores/asterisks inside TeX get parsed as markdown
  emphasis). `assets/katex.json` (project override of the theme's default)
  adds single-`$` inline delimiters on top of the theme's `$$` / `\(\)` /
  `\[\]` defaults. `layouts/_partials/docs/inject/footer.html` and
  `layouts/_partials/docs/inject/content-after.html` are project overrides
  of the theme's (empty) injection points:
  - `content-after.html` unconditionally loads KaTeX + auto-render on
    every page, so math "just works" without the `{{< katex >}}`
    shortcode. If you ever need to gate this per-page instead, remove the
    override and use the shortcode/`` ```katex ``` `` code block per the
    theme's own docs.
  - `footer.html` adds the Legal/Privacy links shown on every page.
- **Callouts**: prefer GitHub-style markdown alerts (`> [!NOTE]`, `[!TIP]`,
  `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`) — native to the theme. The
  older `{{% hint %}}` shortcode still works but is deprecated by the
  theme itself; don't introduce new uses of it. Non-Hugo container syntax
  (e.g. HedgeDoc's `:::info ... :::`) is **not** recognized by
  Goldmark and renders as literal text — convert it to an alert instead.

## Commands

```sh
git submodule update --init --recursive   # required after clone/pull
hugo server                                # local preview; prints the URL to open
hugo --minify                              # production build -> ./public
```

No `hugo` install? Run `uvx hugo server` / `uvx hugo --minify` instead —
`uv` fetches Hugo on the fly and it behaves identically.

## CI/CD

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml): `pull_request`
  targeting `main` → build only, then upload `./public` as a downloadable
  workflow artifact (`site`, 7-day retention) for manual preview. No
  deploy.
- [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): `push`
  to `main` → build, upload the same `site` artifact for inspection, then
  deploy to GitHub Pages via `actions/deploy-pages`.
- Both pin `peaceiris/actions-hugo` to the Hugo version used locally via
  `uvx hugo` — bump both together when upgrading Hugo.
- Repo must have **Settings → Pages → Source: GitHub Actions** (not
  "Deploy from a branch" — that path runs Jekyll instead and will mangle
  `_index.md`-style paths).

## Conventions

- Keep this file updated when the content model, theme, or CI workflow
  changes.
