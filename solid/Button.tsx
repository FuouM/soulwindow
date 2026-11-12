/**
 * Buttons: Button (`.win-button`), ConfirmDeleteButton (two clicks), IconText, SegmentedSwitch,
 * Switch, Select and StatCard. Ported from DynastyReader's Button.tsx.
 */
import { createEffect, createSignal, For, onCleanup, type JSX } from "solid-js";
import { Icon } from "./Icon";
import { isTouch, label } from "./labels";

export type ButtonSize = "compact" | "sm" | "xs" | "icon" | "icon-sm";

export interface ButtonProps {
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void);
  id?: string;
  /** Extra classes. A ds-btn-* size class here overrides `size`. */
  class?: string;
  classList?: Record<string, boolean>;
  style?: string | JSX.CSSProperties;
  /** Default: "icon" for icon-only buttons, "compact" otherwise. */
  size?: ButtonSize;
  variant?: "default" | "primary" | "danger";
  /** Pressed / selected look (`.active`). */
  active?: boolean;
  title?: string;
  "aria-label"?: string;
  role?: JSX.AriaAttributes["role"];
  "aria-checked"?: boolean;
  "aria-pressed"?: boolean;
  "aria-selected"?: boolean;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: JSX.AriaAttributes["aria-haspopup"];
  /** Shows a spinner, sets aria-busy and disables the button. */
  loading?: boolean;
  disabled?: boolean;
  icon?: JSX.Element;
  text?: JSX.Element;
  /** Class of the text span (default `ds-btn-text`). */
  textClass?: string;
  /** Put the icon after the text. */
  reverse?: boolean;
  onClick?: (ev: MouseEvent) => void;
  type?: "button" | "submit" | "reset";
  children?: JSX.Element;
}

// Classes that bring their own size, so no ds-btn-* default is added.
const SIZE_CLASS = /(?:^|\s)ds-(?:btn-(?:compact|sm|xs|icon|icon-sm)|segmented-btn|subtab|modal-close)(?:$|\s)/;

export function Button(props: ButtonProps) {
  const hasText = () => (props.text !== undefined && props.text !== "") || props.children !== undefined;
  const sizeClass = () => {
    if (props.class && SIZE_CLASS.test(props.class)) return "";
    return `ds-btn-${props.size ?? (props.icon && !hasText() ? "icon" : "compact")}`;
  };
  const cls = () =>
    ["win-button", sizeClass(), props.variant === "primary" ? "primary" : "", props.variant === "danger" ? "ds-btn-danger" : "", props.class ?? ""]
      .filter(Boolean)
      .join(" ");

  const icon = () =>
    props.loading ? (
      <span class="ds-btn-icon-wrap">
        <span class="ds-btn-spinner" aria-hidden="true" />
      </span>
    ) : props.icon ? (
      <span class="ds-btn-icon-wrap">{props.icon}</span>
    ) : null;
  const text = () => (hasText() ? <span class={props.textClass ?? "ds-btn-text"}>{props.text ?? props.children}</span> : null);

  return (
    <button
      type={props.type ?? "button"}
      ref={props.ref}
      id={props.id}
      class={cls()}
      classList={{ active: !!props.active, "ds-btn-loading": !!props.loading, ...props.classList }}
      style={props.style}
      title={isTouch() ? undefined : props.title}
      aria-label={props["aria-label"] ?? (typeof props.text === "string" && props.text ? props.text : props.title)}
      role={props.role}
      aria-checked={props["aria-checked"]}
      aria-pressed={props["aria-pressed"]}
      aria-selected={props["aria-selected"]}
      aria-expanded={props["aria-expanded"]}
      aria-haspopup={props["aria-haspopup"]}
      aria-busy={props.loading ? true : undefined}
      disabled={props.disabled || props.loading}
      onClick={props.onClick}
    >
      {props.reverse ? (
        <>
          {text()}
          {icon()}
        </>
      ) : (
        <>
          {icon()}
          {text()}
        </>
      )}
    </button>
  );
}

export interface ConfirmDeleteButtonProps extends Omit<ButtonProps, "onClick" | "variant"> {
  onConfirm: () => Promise<void> | void;
  /** Text while waiting for the second click. Default "Delete?". */
  confirmText?: string;
}

