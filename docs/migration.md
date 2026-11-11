# Moving the four apps onto SoulWindow

Order: safest first. Each step is its own PR in that app's repo, pinned to a SoulWindow tag, with screenshots of the app before and after.

## What exists today

| App | Stack | Style source | State |
|---|---|---|---|
| DynastyReader | Solid | `src/styles/` (origin of SoulWindow) | Most complete: light, dark, high contrast, plus a Windows 7 Aero add-on, accent, UI scale, mobile. Per-context `!important` size overrides throughout `mobile.css`, `browse.css`, `cache.css`. Accent maths duplicated in `index.html` and `stores/accent-color.ts`, already drifted (head script has no high-contrast / Windows 7 rules). |
| Lyric-Sync `web/` | Solid | copy of DR's styles + `daw.css` (2.6k lines) | `tokens.css` identical to DR's; ~5.4k lines of DR CSS copied but never imported (`reader`, `browse`, `library`, `cache`, `mobile`, `settings`). `daw.css` re-implements buttons (`.daw-btn`, `.daw-seg`, `.daw-icon-btn`). |
| probable-video-editor `app/` | plain TS | own `daw.css` (1.6k lines) | Own `--sys-*` values that **collide in meaning** (`--sys-border-light` is a dark grey there, the bevel highlight in DR). Dark only. Seven-segment code duplicated from Lyric-Sync as HTML strings. |
| Curator dashboard | plain TS | `styles/*.css` | 20 hard-coded `--sys-*` (light only). Own scales: `--space-xs…`, `--text-*` 9/11/13/15px, `--z-modal: 9999`. |
| Curator `plugins/dynasty-scans` | Solid | fork of DR's styles | Hundreds of lines diverged from DR. |

## 1. DynastyReader (first user; no visual change)

1. `npm i github:FuouM/soulwindow#v0.1.0`; add `soulwindow({ storagePrefix: "ds-", metaId: "ds-theme-color-meta", density: "comfortable", themes })` to `vite.config.ts`, with `themes` = `DEFAULT_THEMES` plus DR's `windows7` entry (see step 3). `storagePrefix: "ds-"` keeps users' saved theme and accent.
2. Delete both `<script>` blocks and the inline `<style>` from `index.html` (the plugin injects the boot script). Delete `lib/color.ts`; `stores/theme.ts` and `stores/accent-color.ts` become thin wrappers over `createSoulWindow({ storagePrefix: "ds-", legacyClassPrefix: "ds-" })` + `useSoulWindow`, keeping their exported names so call sites do not change. `ACCENT_COLOR_PRESETS` = `sw.kit.PRESETS`.
3. In `main.tsx` replace `tokens.css`, `themes/dark.css`, `themes/high-contrast.css`, `reset.css`, `curator-ui-base.css` with `import "soulwindow/css"`. Keep the view CSS.
   Windows 7 stays in DR as an add-on theme (SoulWindow core does not ship it): register it through the `themes` option (`family: "light"`), keep `themes/windows7.css` and `themes/windows7-aero.css` in `@layer app`, and move the Win7 accent rules and the `--ds-accent-*` Aero tints (aero, active/hover/subtab gradients, badge, box, wall, topbar, taskbar) out of `stores/accent-color.ts` into a DR `aero-accent.ts` that sets them from `sw.kit` on `sw.subscribe()`.
4. Rename the `reader` layer to `app` in DR's CSS (`@layer reader` → `@layer app`) and drop DR's own `@layer …` order statements (SoulWindow declares the order).
5. Move the reader-only tokens that SoulWindow dropped into an `app`-layer block in DR: `--ds-reader-*`, `--sys-reader-viewport-bg`, `--ds-followed-corner*` (per theme).
6. Set density from the platform: `sw.setDensity(isMobile() ? "touch" : "comfortable")`. Then delete the `#ds-root[data-mobile] … .win-button { width: 24px !important … }` blocks one by one, checking screenshots: most are already what the density tokens give.
7. Replace `components/Button|GroupBox|InputField|SubTabs|Modal|ListItem|SettingsRow|Feedback.tsx` with re-exports from `soulwindow/solid` (prop renames: `className`→`class`, `cssText`→`style`, `DsSwitch`→`Switch`, `DsSelect`→`Select`, `Loading` takes no random message (pass `getRandomLoadingMessage()`), `EmptyState iconName`→`icon`). Call `setLabels({ close: t("common.close"), … })` when the language changes. DR-only buttons (`AddToCollectionButton`, `ExternalLinkButton`, `BlacklistModeSwitch` …) stay in DR, built on SoulWindow's `Button`.
8. Compare screenshots of every view in every theme, desktop and Android, before and after (DR already has puppeteer).

## 2. Lyric-Sync

