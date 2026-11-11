import type { ColorKit } from "./color-kit";
import type { Density, SoulWindowOptions, ThemeDef } from "./config";

export interface SoulWindowState {
  theme: string;
  accent: string;
  density: Density;
}

export interface SoulWindow {
  readonly kit: ColorKit;
  readonly themes: Record<string, ThemeDef>;
  theme(): string;
  themeDef(): ThemeDef;
  isDark(): boolean;
  /** Saves the choice; until then the theme follows the OS (when defaultTheme is "system"). */
  setTheme(id: string): void;
  cycleTheme(): void;
  /** "default", a preset id ("pink", …) or a hex colour. */
  accent(): string;
  setAccent(color: string): void;
  density(): Density;
  /** Not saved: the app decides density from the platform on each start. */
  setDensity(d: Density): void;
  subscribe(fn: (state: SoulWindowState) => void): () => void;
}

/** Create the controller once, at startup, with the same options given to the Vite plugin. */
export function createSoulWindow(options?: SoulWindowOptions): SoulWindow;
