// SoulWindow runtime — tokens.js: read CSS tokens for code that cannot use CSS (canvas painting).
//   const tl = readTokens("--tl-");  // { bg, laneAlt, clip, clipHead, playhead, ... }
// Call it again after a theme or accent change (subscribe() on the controller tells you when).

/** @param {string} prefix @param {Element} [el] @returns {Record<string, string>} */
export function readTokens(prefix, el) {
  var target = el || document.documentElement;
  var cs = getComputedStyle(target);
  var out = {};
  var seen = new Set();
  var sheets = Array.prototype.slice.call(document.styleSheets);
  var collect = function (rules) {
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (r.style) {
        for (var j = 0; j < r.style.length; j++) {
          var name = r.style[j];
          if (name.indexOf(prefix) === 0) seen.add(name);
        }
      }
      if (r.cssRules) collect(r.cssRules);
    }
  };
  sheets.forEach(function (s) {
    try {
      collect(s.cssRules);
    } catch (_) {
      /* cross-origin sheet */
    }
  });
  seen.forEach(function (name) {
    var key = name.slice(prefix.length).replace(/-([a-z0-9])/g, function (_, c) {
      return c.toUpperCase();
    });
    out[key] = cs.getPropertyValue(name).trim();
  });
  return out;
}
