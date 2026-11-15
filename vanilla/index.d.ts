export type ButtonSize = "compact" | "sm" | "xs" | "icon" | "icon-sm";

export function icon(name: string): HTMLElement;
export function button(opts: {
  text?: string | Node;
  icon?: string | Node;
  title?: string;
  ariaLabel?: string;
  size?: ButtonSize;
  variant?: "default" | "primary" | "danger";
  active?: boolean;
  disabled?: boolean;
  class?: string;
  onClick?: (ev: MouseEvent) => void;
}): HTMLButtonElement;
export function iconText(iconName: string, text: string | Node): HTMLSpanElement;
export function groupBox(opts: { title: string | Node; icon?: string; actions?: HTMLElement[]; class?: string }): {
  root: HTMLDivElement;
  body: HTMLDivElement;
};
export function toggle(opts: {
  checked?: boolean;
  label?: string | Node;
  ariaLabel?: string;
  title?: string;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}): HTMLButtonElement & { set(checked: boolean): void };
export function segmented<T extends string>(opts: {
  value: T;
  options: { value: T; text?: string; icon?: string; title?: string }[];
  onChange?: (value: T) => void;
  fill?: boolean;
  ariaLabel?: string;
}): HTMLDivElement & { set(value: T): void };
export function banner(opts: { text: string | Node; tone?: "info" | "ok" | "warn" | "error"; icon?: string; actions?: HTMLElement[] }): HTMLDivElement;
export function loading(message?: string, inline?: boolean): HTMLDivElement;
export function progressBar(opts?: { value?: number; thin?: boolean; error?: boolean; ariaLabel?: string; class?: string }): HTMLDivElement & {
  set(value?: number): void;
};
export function dropZone(opts?: { text?: string | Node; icon?: string; active?: boolean; class?: string }): HTMLDivElement & {
  setActive(on: boolean): void;
};
export interface SeekBarMark {
  value: number;
  /** Tooltip of the mark. */
  title?: string;
}
/** `.daw-seek` (pro layer): same markup and behaviour as SeekBar in soulwindow/solid/pro. */
export function seekBar(opts: {
  /** Last position (e.g. frame count − 1); 0 makes the bar inert. */
  max: number;
  /** Current position, 0..max (default 0). */
  value?: number;
  marks?: SeekBarMark[];
  /** Hover tip text and screen-reader value, e.g. "Frame 40 · 0:01.33". No tip without it. */
  format?: (value: number) => string;
  /** Every change while dragging or stepping (the bar has already moved). */
  onInput: (value: number) => void;
  onScrubStart?: () => void;
  onScrubEnd?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  class?: string;
}): HTMLDivElement & {
  set(value: number): void;
  setMax(max: number): void;
  setMarks(marks: SeekBarMark[]): void;
  setDisabled(on: boolean): void;
};