/** First click arms (turns red, shows a check); a second click within 3 s runs `onConfirm`. */
export function ConfirmDeleteButton(props: ConfirmDeleteButtonProps) {
  let el: HTMLButtonElement | undefined;
  const [armed, setArmed] = createSignal(false);
  const [busy, setBusy] = createSignal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const disarm = () => {
    clearTimeout(timer);
    setArmed(false);
  };
  onCleanup(() => clearTimeout(timer));

  createEffect(() => {
    if (!armed()) return;
    const outside = (ev: Event) => {
      if (el && !el.contains(ev.target as Node)) disarm();
    };
    document.addEventListener("pointerdown", outside);
    onCleanup(() => document.removeEventListener("pointerdown", outside));
  });
  createEffect(() => {
    if (props.disabled) disarm();
  });

  const iconOnly = () => !props.text && !props.children;
  const click = async (ev: MouseEvent) => {
    ev.stopPropagation();
    if (busy() || props.disabled) return;
    if (!armed()) {
      setArmed(true);
      timer = setTimeout(() => setArmed(false), 3000);
      return;
    }
    disarm();
    setBusy(true);
    try {
      await props.onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      ref={(e) => (el = e)}
      id={props.id}
      class={props.class}
      size={props.size}
      style={props.style}
      variant={armed() ? "danger" : "default"}
      title={armed() ? label("confirm") : props.title}
      aria-label={props["aria-label"]}
      disabled={props.disabled}
      loading={busy()}
      icon={armed() ? <Icon name="check-lg" /> : props.icon}
      text={armed() ? (iconOnly() ? undefined : (props.confirmText ?? `${label("delete")}?`)) : (props.text ?? props.children)}
      textClass={props.textClass}
      onClick={click}
    />
  );
}

/** [icon] text, inline. For group-box titles and labels. */
export function IconText(props: { icon: JSX.Element; children: JSX.Element; class?: string }) {
  return (
    <span class={`ds-icon-text${props.class ? ` ${props.class}` : ""}`}>
      <span class="ds-icon-inline">{props.icon}</span>
      <span>{props.children}</span>
    </span>
  );
}

export interface SegmentedOption<T extends string = string> {
  value: T;
  id?: string;
  icon?: JSX.Element;
  text?: JSX.Element;
  title?: string;
  disabled?: boolean;
}

export interface SegmentedSwitchProps<T extends string = string> {
  id?: string;
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange?: (value: T) => void;
  /** Stretch to the container width with equal segments. */
  fill?: boolean;
  "aria-label"?: string;
}

export function SegmentedSwitch<T extends string = string>(props: SegmentedSwitchProps<T>) {
  return (
    <div
      class={`ds-segmented-switch${props.fill ? " ds-segmented-switch--fill" : ""}`}
      id={props.id}
      role="radiogroup"
      aria-label={props["aria-label"]}
    >
      <For each={props.options}>
        {(opt) => (
          <Button
            id={opt.id}
            role="radio"
            aria-checked={props.value === opt.value}
            class={`ds-segmented-btn${props.value === opt.value ? " active" : ""}`}
            icon={opt.icon}
            text={opt.text}
            title={opt.title}
            disabled={opt.disabled}
            onClick={() => props.onChange?.(opt.value)}
          />
        )}
      </For>
    </div>
  );
}

export interface SwitchProps {
  id?: string;
  class?: string;
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  title?: string;
  label?: JSX.Element;
  "aria-label"?: string;
}

/** On/off toggle with a square WinForms track (`.ds-switch`). */
export function Switch(props: SwitchProps) {
  return (
    <button
      type="button"
      id={props.id}
      class={`ds-switch${props.checked ? " checked" : ""}${props.class ? ` ${props.class}` : ""}`}
      role="switch"
      aria-checked={props.checked}
      aria-label={props["aria-label"] ?? (typeof props.label === "string" ? props.label : undefined)}
      disabled={props.disabled}
      title={props.title}
      onClick={(e) => {
        e.preventDefault();
        if (!props.disabled) props.onChange?.(!props.checked);
      }}
    >
      <span class="ds-switch-track">
        <span class="ds-switch-thumb" />
      </span>
      {props.label && <span class="ds-switch-label">{props.label}</span>}
    </button>
  );
}

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string = string> {
  id?: string;
  class?: string;
  style?: string | JSX.CSSProperties;
  value: T;
  options: readonly SelectOption<T>[];
  onChange?: (value: T) => void;
  disabled?: boolean;
  title?: string;
  "aria-label"?: string;
}

export function Select<T extends string = string>(props: SelectProps<T>) {
  return (
    <select
      id={props.id}
      class={`input-field ds-select${props.class ? ` ${props.class}` : ""}`}
      style={props.style}
      value={props.value}
      disabled={props.disabled}
      title={props.title}
      aria-label={props["aria-label"]}
      onChange={(ev) => props.onChange?.(ev.currentTarget.value as T)}
    >
      <For each={props.options}>{(o) => <option value={o.value}>{o.label}</option>}</For>
    </select>
  );
}

export interface StatCardProps {
  value: JSX.Element;
  label: JSX.Element;
  variant?: "primary" | "success" | "warning" | "danger" | "neutral";
}

export function StatCard(props: StatCardProps) {
  return (
    <div class={`ds-stat-card${props.variant ? ` ds-stat-card--${props.variant}` : ""}`}>
      <span class="ds-stat-val">{props.value}</span>
      <span class="ds-stat-lbl">{props.label}</span>
    </div>
  );
}
