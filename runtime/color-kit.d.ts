export type ThemeFamily = "light" | "dark" | "high-contrast";

export interface AccentPreset {
  id: string;
  label: string;
  hex: string;
}

export interface ColorKit {
  readonly DEFAULT_HEX: string;
  readonly PRESETS: readonly AccentPreset[];
  /** Preset id, "#rgb" or "#rrggbb" (with or without #) to "#rrggbb"; anything else gives the default blue. */
  resolveHex(color: string | null | undefined): string;
  parseHex(color: string): [number, number, number];
  toHex(r: number, g: number, b: number): string;
  /** Mix towards white (percent > 0) or black (percent < 0). */
  adjust(hex: string, percent: number): string;
  rgbToHsl(r: number, g: number, b: number): [number, number, number];
  hslToRgb(h: number, s: number, l: number): [number, number, number];
  contrastText(hex: string): "#000000" | "#ffffff";
  deepText(hex: string, targetLightness?: number, maxSaturation?: number): string;
  linkColor(hex: string, onDark?: boolean): string;
  /** Every CSS custom property the accent drives, for one theme family. */
  accentPalette(color: string, family: ThemeFamily): Record<string, string>;
}

export function createColorKit(): ColorKit;
