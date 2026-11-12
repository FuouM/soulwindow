// SoulWindow runtime — drop.js: hit-testing for file drag-and-drop (from Project-Curator's toolbox).
// Native drag events (Tauri's onDragDropEvent) report the cursor in physical pixels and carry no
// target element; light up a drop target only while the cursor is over it:
//   if (e.type === "enter" || e.type === "over") setDropActive(isPointOver(group, e.position));

/**
 * True when the point is over `el` or one of its descendants.
 * @param {Element} el
 * @param {{ x: number, y: number } | undefined} pos
 * @param {boolean} [physical] pos is in physical pixels (default true): divided by devicePixelRatio.
 * @returns {boolean}
 */
export function isPointOver(el, pos, physical) {
  if (!el || !pos || typeof pos.x !== "number" || typeof pos.y !== "number") return false;
  var scale = physical === false ? 1 : window.devicePixelRatio || 1;
  var hit = document.elementFromPoint(pos.x / scale, pos.y / scale);
  return !!hit && (el === hit || el.contains(hit));
}
