/**
 * Dialog (`.ds-modal-*`), rendered into <body>. Escape and a backdrop click close it, Tab stays
 * inside, and focus goes back to the opener on close. In touch density it becomes a full-screen
 * sheet (mobile.css); pass `floating` for small prompts that should stay centred.
 */
import { createEffect, createUniqueId, onCleanup, Show, type JSX } from "solid-js";
import { Portal } from "solid-js/web";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { label } from "./labels";

export interface ModalProps {
  open: boolean;
  title?: JSX.Element;
  children?: JSX.Element;
  footer?: JSX.Element;
  /** Window width in px on desktop. */
  width?: number;
  id?: string;
  class?: string;
  /** Keep the centred window in touch density. */
  floating?: boolean;
  /** Return false to keep the dialog open (unsaved changes…). */
  canClose?: () => boolean;
  onClose?: () => void;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getAttribute("aria-hidden") !== "true" && (el.offsetParent !== null || el.getClientRects().length > 0),
  );
}

export function Modal(props: ModalProps) {
  let backdrop: HTMLDivElement | undefined;
  let win: HTMLDivElement | undefined;
  const titleId = createUniqueId();

  const close = () => {
    if (props.canClose && !props.canClose()) return;
    props.onClose?.();
  };

  createEffect(() => {
    if (!props.open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        ev.preventDefault();
        close();
        return;
      }
      if (ev.key !== "Tab" || !win) return;
      const items = focusables(win);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) {
        ev.preventDefault();
        win.focus();
      } else if (!win.contains(document.activeElement)) {
        ev.preventDefault();
        (ev.shiftKey ? last : first).focus();
      } else if (ev.shiftKey && (document.activeElement === first || document.activeElement === win)) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault();
        first.focus();
      }
    };
    const onFocusIn = (ev: FocusEvent) => {
      if (win && !win.contains(ev.target as Node)) (focusables(win)[0] ?? win).focus();
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);

    queueMicrotask(() => {
      if (!win || win.contains(document.activeElement)) return;
      const auto = win.querySelector<HTMLElement>("[autofocus]");
      (auto ?? focusables(win)[0] ?? win).focus();
    });

    onCleanup(() => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
      if (opener?.isConnected) opener.focus();
    });
  });

  return (
    <Show when={props.open}>
      <Portal mount={document.body}>
        <div
          ref={backdrop}
          class={`ds-modal-backdrop${props.floating ? " ds-modal--floating" : ""}${props.class ? ` ${props.class}` : ""}`}
          id={props.id}
          onClick={(ev) => {
            if (ev.target === backdrop) close();
          }}
        >
          <div
            ref={win}
            class="ds-modal-window"
            role="dialog"
            aria-modal="true"
            aria-labelledby={props.title !== undefined ? titleId : undefined}
            tabIndex={-1}
            style={props.width ? { width: `${props.width}px` } : undefined}
          >
            <Show when={props.title !== undefined}>
              <div class="ds-modal-header">
                <span class="ds-modal-title" id={titleId}>
                  {props.title}
                </span>
                <Button class="ds-modal-close" title={`${label("close")} (Esc)`} icon={<Icon name="x-lg" />} onClick={close} />
              </div>
            </Show>
            <Show when={props.children !== undefined}>
              <div class="ds-modal-body">{props.children}</div>
            </Show>
            <Show when={props.footer !== undefined}>
              <div class="ds-modal-footer">{props.footer}</div>
            </Show>
          </div>
        </div>
      </Portal>
    </Show>
  );
}
