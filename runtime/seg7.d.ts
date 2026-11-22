export type Seg = "a" | "b" | "c" | "d" | "e" | "f" | "g";
export const SEGS: readonly Seg[];
/** Lit segments per drawable character. */
export const LIT: Readonly<Record<string, string>>;
/** Polygon points per segment, in a 12×20 cell. */
export const SHAPE: Readonly<Record<Seg, string>>;
/** `.daw-seg7-row` markup for `text`, for apps that build HTML strings. */
export function seg7Html(text: string, cls?: string): string;
/**
 * Show `text` in the readout container `el`. A readout with the same cells (the same kind of character at each
 * place, the same `cls`) is updated in place: only the segments and the text that changed switch, with no new
 * elements and no layout. Use it for a readout that changes every frame. Otherwise it writes `seg7Html(text, cls)`.
 */
export function seg7Set(el: Element, text: string, cls?: string): void;
