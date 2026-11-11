# SoulWindow

The WinForms-style design system shared by **DynastyReader**, **Lyric-Sync**, **probable-video-editor** and **Project-Curator**: dense, flat, 1px borders, Segoe UI, group boxes rather than cards, no emoji.

One set of tokens and themes, one cascade-layer order, and one class vocabulary (`.win-button`, `.group-box`, `.input-field`, `.ds-modal-*` …). Solid components and plain-DOM helpers render the same markup on top of it, and a pro layer adds the DAW/NLE editor chrome.

```
css/          tokens, themes, density, reset, base, components, mobile, utilities   (framework-free)
css/pro/      daw.css: menu bar, transport, VFD readout, docks, tabs, splitter, timeline frame, status bar
runtime/      theme / accent / density controller, pre-paint boot script, Vite plugin, readTokens(), seg7
solid/        Solid components: Button, GroupBox, InputField, SubTabs, Modal, ListItem, SettingsRow, Feedback …
solid/pro/    MenuBar, LcdDigits
vanilla/      DOM factories with the same markup, for apps without a framework
showcase/     every component in every theme and density (npm run dev)
```

## Use it

```sh
npm install github:FuouM/soulwindow#v0.1.0     # or: bun add github:FuouM/soulwindow#v0.1.0
```

```ts
// vite.config.ts: paints the saved theme before first paint (no white flash in dark mode)
import { soulwindow } from "soulwindow/vite";
export default defineConfig({ plugins: [solid(), soulwindow({ storagePrefix: "myapp-" })] });
```

```ts
// main.tsx
import "bootstrap-icons/font/bootstrap-icons.css";
import "soulwindow/css";
import "soulwindow/css/pro/daw.css"; // editors only
import { createSoulWindow } from "soulwindow/runtime";

export const sw = createSoulWindow({ storagePrefix: "myapp-", density: "auto" }); // same options as the plugin
```

```tsx
import { Button, GroupBox, IconText, Icon, useSoulWindow } from "soulwindow/solid";

const s = useSoulWindow(sw);         // s.theme(), s.accent(), s.density(), s.isDark()
sw.setTheme("dark");                 // light | dark | high-contrast | windows7
sw.setAccent("pink");                // preset id or any hex
sw.setDensity("touch");              // compact | comfortable | touch

<GroupBox title={<IconText icon={<Icon name="gear" />}>General</IconText>}>
  <Button variant="primary" text="Save" />
</GroupBox>
```

Without Solid:

```ts
import { button, groupBox } from "soulwindow/vanilla";
const box = groupBox({ title: "General", icon: "gear" });
box.body.append(button({ text: "Save", variant: "primary", onClick: save }));
```

Canvas code (timelines, waveforms) reads colours from tokens, so it follows themes too:

```ts
import { readTokens } from "soulwindow/runtime";
let tl = readTokens("--tl-");          // { bg, laneAlt, clip, clipHead, playhead, … }
sw.subscribe(() => (tl = readTokens("--tl-"), repaint()));
```

## The three axes

| Axis | Set by | Changes | Values |
|---|---|---|---|
| Theme | `data-theme` on `<html>` | colours only | `light`, `dark`, `high-contrast`, `windows7` |
| Accent | inline custom properties from the runtime | `--sys-primary`, highlight, focus, link, `--ds-accent-*` | 10 presets or any hex |
| Density | `data-density` on `<html>` or any container | sizes only | `compact` (DAW), none (desktop), `touch` (phones) |

They are independent: any theme with any accent at any density. An editor can sit at `compact` inside a page at desktop density (the showcase does this).

## Tokens

| Prefix | What | Notes |
|---|---|---|
| `--sys-*` | system colours | The public colour API. Use these. |
| `--sw-*` | density sizes, component tokens, generic status (`--sw-ok/warn/err`) | New in SoulWindow. |
| `--space-*`, `--font-*`, `--radius-*`, `--z-*` | scales | `--z-*` is the only allowed source of global z-index. |
| `--ds-*` | status / danger backgrounds, accent tints | DynastyReader's names, kept for compatibility. Do not add more. |
| `--tag-*` | tag taxonomy for `.tag-pill` | |
| `--tl-*`, `--lcd-*` | pro: timeline canvas, VFD readout | |

## Cascade layers

`layers.css` declares the order once:

```
tokens → themes → density → reset → base → layout → components → pro → app → utilities → mobile
```

Put app styles in `@layer app { … }`. Unlayered CSS beats every layer, so it overrides SoulWindow by accident; keep it for real emergencies.

## Develop

```sh
npm install
npm run dev              # showcase on localhost
npm run check            # typecheck + tests (tests include: no hex colours outside tokens/themes)
npm run build:showcase && npm run screenshots   # PNGs of every theme × density into screenshots/
```

The migration plan for each app is in [docs/migration.md](docs/migration.md). Rules for coding agents are in [AGENTS.md](AGENTS.md).
