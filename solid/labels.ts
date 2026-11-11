// The few words SoulWindow components say on their own. Apps with i18n call setLabels() once at
// startup (and again when the language changes) with their translations.
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

const labels: SoulWindowLabels = {
  close: "Close",
  clear: "Clear",
  retry: "Retry",
  delete: "Delete",
  confirm: "Click again to confirm",
  expandSection: "Expand section",
  collapseSection: "Collapse section",
  loading: "Loading",
};

export function setLabels(next: Partial<SoulWindowLabels>): void {
  Object.assign(labels, next);
}

export function label(key: keyof SoulWindowLabels): string {
  return labels[key];
}

/** True while the document is in touch density (tooltips are suppressed, sheets go full screen). */
export function isTouch(): boolean {
  return typeof document !== "undefined" && document.documentElement.getAttribute("data-density") === "touch";
}
