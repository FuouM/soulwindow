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
