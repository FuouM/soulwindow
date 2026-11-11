// The few words SoulWindow components say on their own. Apps with i18n call setLabels() once at
// startup (and again when the language changes) with their translations. The labels live in a
// store, so components already on screen re-render with the new words.
import { createStore } from "solid-js/store";

export interface SoulWindowLabels {
  close: string;
  clear: string;
  retry: string;
  delete: string;
  confirm: string;
  expandSection: string;
  collapseSection: string;
  loading: string;
}

const [labels, setStore] = createStore<SoulWindowLabels>({
  close: "Close",
  clear: "Clear",
  retry: "Retry",
  delete: "Delete",
  confirm: "Click again to confirm",
  expandSection: "Expand section",
  collapseSection: "Collapse section",
  loading: "Loading",
});

export function setLabels(next: Partial<SoulWindowLabels>): void {
  setStore(next);
}

export function label(key: keyof SoulWindowLabels): string {
  return labels[key];
}

/** True while the document is in touch density (tooltips are suppressed, sheets go full screen). */
export function isTouch(): boolean {
  return typeof document !== "undefined" && document.documentElement.getAttribute("data-density") === "touch";
}
