/**
 * List row (`.ds-item`): leading visual, then a fill column (title, body), then actions.
 * Rows with onClick are buttons for the keyboard (Enter / Space).
 */
import { Show, type JSX } from "solid-js";

export interface ListItemProps {
  class?: string;
  style?: string | JSX.CSSProperties;
  leading?: JSX.Element;
  title?: JSX.Element;
  body?: JSX.Element;
  actions?: JSX.Element;
  onClick?: () => void;
  selected?: boolean;
  /** Dimmed, with an accent bar on the left. */
  read?: boolean;
  blacklisted?: boolean;
  /** Accent corner mark; `followedTitle` is its tooltip. */
  followed?: boolean;
  followedTitle?: string;
}

export function ListItem(props: ListItemProps) {
  return (
    <div
      class={`ds-item${props.class ? ` ${props.class}` : ""}`}
      classList={{
        selected: !!props.selected,
        "ds-item-read": !!props.read,
        "ds-item-blacklisted": !!props.blacklisted,
        "ds-item-followed": !!props.followed,
      }}
      style={props.style}
      role={props.onClick ? "button" : undefined}
      tabIndex={props.onClick ? 0 : undefined}
      aria-pressed={props.onClick && props.selected !== undefined ? props.selected : undefined}
      onClick={() => props.onClick?.()}
      onKeyDown={(ev) => {
        if (props.onClick && ev.target === ev.currentTarget && (ev.key === "Enter" || ev.key === " ")) {
          ev.preventDefault();
          props.onClick();
        }
      }}
    >
      <Show when={props.followed}>
        <div class="ds-item-corner-mark" title={props.followedTitle} />
      </Show>
      {props.leading}
      <div class="ds-fill">
        {props.title}
        {props.body}
      </div>
      <Show when={props.actions}>
        <div class="ds-item-actions" onClick={(ev) => ev.stopPropagation()}>
          {props.actions}
        </div>
      </Show>
    </div>
  );
}
