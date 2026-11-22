// SoulWindow pro — seven-segment geometry for the .daw-lcd readout. Every cell draws all segments;
// unlit ones show as faint ghosts, like a real VFD. Digits, "-", ":", "." and spaces are drawn; any
// other character is plain text. solid/pro/LcdDigits.tsx and seg7Html() both render from this.
// seg7Set() updates a readout in place: a readout that changes every frame (a playhead time) must not
// rebuild its SVG cells, or the browser lays out and repaints them all each frame.

export var SEGS = ["a", "b", "c", "d", "e", "f", "g"];

export var LIT = {
  "0": "abcdef", "1": "bc", "2": "abdeg", "3": "abcdg", "4": "bcfg",
  "5": "acdfg", "6": "acdefg", "7": "abc", "8": "abcdefg", "9": "abcdfg",
  "-": "g", "—": "g", " ": "",
};

function hBar(x1, x2, y) {
  return x1 + "," + y + " " + (x1 + 1) + "," + (y - 1) + " " + (x2 - 1) + "," + (y - 1) + " " + x2 + "," + y + " " + (x2 - 1) + "," + (y + 1) + " " + (x1 + 1) + "," + (y + 1);
}
function vBar(x, y1, y2) {
  return x + "," + y1 + " " + (x + 1) + "," + (y1 + 1) + " " + (x + 1) + "," + (y2 - 1) + " " + x + "," + y2 + " " + (x - 1) + "," + (y2 - 1) + " " + (x - 1) + "," + (y1 + 1);
}

/** Segment outlines in a 12×20 cell. */
export var SHAPE = {
  a: hBar(1.6, 10.4, 1),
  b: vBar(11, 1.6, 9.4),
  c: vBar(11, 10.6, 18.4),
  d: hBar(1.6, 10.4, 19),
  e: vBar(1, 10.6, 18.4),
  f: vBar(1, 1.6, 9.4),
  g: hBar(1.6, 10.4, 10),
};

var COLON = '<svg class="daw-seg7 daw-seg7-narrow" viewBox="0 0 4 20" aria-hidden="true"><rect class="daw-seg7-on" x="1" y="5.5" width="2" height="2"/><rect class="daw-seg7-on" x="1" y="12.5" width="2" height="2"/></svg>';
var DOT = '<svg class="daw-seg7 daw-seg7-narrow" viewBox="0 0 4 20" aria-hidden="true"><rect class="daw-seg7-on" x="1" y="18" width="2" height="2"/></svg>';

function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}

/** The cell kind of a character: "d" drawn digit, ":" colon, "." dot, "t" plain text. */
function kind(ch) {
  return ch === ":" ? ":" : ch === "." ? "." : Object.prototype.hasOwnProperty.call(LIT, ch) ? "d" : "t";
}

/** Markup for a readout, for apps that build HTML strings. */
export function seg7Html(text, cls) {
  var chars = Array.from(String(text));
  var parts = chars.map(function (ch) {
    if (ch === ":") return COLON;
    if (ch === ".") return DOT;
    if (kind(ch) === "d") {
      var lit = LIT[ch];
      return (
        '<svg class="daw-seg7" viewBox="0 0 12 20" aria-hidden="true">' +
        SEGS.map(function (s) {
          return '<polygon points="' + SHAPE[s] + '"' + (lit.indexOf(s) >= 0 ? ' class="daw-seg7-on"' : "") + "/>";
        }).join("") +
        "</svg>"
      );
    }
    return '<span class="daw-seg7-text">' + esc(ch) + "</span>";
  });
  return (
    '<span class="daw-seg7-row' + (cls ? " " + esc(cls) : "") + '" role="img" aria-label="' + esc(text) + '" data-seg7="' +
    chars.map(kind).join("") + '">' + parts.join("") + "</span>"
  );
}

/**
 * Show `text` in `el` (the readout's container). When `el` already holds a readout with the same cells (the same
 * kind of character at each place, the same class), it only switches the segments and the text that changed: no
 * new elements, no layout. Otherwise it writes the markup of seg7Html().
 */
export function seg7Set(el, text, cls) {
  text = String(text);
  var chars = Array.from(text);
  var shape = chars.map(kind).join("");
  var row = el.firstElementChild;
  if (!row || row.getAttribute("data-seg7") !== shape || row.className !== "daw-seg7-row" + (cls ? " " + cls : "")) {
    el.innerHTML = seg7Html(text, cls);
    return;
  }
  if (row.getAttribute("aria-label") === text) return;
  row.setAttribute("aria-label", text);
  var cells = row.children;
  chars.forEach(function (ch, i) {
    var cell = cells[i];
    if (shape[i] === "d") {
      var lit = LIT[ch], polys = cell.children;
      for (var k = 0; k < SEGS.length; k++) polys[k].classList.toggle("daw-seg7-on", lit.indexOf(SEGS[k]) >= 0);
    } else if (shape[i] === "t" && cell.textContent !== ch) cell.textContent = ch;
  });
}
