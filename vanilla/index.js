// SoulWindow vanilla — DOM factories for apps without a framework (Curator dashboard,
// probable-video-editor). They build exactly the markup the Solid components render, so the CSS is
// shared and the two worlds look identical.

function el(tag, cls, attrs) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (attrs) for (var k in attrs) if (attrs[k] != null && attrs[k] !== false) e.setAttribute(k, attrs[k] === true ? "" : attrs[k]);
  return e;
}
function append(parent, child) {
  if (child == null) return;
  if (typeof child === "string") parent.appendChild(document.createTextNode(child));
  else parent.appendChild(child);
}

/** <i class="bi bi-NAME">. */
export function icon(name) {
  return el("i", "bi bi-" + name, { "aria-hidden": "true" });
}

/** A `.win-button`. size: "compact" (default with text) | "sm" | "xs" | "icon" (default without text) | "icon-sm". */
export function button(opts) {
  var hasText = opts.text != null && opts.text !== "";
  var size = opts.size || (opts.icon && !hasText ? "icon" : "compact");
  var cls = "win-button ds-btn-" + size;
  if (opts.variant === "primary") cls += " primary";
  if (opts.variant === "danger") cls += " ds-btn-danger";
  if (opts.active) cls += " active";
  if (opts.class) cls += " " + opts.class;
  var b = el("button", cls, { type: "button", title: opts.title, "aria-label": opts.ariaLabel || (hasText ? null : opts.title) });
  b.disabled = !!opts.disabled;
  if (opts.icon) {
    var w = el("span", "ds-btn-icon-wrap");
    append(w, typeof opts.icon === "string" ? icon(opts.icon) : opts.icon);
    b.appendChild(w);
  }
  if (hasText) {
    var t = el("span", "ds-btn-text");
    append(t, opts.text);
    b.appendChild(t);
  }
  if (opts.onClick) b.addEventListener("click", opts.onClick);
  return b;
}

/** [icon] text. */
export function iconText(iconName, text) {
  var s = el("span", "ds-icon-text");
  var i = el("span", "ds-icon-inline");
  i.appendChild(icon(iconName));
  s.appendChild(i);
  var t = el("span");
  append(t, text);
  s.appendChild(t);
  return s;
}

/** A `.group-box`; returns the box and its body (put content in `body`). */
export function groupBox(opts) {
  var box = el("div", "group-box" + (opts.class ? " " + opts.class : ""));
  var title = el("div", "group-box-title");
  append(title, opts.icon ? iconText(opts.icon, opts.title) : opts.title);
  box.appendChild(title);
  if (opts.actions && opts.actions.length) {
    var a = el("div", "group-box-actions");
    opts.actions.forEach(function (x) { a.appendChild(x); });
    box.appendChild(a);
    box.classList.add("group-box--has-actions");
  }
  var body = el("div", "group-box-body");
  box.appendChild(body);
  return { root: box, body: body };
}

/** A `.ds-switch`. Returns the button; call `.set(checked)` on the result to update it. */
export function toggle(opts) {
  var b = el("button", "ds-switch", { type: "button", role: "switch", "aria-label": opts.ariaLabel, title: opts.title });
  var track = el("span", "ds-switch-track");
  track.appendChild(el("span", "ds-switch-thumb"));
  b.appendChild(track);
  if (opts.label) {
    var l = el("span", "ds-switch-label");
    append(l, opts.label);
    b.appendChild(l);
  }
  var checked = !!opts.checked;
  var set = function (v) {
    checked = !!v;
    b.classList.toggle("checked", checked);
    b.setAttribute("aria-checked", String(checked));
  };
  set(checked);
  b.disabled = !!opts.disabled;
  b.addEventListener("click", function () {
    set(!checked);
    if (opts.onChange) opts.onChange(checked);
  });
  b.set = set;
  return b;
}

