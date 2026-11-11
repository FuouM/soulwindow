import "bootstrap-icons/font/bootstrap-icons.css";
import "../../css/index.css";
import "../../css/pro/daw.css";
import "./showcase.css";
import { render } from "solid-js/web";
import { createSoulWindow } from "../../runtime/index.js";
import { App } from "./App";

const sw = createSoulWindow({ storagePrefix: "sw-showcase-" });
const params = new URLSearchParams(location.search);
// ?theme=dark&density=touch&accent=pink — used by the screenshot script.
const qTheme = params.get("theme");
if (qTheme) sw.setTheme(qTheme);
const qAccent = params.get("accent");
if (qAccent) sw.setAccent(qAccent);
const qDensity = params.get("density");
if (qDensity === "compact" || qDensity === "comfortable" || qDensity === "touch") sw.setDensity(qDensity);

render(() => <App sw={sw} />, document.getElementById("app")!);
