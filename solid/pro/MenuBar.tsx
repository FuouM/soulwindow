/**
 * Classic menu bar (File / Edit / View …) with drop-down menus and shortcut hints (pro layer).
 * Click opens a menu; while one is open, hovering another switches to it. Escape closes; arrow
 * keys move between items and menus.
 */
import { createSignal, For, onCleanup, onMount, Show, type JSX } from "solid-js";

export type MenuItemDef =
  | { label: string; shortcut?: string; action: () => void; disabled?: boolean; checked?: boolean }
  | "separator";

export interface MenuDef {
  label: string;
  items: MenuItemDef[];
}

export interface MenuBarProps {
  menus: MenuDef[];
  /** Left of the menus: app icon and name. */
  brand?: JSX.Element;
  /** Right side: document title, status. */
  children?: JSX.Element;
}

export function MenuBar(props: MenuBarProps) {
  const [open, setOpen] = createSignal<number | null>(null);
  let root!: HTMLDivElement;
  const buttons: HTMLButtonElement[] = [];

  const onDocDown = (e: PointerEvent) => {
    if (!root.contains(e.target as Node)) setOpen(null);
  };
  onMount(() => document.addEventListener("pointerdown", onDocDown));
  onCleanup(() => document.removeEventListener("pointerdown", onDocDown));

  const items = () => Array.from(root.querySelectorAll<HTMLButtonElement>(".daw-menu-pop .daw-menu-item:not(:disabled)"));
  const openAt = (i: number, focusFirst: boolean) => {
    const n = props.menus.length;
    const idx = ((i % n) + n) % n;
    setOpen(idx);
    buttons[idx]?.focus();
    if (focusFirst) queueMicrotask(() => items()[0]?.focus());
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const cur = open();
    if (e.key === "Escape" && cur !== null) {
      e.preventDefault();
      setOpen(null);
      buttons[cur]?.focus();
    } else if (cur !== null && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      e.preventDefault();
      openAt(cur + (e.key === "ArrowRight" ? 1 : -1), true);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (cur === null) {
        const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (i >= 0) openAt(i, true);
        return;
      }
      const list = items();
      const at = list.indexOf(document.activeElement as HTMLButtonElement);
      const next = list[(at + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length];
      next?.focus();
    }
  };

  return (
    <div class="daw-menubar" ref={root} role="menubar" onKeyDown={onKeyDown}>
      <Show when={props.brand}>
        <span class="daw-brand">{props.brand}</span>
      </Show>
      <For each={props.menus}>
        {(m, mi) => (
          <div class="daw-menu">
            <button
              ref={(el) => (buttons[mi()] = el)}
              class="daw-menu-btn"
              classList={{ "daw-menu-btn--open": open() === mi() }}
              aria-haspopup="menu"
              aria-expanded={open() === mi()}
              onClick={() => setOpen(open() === mi() ? null : mi())}
              onPointerEnter={() => open() !== null && setOpen(mi())}
            >
              {m.label}
            </button>
            <Show when={open() === mi()}>
              <div class="daw-menu-pop" role="menu" aria-label={m.label}>
                <For each={m.items}>
                  {(it) =>
                    it === "separator" ? (
                      <div class="daw-menu-sep" role="separator" />
                    ) : (
                      <button
                        class="daw-menu-item"
                        role={it.checked !== undefined ? "menuitemcheckbox" : "menuitem"}
                        aria-checked={it.checked}
                        disabled={it.disabled}
                        onClick={() => {
                          setOpen(null);
                          it.action();
                        }}
                      >
                        <span class="daw-menu-check">{it.checked ? <i class="bi bi-check2" /> : null}</span>
                        <span class="daw-menu-label">{it.label}</span>
                        <span class="daw-menu-shortcut">{it.shortcut ?? ""}</span>
                      </button>
                    )
                  }
                </For>
              </div>
            </Show>
          </div>
        )}
      </For>
      <div class="daw-menubar-right">{props.children}</div>
    </div>
  );
}
