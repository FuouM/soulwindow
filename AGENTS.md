# SoulWindow: rules for agents

These rules apply in this repo **and** in every app that uses SoulWindow (DynastyReader, Lyric-Sync, probable-video-editor, Project-Curator). Copy the "In an app" section into each app's AGENTS.md / CLAUDE.md.

## In an app

- **Import, never copy.** `import "soulwindow/css"`, `soulwindow/solid`, `soulwindow/vanilla`, `soulwindow/runtime`. Do not copy SoulWindow CSS or components into the app. The drift this repo exists to end came from copies.
- **Colours come from tokens.** No hex/rgb in app CSS or components; use `var(--sys-*)`, `var(--sw-*)` and the other tokens. Canvas code uses `readTokens()`.
- **Sizes come from density.** Use `var(--sw-control-h)`, `var(--sw-icon-btn)`, `var(--sw-row-action)` etc. Do not write per-context `!important` size overrides (`#app[data-mobile] .x .win-button { width: 32px !important }`); change density or add a token upstream.
- **App CSS goes in `@layer app`.** No unlayered rules, no `!important` to win a specificity fight.
- **z-index only from `--z-*`.**
- **Use the existing primitive** before making a new one: `.win-button` (not `.daw-btn`, not `.nle-modal-btn`), `.group-box` (not cards), `.ds-modal-*` (not a custom dialog), `.ds-segmented-switch` (not a custom radio row).
- **Missing something?** Add it here first (component + tokens + showcase entry), tag a release, then bump the app. If that is not possible right now, put it in the app's `@layer app` with a `TODO(soulwindow):` comment so it can be moved up.

## In this repo

- Every component works in all three themes and all three densities; check the showcase in each (`npm run screenshots`).
- Themes change colours only; density changes sizes only. A component never has `[data-theme=…]` selectors: if a theme needs a different value, add a component token (`--sw-groupbox-title-bg`) and set it in the theme file. (The one exception is high-contrast focus/hover text that must be pure black or white.)
- `runtime/color-kit.js` must stay self-contained (it is serialised into the `<head>` boot script). Plain ES5-ish JS, no imports, no outside references.
- `runtime/*.js` and `vanilla/*.js` are plain JS with hand-written `.d.ts` beside them, so Node can load them (Vite config) without a build. Keep the `.d.ts` in step.
- Solid components get no app dependencies: no i18n library (use `label()` / `setLabels()`), no platform stores (use `isTouch()`), no `@solid-primitives`.
- Class names: keep the shared vocabulary (`win-button`, `group-box`, `input-field`, `tag-pill`, `ds-*`, `daw-*` in pro). New generic utilities use `sw-`.
- `npm run check` must pass. The test suite rejects hex colours in CSS outside `tokens.css`, `themes/` and the VFD glass in `pro/daw.css`.
- Releases are git tags (`v0.2.0`); apps pin a tag. Note breaking class or token renames in the tag message.
