export type Seg = "a" | "b" | "c" | "d" | "e" | "f" | "g";
export const SEGS: readonly Seg[];
/** Lit segments per drawable character. */
export const LIT: Readonly<Record<string, string>>;
/** Polygon points per segment, in a 12×20 cell. */
export const SHAPE: Readonly<Record<Seg, string>>;
/** `.daw-seg7-row` markup for `text`, for apps that build HTML strings. */
export function seg7Html(text: string, cls?: string): string;
