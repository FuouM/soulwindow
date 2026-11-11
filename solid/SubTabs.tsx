/** Row of tab buttons with optional counts and right-side actions (`.ds-subtabs`).
 * When the row is wider than its box: wheel scrolls it sideways and the mouse can drag it. */
import { createEffect, For, onCleanup, onMount, Show, type JSX } from "solid-js";
import { Button } from "./Button";

export interface SubTab<T extends string = string> {
  id: T;
  label: string;
  /** Used when `compact` is on. */
  shortLabel?: string;
  /** Bootstrap icon class, e.g. "bi-clock-history". */
  icon?: string;
  count?: number;
}

export interface SubTabsProps<T extends string = string> {
  tabs: readonly SubTab<T>[];
  activeTab: T;
  onSwitch: (id: T) => void;
  compact?: boolean;
  right?: JSX.Element;
  "aria-label"?: string;
}

export function SubTabs<T extends string = string>(props: SubTabsProps<T>) {
  let row: HTMLDivElement | undefined;

  onMount(() => {
    const el = row;
    if (!el) return;
    let down = false;
    let dragging = false;
    let startX = 0;
    let start = 0;
    const overflowing = () => el.scrollWidth > el.clientWidth;
    const onWheel = (e: WheelEvent) => {
      if (!overflowing() || Math.abs(e.deltaY) < Math.abs(e.deltaX) || e.deltaY === 0) return;
      const room = e.deltaY < 0 ? el.scrollLeft > 0 : el.scrollLeft < el.scrollWidth - el.clientWidth;
      if (room) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || !overflowing()) return;
      down = true;
      dragging = false;
      startX = e.clientX;
      start = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!dragging && Math.abs(dx) > 3) {
        dragging = true;
        el.classList.add("is-dragging");
        el.setPointerCapture(e.pointerId);
      }
      if (dragging) el.scrollLeft = start - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      if (dragging) {
        el.classList.remove("is-dragging");
        setTimeout(() => (dragging = false), 50);
      }
    };
    const swallowClick = (e: MouseEvent) => {
      if (dragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", swallowClick, true);
    onCleanup(() => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", swallowClick, true);
    });
  });

  createEffect(() => {
    void props.activeTab;
    requestAnimationFrame(() => {
      row?.querySelector<HTMLElement>(".ds-subtab.active")?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  });

  return (
    <div class="ds-subtabs">
      <div class="ds-subtabs-left" ref={row} role="tablist" aria-label={props["aria-label"]}>
        <For each={props.tabs}>
          {(tab) => (
            <Button
              class={`ds-subtab${props.activeTab === tab.id ? " active" : ""}`}
              role="tab"
              aria-selected={props.activeTab === tab.id}
              title={typeof tab.count === "number" ? `${tab.label} (${tab.count})` : tab.label}
              onClick={() => props.onSwitch(tab.id)}
            >
              {tab.icon ? <i class={`bi ${tab.icon}`} /> : undefined}
              <span class="ds-subtab-label">{props.compact ? (tab.shortLabel ?? tab.label) : tab.label}</span>
              <Show when={typeof tab.count === "number"}>
                <span class="ds-subtab-count">{tab.count}</span>
              </Show>
            </Button>
          )}
        </For>
      </div>
      <Show when={props.right}>
        <div class="ds-subtabs-right">{props.right}</div>
      </Show>
    </div>
  );
}
