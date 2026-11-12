/** True when the point is over `el` or one of its descendants. `physical` (default true): `pos` is in
 * physical pixels, as Tauri's drag-drop events report it, and is divided by `devicePixelRatio`. */
export function isPointOver(el: Element, pos: { x: number; y: number } | undefined, physical?: boolean): boolean;
