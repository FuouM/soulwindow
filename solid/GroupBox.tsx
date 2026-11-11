/** WinForms fieldset: a bordered box with its title sitting on the top edge (`.group-box`). */
import { createSignal, onCleanup, Show, type JSX } from "solid-js";
import { label } from "./labels";

export interface GroupBoxProps {
  id?: string;
  /** Usually <IconText icon={…}>Title</IconText>. */
  title: JSX.Element;
  /** Small buttons on the right of the top edge. */
  actions?: JSX.Element;
  class?: string;
  bodyClass?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
  children?: JSX.Element;
}

export function GroupBox(props: GroupBoxProps) {
  const [actionsWidth, setActionsWidth] = createSignal(0);
  // The title shrinks so it never runs under the actions.
  const observeActions = (el: HTMLDivElement) => {
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setActionsWidth(el.offsetWidth));
    ro.observe(el);
    onCleanup(() => ro.disconnect());
  };

  return (
    <div
      id={props.id}
      class={`group-box${props.class ? ` ${props.class}` : ""}`}
      classList={{ collapsed: !!(props.collapsible && props.collapsed), "group-box--has-actions": !!props.actions }}
      style={actionsWidth() > 0 ? { "--ds-group-actions-w": `${actionsWidth() + 12}px` } : undefined}
    >
      <div
        class="group-box-title"
        classList={{ "group-box-title--collapsible": !!props.collapsible }}
        onClick={props.collapsible ? props.onToggle : undefined}
      >
        {props.title}
        <Show when={props.collapsible}>
          <button
            type="button"
            class="group-box-collapse-btn"
            aria-label={props.collapsed ? label("expandSection") : label("collapseSection")}
            aria-expanded={!props.collapsed}
            title={props.collapsed ? label("expandSection") : label("collapseSection")}
            onClick={(ev) => {
              ev.stopPropagation();
              props.onToggle?.();
            }}
          >
            <i class="bi bi-chevron-down" />
          </button>
        </Show>
      </div>
      <Show when={props.actions}>
        <div ref={observeActions} class="group-box-actions">
          {props.actions}
        </div>
      </Show>
      <div class={`group-box-body${props.bodyClass ? ` ${props.bodyClass}` : ""}`}>{props.children}</div>
    </div>
  );
}
