import { createEffect, createSignal, For, on, onCleanup, onMount, type JSX } from "solid-js";
import type { SoulWindow } from "../../runtime/soulwindow";
import { readTokens } from "../../runtime/index.js";
import * as v from "../../vanilla/index.js";
import {
  Banner,
  Button,
  ConfirmDeleteButton,
  EmptyState,
  ErrorRetryRow,
  GroupBox,
  Icon,
  IconText,
  InputField,
  ListItem,
  Loading,
  Modal,
  SegmentedSwitch,
  Select,
  SettingsRow,
  SettingsToggleRow,
  StatCard,
  SubTabs,
  Switch,
  useSoulWindow,
} from "../../solid";
import { LcdDigits, MenuBar } from "../../solid/pro";

const TOKEN_GROUPS: [string, string[]][] = [
  ["Surfaces", ["--sys-control-bg", "--sys-window-bg", "--sys-card-bg", "--sys-menu-bg", "--sys-status-bg", "--sys-hover-bg", "--sys-bg-active"]],
  ["Text", ["--sys-control-text", "--sys-text-secondary", "--sys-text-muted", "--sys-link", "--sys-highlight-text"]],
  ["Lines", ["--sys-border-light", "--sys-border-medium", "--sys-border-dark", "--sys-border-focus", "--sys-button-border"]],
  ["Accent", ["--sys-accent", "--sys-primary", "--sys-highlight-bg", "--sys-button-hover", "--sys-button-active"]],
  ["Status", ["--sw-ok", "--sw-warn", "--sw-err", "--ds-danger-bg", "--ds-status-fresh-bg", "--ds-status-stale-bg"]],
];

function Swatch(props: { name: string; tick: number }) {
  const value = () => (props.tick, getComputedStyle(document.documentElement).getPropertyValue(props.name).trim());
  return (
    <div class="sc-token" title={`${props.name}: ${value()}`}>
      <span class="sc-chip" style={{ background: `var(${props.name})` }} />
      <span>{props.name.replace(/^--(sys|sw|ds)-/, "")}</span>
    </div>
  );
}

function Timeline(props: { tick: number }) {
  let canvas!: HTMLCanvasElement;
  const paint = () => {
    const c = readTokens("--tl-");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = c.bg!;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = c.ruler!;
    ctx.fillRect(0, 0, w, 18);
    for (let x = 0, i = 0; x < w; x += 24, i++) {
      ctx.fillStyle = i % 4 === 0 ? c.downbeat! : c.beat!;
      ctx.fillRect(x, 18, 1, h - 18);
      if (i % 4 === 0) {
        ctx.fillStyle = c.rulerText!;
        ctx.font = "10px sans-serif";
        ctx.fillText(String(i / 4 + 1), x + 3, 12);
      }
    }
    ctx.strokeStyle = c.laneBorder!;
    ctx.beginPath();
    ctx.moveTo(0, 60.5);
    ctx.lineTo(w, 60.5);
    ctx.stroke();
    ctx.fillStyle = c.waveVocal!;
    for (let x = 0; x < w; x += 2) {
      const a = 14 * Math.abs(Math.sin(x / 17) * Math.cos(x / 41));
      ctx.fillRect(x, 40 - a, 1, a * 2);
    }
    const clips: [number, number, string, string, string][] = [
      [30, 90, c.clip!, c.clipHead!, "shi"],
      [130, 70, c.clipPinned!, c.clipPinnedHead!, "ra"],
      [210, 110, c.clipSelected!, c.clipSelected!, "nai"],
      [330, 80, c.clip!, c.clipHead!, "yo"],
    ];
    for (const [x, cw, fill, head, text] of clips) {
      ctx.fillStyle = fill;
      ctx.fillRect(x, 66, cw, 26);
      ctx.fillStyle = head;
      ctx.fillRect(x, 66, cw, 4);
      ctx.fillStyle = c.clipText!;
      ctx.font = "11px sans-serif";
      ctx.fillText(text, x + 5, 85);
    }
    ctx.fillStyle = c.playhead!;
    ctx.fillRect(250, 0, 2, h);
  };
  onMount(() => {
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(canvas);
    onCleanup(() => ro.disconnect());
  });
  // Repaint when the theme or accent changes.
  createEffect(on(() => props.tick, () => requestAnimationFrame(paint), { defer: true }));
  return <canvas ref={canvas} style={{ width: "100%", height: "100%", display: "block" }} />;
}