/** A `.ds-segmented-switch`. Returns the group; call `.set(value)` to change the selection. */
export function segmented(opts) {
  var g = el("div", "ds-segmented-switch" + (opts.fill ? " ds-segmented-switch--fill" : ""), { role: "radiogroup", "aria-label": opts.ariaLabel });
  var value = opts.value;
  var btns = opts.options.map(function (o) {
    var b = button({ icon: o.icon, text: o.text, title: o.title, class: "ds-segmented-btn", onClick: function () {
      set(o.value);
      if (opts.onChange) opts.onChange(o.value);
    } });
    b.className = b.className.replace(/ ds-btn-\S+/, "");
    b.setAttribute("role", "radio");
    b.dataset.value = o.value;
    g.appendChild(b);
    return b;
  });
  var set = function (v) {
    value = v;
    btns.forEach(function (b) {
      var on = b.dataset.value === v;
      b.classList.toggle("active", on);
      b.setAttribute("aria-checked", String(on));
    });
  };
  set(value);
  g.set = set;
  return g;
}

/** A `.ds-banner`. tone: "info" | "ok" | "warn" | "error". */
export function banner(opts) {
  var b = el("div", "ds-banner" + (opts.tone && opts.tone !== "info" ? " ds-banner--" + opts.tone : ""), { role: opts.tone === "error" ? "alert" : "status" });
  if (opts.icon) b.appendChild(icon(opts.icon));
  var t = el("span");
  append(t, opts.text);
  b.appendChild(t);
  if (opts.actions && opts.actions.length) {
    var a = el("span", "ds-banner-actions");
    opts.actions.forEach(function (x) { a.appendChild(x); });
    b.appendChild(a);
  }
  return b;
}

/** The spinning yin-yang with a message (an ellipsis is added). */
export function loading(message, inline) {
  var d = el("div", "ds-loading-screen" + (inline ? " ds-loading-screen--inline" : ""), { role: "status", "aria-live": "polite" });
  d.innerHTML =
    '<svg class="ds-yinyang-spinner" viewBox="0 0 100 100" width="18" height="18" aria-hidden="true">' +
    '<circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#c62828" stroke-width="4"/>' +
    '<path d="M 50 4 A 46 46 0 0 1 50 96 A 23 23 0 0 1 50 50 A 23 23 0 0 0 50 4 Z" fill="#e53935"/>' +
    '<circle cx="50" cy="27" r="7.5" fill="#e53935"/><circle cx="50" cy="73" r="7.5" fill="#ffffff"/></svg>';
  var t = el("span", "ds-loading-text");
  t.textContent = (message || "Loading") + "…";
  d.appendChild(t);
  return d;
}

/** A `.ds-progress-track`. value: 0..1, or undefined for indeterminate. Call `.set(value)` on the result to update it. */
export function progressBar(opts) {
  opts = opts || {};
  var cls = "ds-progress-track" + (opts.thin ? " ds-progress-track--thin" : "") + (opts.error ? " ds-progress-track--error" : "") + (opts.class ? " " + opts.class : "");
  var d = el("div", cls, { role: "progressbar", "aria-label": opts.ariaLabel, "aria-valuemin": "0", "aria-valuemax": "100" });
  var fill = el("div", "ds-progress-fill");
  d.appendChild(fill);
  var set = function (value) {
    var busy = value == null;
    d.classList.toggle("ds-progress-track--indeterminate", busy);
    if (busy) {
      d.removeAttribute("aria-valuenow");
      fill.style.removeProperty("width");
    } else {
      var pct = Math.min(100, Math.max(0, value * 100));
      d.setAttribute("aria-valuenow", String(Math.round(pct)));
      fill.style.width = pct + "%";
    }
  };
  set(opts.value);
  d.set = set;
  return d;
}

/** A `.ds-drop-zone` (icon defaults to "image"). Call `.setActive(on)` on the result while files are dragged over it. */
export function dropZone(opts) {
  opts = opts || {};
  var d = el("div", "ds-drop-zone" + (opts.class ? " " + opts.class : ""));
  var box = el("div", "ds-drop-icon");
  box.appendChild(icon(opts.icon || "image"));
  d.appendChild(box);
  var t = el("span");
  append(t, opts.text);
  d.appendChild(t);
  d.setActive = function (on) {
    d.classList.toggle("ds-drop-active", !!on);
  };
  d.setActive(opts.active);
  return d;
}
