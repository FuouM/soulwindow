/** Text input with an inline clear button (`.input-field` inside `.input-wrapper`). */
import { createEffect, createSignal, type JSX } from "solid-js";
import { Icon } from "./Icon";
import { label } from "./labels";

export interface InputFieldProps {
  id?: string;
  ref?: (el: HTMLInputElement) => void;
  type?: string;
  value?: string;
  placeholder?: string;
  class?: string;
  wrapperClass?: string;
  style?: string | JSX.CSSProperties;
  title?: string;
  autocomplete?: string;
  autofocus?: boolean;
  disabled?: boolean;
  inputmode?: "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";
  enterkeyhint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send";
  /** Accessible name; defaults to the placeholder. */
  "aria-label"?: string;
  role?: JSX.HTMLAttributes<HTMLInputElement>["role"];
  "aria-autocomplete"?: "none" | "inline" | "list" | "both";
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  "aria-activedescendant"?: string;
  /** No clear button. */
  noClear?: boolean;
  onInput?: (value: string) => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onClear?: () => void;
  onKeyDown?: (ev: KeyboardEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  /** Rendered inside the wrapper, e.g. a typeahead list. */
  dropdown?: JSX.Element;
}

export function InputField(props: InputFieldProps) {
  let input: HTMLInputElement | undefined;
  const [value, setValue] = createSignal(props.value ?? "");
  createEffect(() => {
    const next = props.value ?? "";
    setValue(next);
    if (input && input.value !== next) input.value = next;
  });

  return (
    <div
      class={`input-wrapper${props.wrapperClass ? ` ${props.wrapperClass}` : ""}`}
      classList={{ "has-value": !props.noClear && !props.disabled && value().length > 0 }}
    >
      <input
        ref={(el) => {
          input = el;
          props.ref?.(el);
        }}
        id={props.id}
        type={props.type ?? "text"}
        class={`input-field${props.noClear ? "" : " has-clear"}${props.class ? ` ${props.class}` : ""}`}
        style={props.style}
        placeholder={props.placeholder}
        title={props.title}
        autocomplete={props.autocomplete}
        autofocus={props.autofocus}
        disabled={props.disabled}
        inputmode={props.inputmode}
        enterkeyhint={props.enterkeyhint}
        aria-label={props["aria-label"] ?? props.placeholder}
        role={props.role}
        aria-autocomplete={props["aria-autocomplete"]}
        aria-expanded={props["aria-expanded"]}
        aria-controls={props["aria-controls"]}
        aria-activedescendant={props["aria-activedescendant"]}
        value={value()}
        onFocus={() => props.onFocus?.()}
        onBlur={() => props.onBlur?.()}
        onInput={(ev) => {
          setValue(ev.currentTarget.value);
          props.onInput?.(ev.currentTarget.value);
        }}
        onKeyDown={(ev) => {
          props.onKeyDown?.(ev);
          if (ev.defaultPrevented || ev.isComposing) return;
          if (ev.key === "Enter") {
            ev.preventDefault();
            props.onEnter?.();
          } else if (ev.key === "Escape") {
            props.onEscape?.();
          }
        }}
      />
      {!props.noClear && (
        <button
          type="button"
          class="input-clear-btn"
          tabIndex={-1}
          title={label("clear")}
          aria-label={label("clear")}
          onClick={() => {
            if (input) input.value = "";
            setValue("");
            props.onInput?.("");
            props.onClear?.();
            input?.focus();
          }}
        >
          <Icon name="x-lg" />
        </button>
      )}
      {props.dropdown}
    </div>
  );
}
