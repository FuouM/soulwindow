/** Seek bar for `.daw-seek` (pro layer), after pve-next's player bar: the fill runs
 * to the current position among the integer positions 0..max (frames), marks
 * flag positions (a key frame, in/out points), and a tip follows the pointer.
 * Drag or click to seek; arrows step one position, Page Up/Down ten, Home/End jump. */
import { createSignal, For, Show } from "solid-js";

export interface SeekBarMark {
  value: number;
  /** Tooltip / accessible name of the mark. */
  title?: string;
}

export interface SeekBarProps {
  /** Current position, 0..max. */
  value: number;
  /** Last position (e.g. frame count − 1); 0 makes the bar inert. */
  max: number;
  marks?: SeekBarMark[];
  /** Every change while dragging or stepping. */
  onInput: (value: number) => void;
  /** Drag start / end, e.g. to pause playback while scrubbing and resume after. */
  onScrubStart?: () => void;
  onScrubEnd?: () => void;
  /** Text of the hover tip and screen-reader value for a position, e.g. "Frame 40 · 0:01.33". */
  format?: (value: number) => string;
  disabled?: boolean;
  class?: string;
  "aria-label"?: string;
}

export function SeekBar(props: SeekBarProps) {
  let el!: HTMLDivElement;
  const [hover, setHover] = createSignal<number | null>(null);
  const [dragging, setDragging] = createSignal(false);
  const clampValue = (v: number) => Math.min(props.max, Math.max(0, Math.round(v)));
  const pct = (v: number) => (props.max > 0 ? (clampValue(v) / props.max) * 100 : 0);
  const inert = () => props.disabled || props.max <= 0;
  const emit = (v: number) => {
    const next = clampValue(v);
    if (next !== props.value) props.onInput(next);
  };
  const at = (ev: PointerEvent) => {
    const r = el.getBoundingClientRect();
    return clampValue(((ev.clientX - r.left) / Math.max(r.width, 1)) * props.max);
  };
  const end = (ev: PointerEvent) => {
    if (!el.hasPointerCapture(ev.pointerId)) return;
    el.releasePointerCapture(ev.pointerId);
    setDragging(false);
    props.onScrubEnd?.();
  };

  return (
    <div
      ref={el}
      class={`daw-seek${props.class ? ` ${props.class}` : ""}`}
      classList={{ "is-dragging": dragging() }}
      role="slider"
      tabIndex={inert() ? -1 : 0}
      aria-label={props["aria-label"]}
      aria-valuemin={0}
      aria-valuemax={props.max}
      aria-valuenow={props.value}
      aria-valuetext={props.format?.(props.value)}
      aria-disabled={inert() ? "true" : undefined}
      onPointerDown={(ev) => {
        if (inert() || ev.button !== 0) return;
        el.setPointerCapture(ev.pointerId);
        el.focus();
        setDragging(true);
        props.onScrubStart?.();
        emit(at(ev));
      }}
      onPointerMove={(ev) => {
        if (inert()) return;
        const v = at(ev);
        setHover(v);
        if (el.hasPointerCapture(ev.pointerId)) emit(v);
      }}
      onPointerLeave={() => setHover(null)}
      onPointerUp={end}
      onPointerCancel={end}
      onKeyDown={(ev) => {
        if (inert()) return;
        const step = { ArrowLeft: -1, ArrowRight: 1, ArrowDown: -1, ArrowUp: 1, PageDown: -10, PageUp: 10 }[ev.key];
        if (step !== undefined) emit(props.value + step);
        else if (ev.key === "Home") emit(0);
        else if (ev.key === "End") emit(props.max);
        else return;
        ev.preventDefault();
        ev.stopPropagation();
      }}
    >
      <div class="daw-seek-fill" style={{ width: `${pct(props.value)}%` }} />
      <For each={props.marks ?? []}>{(m) => <div class="daw-seek-mark" style={{ left: `${pct(m.value)}%` }} title={m.title} />}</For>
      <Show when={props.format && (dragging() ? props.value : hover()) !== null}>
        <div class="daw-seek-tip" style={{ left: `${Math.min(94, Math.max(6, pct(dragging() ? props.value : hover()!)))}%` }}>
          {props.format!(dragging() ? props.value : hover()!)}
        </div>
      </Show>
    </div>
  );
}