function Daw(props: { tick: number }) {
  const [playing, setPlaying] = createSignal(false);
  const [loop, setLoop] = createSignal(true);
  return (
    <div class="daw-app sc-daw" data-density="compact">
      <MenuBar
        brand={
          <>
            <Icon name="soundwave" /> editor
          </>
        }
        menus={[
          { label: "File", items: [{ label: "Open folder…", shortcut: "Ctrl+O", action: () => {} }, { label: "Save", shortcut: "Ctrl+S", action: () => {} }, "separator", { label: "Export…", action: () => {}, disabled: true }] },
          { label: "Edit", items: [{ label: "Undo", shortcut: "Ctrl+Z", action: () => {} }, { label: "Redo", shortcut: "Ctrl+Y", action: () => {} }] },
          { label: "View", items: [{ label: "Loop playback", checked: loop(), action: () => setLoop(!loop()) }, { label: "Snap to beats", checked: true, action: () => {} }] },
        ]}
      >
        <span class="daw-doc-title">
          <span class="daw-dirty-dot" /> song.json <span class="daw-doc-path">~/songs/demo</span>
        </span>
      </MenuBar>
      <div class="daw-transport">
        <div class="daw-transport-group">
          <button class="daw-tbtn" title="To start">
            <Icon name="skip-start-fill" />
          </button>
          <button class="daw-tbtn daw-tbtn-play" classList={{ "daw-on": playing() }} onClick={() => setPlaying(!playing())} title="Play">
            <Icon name={playing() ? "pause-fill" : "play-fill"} />
          </button>
          <button class="daw-tbtn" classList={{ "daw-on": loop() }} onClick={() => setLoop(!loop())} title="Loop">
            <Icon name="repeat" />
          </button>
        </div>
        <div class="daw-lcd">
          <div class="daw-lcd-glass">
            <span class="daw-lcd-ann daw-lcd-ann--on">{playing() ? "PLAY" : "STOP"}</span>
            <span class="daw-lcd-main">
              <LcdDigits text="01:23.45" />
            </span>
            <span class="daw-lcd-sub">
              <span class="daw-lcd-label">BAR</span>
              <LcdDigits text="012.3" />
              <span class="daw-lcd-label">BPM</span>
              <span class="daw-lcd-amber">
                <LcdDigits text="128.0" />
              </span>
            </span>
          </div>
        </div>
        <div class="daw-transport-spacer" />
        <div class="daw-transport-group">
          <span class="daw-chip daw-chip--ok">GPU</span>
          <span class="daw-chip daw-chip--warn">UNSAVED</span>
          <button class="daw-tbtn daw-tbtn--accent">
            <Icon name="magic" /> Solve
          </button>
        </div>
      </div>
      <div class="daw-upper">
        <div class="daw-dock">
          <div class="daw-tabs">
            <span class="daw-tab daw-tab--active">
              Project <span class="daw-tab-count">12</span>
            </span>
            <span class="daw-tab">Lyrics</span>
          </div>
          <div class="daw-panel-body">
            <ListItem selected title={<div class="ds-item-title">Verse 1</div>} body={<div class="ds-item-meta">00:12 – 00:41</div>} onClick={() => {}} />
            <ListItem title={<div class="ds-item-title">Chorus</div>} body={<div class="ds-item-meta">00:41 – 01:05</div>} onClick={() => {}} />
          </div>
        </div>
        <div class="daw-center">
          <div class="daw-panel-title">
            Program monitor
            <span class="daw-panel-title-actions">
              <Button size="icon-sm" icon={<Icon name="fullscreen" />} title="Fullscreen" />
            </span>
          </div>
          <div class="daw-panel-body" style={{ display: "grid", "place-items": "center" }}>
            <Loading inline message="Extracting pitch contour" />
          </div>
        </div>
        <div class="daw-dock" style={{ width: "220px" }}>
          <div class="daw-panel-title">Inspector</div>
          <div class="daw-panel-body">
            <SettingsToggleRow label="Pinned" checked={true} onChange={() => {}} />
            <SettingsRow label="Offset" stacked>
              <InputField value="0.120" noClear />
            </SettingsRow>
          </div>
        </div>
      </div>
      <div class="daw-splitter" />
      <div class="daw-timeline-panel" style={{ height: "100px" }}>
        <div class="daw-timeline">
          <Timeline tick={props.tick} />
        </div>
      </div>
      <div class="daw-statusbar">
        <span class="daw-status-cell">
          <span class="daw-status-dot" /> Ready
        </span>
        <span class="daw-status-cell daw-status-cell--grow">
          <span class="daw-status-msg">Solved 128 syllables in 1.4 s</span>
        </span>
        <span class="daw-status-cell">48 kHz</span>
      </div>
    </div>
  );
}

