/** Loading, empty, error, banner, progress and drop-target states. */
import { createEffect, createSignal, onCleanup, Show, type Accessor, type JSX } from "solid-js";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { label } from "./labels";

/** True once `loading` has stayed true for `delayMs`; avoids a spinner flash on fast loads. */
export function useDelayedSpinner(loading: Accessor<boolean>, delayMs = 140): Accessor<boolean> {
  const [show, setShow] = createSignal(false);
  createEffect(() => {
    if (!loading()) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => setShow(true), delayMs);
    onCleanup(() => clearTimeout(t));
  });
  return show;
}

export interface LoadingProps {
  /** What is happening, as a gerund: "Extracting pitch contour". An ellipsis is added. */
  message?: JSX.Element;
  /** Small, left-aligned, no padding: for inside panels and rows. */
  inline?: boolean;
}

/** Spinning yin-yang orb with a message. */
export function Loading(props: LoadingProps) {
  return (
    <div class={`ds-loading-screen${props.inline ? " ds-loading-screen--inline" : ""}`} role="status" aria-live="polite">
      <svg class="ds-yinyang-spinner" viewBox="0 0 100 100" width="18" height="18" aria-hidden="true">
        <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#c62828" stroke-width="4" />
        <path d="M 50 4 A 46 46 0 0 1 50 96 A 23 23 0 0 1 50 50 A 23 23 0 0 0 50 4 Z" fill="#e53935" />
        <circle cx="50" cy="27" r="7.5" fill="#e53935" />
        <circle cx="50" cy="73" r="7.5" fill="#ffffff" />
      </svg>
      <span class="ds-loading-text">{props.message ?? label("loading")}…</span>
    </div>
  );
}

export function EmptyState(props: { icon?: string; style?: string | JSX.CSSProperties; children?: JSX.Element }) {
  return (
    <div class="ds-empty-state" style={props.style}>
      <Show when={props.icon}>
        <Icon name={props.icon!} />
      </Show>
      {props.children}
    </div>
  );
}

/** A failure and the way forward. */
export function ErrorRetryRow(props: { message: JSX.Element; onRetry: () => void; retryText?: string; class?: string }) {
  return (
    <div class={`ds-error-row${props.class ? ` ${props.class}` : ""}`} role="alert">
      <span class="ds-muted">{props.message}</span>
      <Button icon={<Icon name="arrow-clockwise" />} text={props.retryText ?? label("retry")} onClick={props.onRetry} />
    </div>
  );
}

export interface BannerProps {
  tone?: "info" | "ok" | "warn" | "error";
  icon?: string;
  children: JSX.Element;
  actions?: JSX.Element;
}

/** A one-line notice across a panel: "WebGPU is not available; prepare runs on the CPU." */
export function Banner(props: BannerProps) {
  return (
    <div
      class={`ds-banner${props.tone && props.tone !== "info" ? ` ds-banner--${props.tone}` : ""}`}
      role={props.tone === "error" ? "alert" : "status"}
    >
      <Show when={props.icon}>
        <Icon name={props.icon!} />
      </Show>
      <span>{props.children}</span>
      <Show when={props.actions}>
        <span class="ds-banner-actions">{props.actions}</span>
      </Show>
    </div>
  );
}

export interface ProgressBarProps {
  /** Fraction done, 0..1 (clamped). Leave undefined for an indeterminate (busy) bar. */
  value?: number;
  /** Red fill: the job failed. */
  error?: boolean;
  /** A 3px line without a border, e.g. under a download row. */
  thin?: boolean;
  "aria-label"?: string;
  class?: string;
  style?: string | JSX.CSSProperties;
}

/** A `.ds-progress-track` with a `.ds-progress-fill`; the fill slides back and forth while `value` is undefined. */
export function ProgressBar(props: ProgressBarProps) {
  const pct = () => (props.value === undefined ? undefined : Math.min(100, Math.max(0, props.value * 100)));
  const cls = () =>
    "ds-progress-track" +
    (pct() === undefined ? " ds-progress-track--indeterminate" : "") +
    (props.thin ? " ds-progress-track--thin" : "") +
    (props.error ? " ds-progress-track--error" : "") +
    (props.class ? ` ${props.class}` : "");
  return (
    <div
      class={cls()}
      style={props.style}
      role="progressbar"
      aria-label={props["aria-label"]}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={pct() === undefined ? undefined : Math.round(pct()!)}
    >
      <div class="ds-progress-fill" style={pct() === undefined ? undefined : `width: ${pct()}%`} />
    </div>
  );
}

export interface DropZoneProps {
  /** Bootstrap Icons name without `bi-`. Default "image". */
  icon?: string;
  /** Files are being dragged over it (`.ds-drop-active`). To light up the whole container instead,
   * put `ds-drop-active` on the container; see `isPointOver` in `soulwindow/runtime` for the hit test. */
  active?: boolean;
  class?: string;
  style?: string | JSX.CSSProperties;
  children?: JSX.Element;
}

/** A dashed file drop target: icon box and a line of text ("Drop an image here"). */
export function DropZone(props: DropZoneProps) {
  return (
    <div class={`ds-drop-zone${props.active ? " ds-drop-active" : ""}${props.class ? ` ${props.class}` : ""}`} style={props.style}>
      <div class="ds-drop-icon">
        <Icon name={props.icon ?? "image"} />
      </div>
      <span>{props.children}</span>
    </div>
  );
}
