import type { ThemeFamily } from "./color-kit";

export interface ThemeDef {
  /** Which accent rules and colour-scheme the theme uses. */
  family: ThemeFamily;
  label: string;
  /** Browser / Android status-bar colour. */
  meta: string;
  /** Painted on <html> before the stylesheet loads. */
  bg: string;
  text: string;
}

export type Density = "compact" | "comfortable" | "touch";

export interface SoulWindowOptions {
  /** localStorage key prefix. Default "sw-". DynastyReader passes "ds-" to keep its saved settings. */
  storagePrefix?: string;
  /** Theme registry. Default DEFAULT_THEMES. Every id needs a matching :root[data-theme="id"] block. */
  themes?: Record<string, ThemeDef>;
  /** Theme when nothing is saved: an id, or "system" (light/dark from the OS). Default "system". */
  defaultTheme?: string;
  /** "auto" picks touch on coarse pointers, comfortable otherwise. Default "comfortable". */
  density?: Density | "auto";
  /** id of the <meta name="theme-color"> to update. Default "sw-theme-color-meta". */
  metaId?: string;
  /** Also toggle `<prefix><theme>` and `<prefix>dark` classes on <body> (for old selectors). Off by default. */
  legacyClassPrefix?: string;
}

export interface ResolvedOptions {
  storagePrefix: string;
  themes: Record<string, ThemeDef>;
  defaultTheme: string;
  density: Density | "auto";
  metaId: string;
  legacyClassPrefix: string | null;
}

export const DEFAULT_THEMES: Record<string, ThemeDef>;
export const DENSITIES: readonly Density[];
export function resolveOptions(o?: SoulWindowOptions): ResolvedOptions;