1. Delete the unused copies: `styles/reader.css`, `browse.css`, `library.css`, `cache.css`, `mobile.css`, `settings.css`; then `tokens.css`, `themes/`, `reset.css`, `curator-ui-base.css`, `utilities.css`, and most of `index.css`.
2. `import "soulwindow/css"; import "soulwindow/css/pro/daw.css";`, Vite plugin with `density: "compact"`.
3. In `daw.css` delete what pro now covers (menu bar, transport, LCD, seg7, docks, tabs, splitter, track headers, status bar) and the button copies; `.daw-btn` → `.win-button`, `.daw-seg`/`.daw-seg-btn` → `.ds-segmented-switch`/`.ds-segmented-btn`, `.daw-icon-btn` → `.win-button.ds-btn-icon-sm`, `.status-strip`/`.status-cell`/`.status-dot` → `.daw-statusbar`/`.daw-status-cell`/`.daw-status-dot`, `.daw-lcd-clean` → `.daw-lcd-amber`, `.daw-tbtn-play` stays. What remains (program monitor, inspector, wizard) moves to `@layer app`.
4. `components/MenuBar.tsx`, `LcdDigits.tsx` → `soulwindow/solid/pro` (`MenuBar` takes the logo as `brand`). `Button`, `GroupBox`, `SubTabs`, `Modal`, `ListItem`, `SettingsRow`, `Feedback` → `soulwindow/solid`.
5. `TimelineCanvas`: replace `C_DARK` / `C_LIGHT` with `readTokens("--tl-")` (names map 1:1: `clipFree`→`clip`, `clipFreeAlt`→`clipAlt`, `clipFreeHead`→`clipHead`, `clipSel`→`clipSelected`, `mixWave`→`waveMix`, `vocalWave`→`waveVocal`; `wordHeadText` becomes `clipText`). The timeline then follows high contrast and Windows 7 too.

## 3. probable-video-editor

1. Delete the `:root { --sys-* … }` block in `app/src/ui/daw.css`. Its names now mean SoulWindow's values; check the places that used `--sys-border-light` / `--sys-text-muted` / `--sys-raised*` (PVE-only) and switch them to `--sys-border-medium`, `--sys-button-bg`, `--sys-button-hover`.
2. `import "soulwindow/css"; import "soulwindow/css/pro/daw.css";` and the Vite plugin (`density: "compact"`, `defaultTheme: "dark"`). Light and high contrast now work.
3. `--tl-*` timeline names: `--tl-clip-free` → `--tl-clip`, `--tl-clip-free-head` → `--tl-clip-head`, `--tl-wave-*` and `--tl-playhead` are the same; `--tl-header-bg`/`--tl-ruler-bg` → `--tl-ruler`. Keep PVE-only ones (`--tl-clip-dirty-*`, `--tl-clip-reloaded-*`) in `@layer app`.
4. `transport.ts` seven-segment strings → `seg7Html()` from `soulwindow/runtime`.
5. `.nle-modal-*` → `.ds-modal-*`, `.nle-chip--*` → `.daw-chip--*`, `.nle-menubar`/`.nle-menu-item` → `.daw-menubar`/`.daw-menu-item`, `.nle-modal-btn` → `.win-button`. Use `soulwindow/vanilla` for new DOM.

## 4. Project-Curator

1. Dashboard: delete the `:root` block in `styles/base.css`, import `soulwindow/css`, add the Vite plugin. Dark, high contrast and accent come for free.
2. Scale renames (search-and-replace): `--space-xs/sm/md/lg/xl/2xl` → `--space-1/2/4/5/6` and `24px`; `--text-sm/md` → `--font-sm/--font-lg`; `--z-modal: 9999` / `--z-viewer` / `--z-tooltip` → `--z-modal` / `--z-sheet` / `--z-tooltip`; `--sys-text-subtle` → `--sys-text-muted`. `--text-xs` (9px) and `--text-lg` (15px) have no equivalent: check each use (likely `--font-xs`, and a heading size added to SoulWindow if needed).
3. `components/button.ts`, `group-box.ts`, `input-field.ts` → `soulwindow/vanilla`. They already emit the same class names.
4. Hard-coded light colours in `tags.css`, `gallery.css` (e.g. `.tag-pill-overflow { background: #f0f0f0 }`) → tokens.
5. `plugins/dynasty-scans`: delete its style fork and import `soulwindow/css` plus DynastyReader's view CSS; longer term, share DR's view components instead of a second copy.

## After all four

- Add the "In an app" section of SoulWindow's AGENTS.md to each app's AGENTS.md / CLAUDE.md.
- Add a lint step to each app: no hex in app CSS, no `!important` on sizes, no unlayered rules.
- Hotkey registry (DR's `src/hotkeys/`) is the next shared piece: Lyric-Sync's spec already wants it.