function VanillaDemo() {
  let host!: HTMLDivElement;
  onMount(() => {
    const box = v.groupBox({ title: "Built with soulwindow/vanilla", icon: "code-slash", actions: [v.button({ text: "Action" })] });
    const row = document.createElement("div");
    row.className = "sc-row";
    row.append(
      v.button({ text: "Save", icon: "save", variant: "primary" }),
      v.button({ icon: "gear", title: "Settings" }),
      v.toggle({ checked: true, label: "Enabled" }),
      v.segmented({ value: "grid", options: [{ value: "grid", icon: "grid" }, { value: "list", icon: "list" }], ariaLabel: "Layout" }),
    );
    box.body.append(row, v.banner({ text: "Same markup as the Solid components.", tone: "ok", icon: "check-circle" }));
    host.append(box.root);
  });
  return <div ref={host} />;
}

export function App(props: { sw: SoulWindow }): JSX.Element {
  const s = useSoulWindow(props.sw);
  const [tab, setTab] = createSignal<"all" | "reading" | "done">("all");
  const [view, setView] = createSignal<"grid" | "list">("grid");
  const [toggle, setToggle] = createSignal(true);
  const [collapsed, setCollapsed] = createSignal(false);
  const [modal, setModal] = createSignal(false);
  const [query, setQuery] = createSignal("");
  const tick = () => `${s.theme()}|${s.accent()}|${s.density()}`.length + Math.random();

  return (
    <>
      <div class="sc-toolbar">
        <span class="sc-brand">SoulWindow</span>
        <Select
          aria-label="Theme"
          value={s.theme()}
          options={Object.entries(props.sw.themes).map(([id, t]) => ({ value: id, label: t.label }))}
          onChange={(id) => props.sw.setTheme(id)}
        />
        <SegmentedSwitch
          aria-label="Density"
          value={s.density()}
          onChange={(d) => props.sw.setDensity(d)}
          options={[
            { value: "compact", text: "Compact" },
            { value: "comfortable", text: "Desktop" },
            { value: "touch", text: "Touch" },
          ]}
        />
        <span class="sc-swatches" role="group" aria-label="Accent colour">
          <For each={props.sw.kit.PRESETS}>
            {(p) => (
              <button
                class="sc-swatch"
                style={{ background: p.hex }}
                title={p.label}
                aria-label={p.label}
                aria-pressed={s.accent() === p.id}
                onClick={() => props.sw.setAccent(p.id)}
              />
            )}
          </For>
        </span>
      </div>

      <div class="sc-page">
        <SubTabs
          tabs={[
            { id: "all", label: "All", icon: "bi-collection", count: 128 },
            { id: "reading", label: "Reading", icon: "bi-book", count: 7 },
            { id: "done", label: "Finished", icon: "bi-check2-all", count: 42 },
          ]}
          activeTab={tab()}
          onSwitch={setTab}
          right={
            <>
              <InputField placeholder="Search" value={query()} onInput={setQuery} wrapperClass="sc-search" />
              <SegmentedSwitch
                aria-label="Layout"
                value={view()}
                onChange={setView}
                options={[
                  { value: "grid", icon: <Icon name="grid" />, title: "Grid" },
                  { value: "list", icon: <Icon name="list" />, title: "List" },
                ]}
              />
            </>
          }
        />

        <div class="sc-grid">
          <GroupBox title={<IconText icon={<Icon name="hand-index" />}>Buttons</IconText>}>
            <div class="sc-row">
              <Button text="Default" />
              <Button variant="primary" icon={<Icon name="save" />} text="Primary" />
              <Button active text="Active" />
              <Button disabled text="Disabled" />
              <Button loading text="Loading" />
            </div>
            <div class="sc-row">
              <Button size="sm" text="Small" />
              <Button size="xs" text="Extra small" />
              <Button icon={<Icon name="gear" />} title="Icon button" />
              <Button size="icon-sm" icon={<Icon name="x-lg" />} title="Small icon" />
              <ConfirmDeleteButton icon={<Icon name="trash" />} text="Delete" onConfirm={() => {}} />
            </div>
          </GroupBox>

          <GroupBox
            title={<IconText icon={<Icon name="input-cursor-text" />}>Inputs</IconText>}
            actions={<Button size="xs" text="Reset" onClick={() => setQuery("")} />}
          >
            <InputField placeholder="Type to see the clear button" value={query()} onInput={setQuery} />
            <div class="sc-row">
              <Select
                value="en"
                aria-label="Language"
                options={[
                  { value: "en", label: "English" },
                  { value: "ja", label: "日本語" },
                ]}
              />
              <Switch checked={toggle()} onChange={setToggle} label="Toggle" />
              <Switch checked={false} disabled label="Disabled" />
            </div>
            <SegmentedSwitch
              fill
              value={view()}
              onChange={setView}
              options={[
                { value: "grid", icon: <Icon name="grid" />, text: "Grid" },
                { value: "list", icon: <Icon name="list" />, text: "List" },
              ]}
            />
          </GroupBox>

          <GroupBox
            title={<IconText icon={<Icon name="sliders" />}>Settings rows</IconText>}
            collapsible
            collapsed={collapsed()}
            onToggle={() => setCollapsed(!collapsed())}
          >
            <SettingsToggleRow label="Open chapters in the reader" desc="Otherwise they open in the browser." checked={toggle()} onChange={setToggle} />
            <SettingsRow label="Reading direction" desc="Right to left for manga." divider>
              <SegmentedSwitch
                value="rtl"
                options={[
                  { value: "ltr", text: "LTR" },
                  { value: "rtl", text: "RTL" },
                  { value: "ttb", text: "Vertical" },
                ]}
              />
            </SettingsRow>
          </GroupBox>

          <GroupBox title={<IconText icon={<Icon name="list-ul" />}>List items</IconText>}>
            <ListItem
              followed
              followedTitle="Followed"
              leading={<div class="sc-cover" />}
              title={<div class="ds-item-title">A followed series</div>}
              body={
                <div class="sc-row" style={{ "margin-top": "4px" }}>
                  <span class="tag-pill tag-character">character</span>
                  <span class="tag-pill tag-artist">artist</span>
                  <span class="tag-pill tag-status">ongoing</span>
                </div>
              }
              actions={
                <>
                  <Button icon={<Icon name="bookmark" />} title="Bookmark" />
                  <Button icon={<Icon name="download" />} text="Get" />
                </>
              }
              onClick={() => {}}
            />
            <ListItem read leading={<div class="sc-cover" />} title={<div class="ds-item-title">A read chapter</div>} body={<div class="ds-item-meta">Read 2 days ago</div>} onClick={() => {}} />
          </GroupBox>

          <GroupBox title={<IconText icon={<Icon name="chat-square-text" />}>Feedback</IconText>}>
            <Banner tone="warn" icon="exclamation-triangle" actions={<Button size="xs" text="Details" />}>
              WebGPU is not available; prepare runs on the CPU.
            </Banner>
            <Banner tone="error" icon="x-octagon">
              Access to the library was lost. Reopen it.
            </Banner>
            <Banner tone="ok" icon="check-circle">
              Saved.
            </Banner>
            <ErrorRetryRow message="The server did not answer." onRetry={() => {}} />
            <Loading inline message="Downloading model" />
          </GroupBox>

          <GroupBox title={<IconText icon={<Icon name="bar-chart" />}>Stats, tags, dialogs</IconText>}>
            <div class="sc-row">
              <StatCard value="1,284" label="Chapters" />
              <StatCard value="96%" label="Cached" variant="success" />
              <StatCard value="3" label="Failed" variant="danger" />
            </div>
            <div class="sc-row">
              <For each={["character", "copyright", "meta", "artist", "pairing", "status", "rank-3"]}>
                {(t) => <span class={`tag-pill tag-${t}`}>{t}</span>}
              </For>
            </div>
            <div class="sc-row">
              <Button variant="primary" text="Open dialog" onClick={() => setModal(true)} />
              <span class="ds-muted">Escape or the backdrop closes it.</span>
            </div>
          </GroupBox>
        </div>

        <GroupBox title={<IconText icon={<Icon name="soundwave" />}>Pro layer (DAW / NLE), compact density</IconText>}>
          <Daw tick={tick()} />
        </GroupBox>

        <div class="sc-grid">
          <VanillaDemo />
          <GroupBox title={<IconText icon={<Icon name="palette" />}>Tokens</IconText>}>
            <For each={TOKEN_GROUPS}>
              {([name, list]) => (
                <>
                  <div class="ds-label-sm">{name}</div>
                  <div class="sc-tokens">
                    <For each={list}>{(t) => <Swatch name={t} tick={tick()} />}</For>
                  </div>
                </>
              )}
            </For>
          </GroupBox>
        </div>

        <EmptyState icon="inbox">Nothing here yet.</EmptyState>
      </div>

      <Modal
        open={modal()}
        title={<IconText icon={<Icon name="gear" />}>Settings</IconText>}
        width={420}
        onClose={() => setModal(false)}
        footer={
          <>
            <Button text="Cancel" onClick={() => setModal(false)} />
            <Button variant="primary" text="OK" onClick={() => setModal(false)} />
          </>
        }
      >
        <SettingsToggleRow label="Example setting" desc="Dialogs become full-screen sheets in touch density." checked={toggle()} onChange={setToggle} />
        <SettingsRow label="Name" divider stacked>
          <InputField placeholder="Name" autofocus />
        </SettingsRow>
      </Modal>
    </>
  );
}
