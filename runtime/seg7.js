// SoulWindow pro — seven-segment geometry for the .daw-lcd readout. Every cell draws all segments;
// unlit ones show as faint ghosts, like a real VFD. Digits, "-", ":", "." and spaces are drawn; any
// other character is plain text. solid/pro/LcdDigits.tsx and seg7Html() both render from this.

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

/** Markup for a readout, for apps that build HTML strings. */
export function seg7Html(text, cls) {
  var parts = [];
  Array.from(String(text)).forEach(function (ch) {
    if (ch === ":") parts.push(COLON);
    else if (ch === ".") parts.push(DOT);
    else if (Object.prototype.hasOwnProperty.call(LIT, ch)) {
      var lit = LIT[ch];
      parts.push(
        '<svg class="daw-seg7" viewBox="0 0 12 20" aria-hidden="true">' +
          SEGS.map(function (s) {
            return '<polygon points="' + SHAPE[s] + '"' + (lit.indexOf(s) >= 0 ? ' class="daw-seg7-on"' : "") + "/>";
          }).join("") +
          "</svg>",
      );
    } else parts.push('<span class="daw-seg7-text">' + esc(ch) + "</span>");
  });
  return '<span class="daw-seg7-row' + (cls ? " " + esc(cls) : "") + '" role="img" aria-label="' + esc(text) + '">' + parts.join("") + "</span>";
}
