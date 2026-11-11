/** Seven-segment readout for `.daw-lcd` (pro layer). */
import { For, Index } from "solid-js";
import { LIT, SEGS, SHAPE } from "../../runtime/seg7.js";

function Digit(props: { ch: string }) {
  return (
    <svg class="daw-seg7" viewBox="0 0 12 20" aria-hidden="true">
      <For each={SEGS}>{(s) => <polygon points={SHAPE[s]} classList={{ "daw-seg7-on": (LIT[props.ch] ?? "").includes(s) }} />}</For>
    </svg>
  );
}

function Narrow(props: { dots: number[] }) {
  return (
    <svg class="daw-seg7 daw-seg7-narrow" viewBox="0 0 4 20" aria-hidden="true">
      <For each={props.dots}>{(y) => <rect class="daw-seg7-on" x="1" y={y} width="2" height="2" />}</For>
    </svg>
  );
}

export function LcdDigits(props: { text: string; class?: string }) {
  return (
    <span class={`daw-seg7-row${props.class ? ` ${props.class}` : ""}`} role="img" aria-label={props.text}>
      <Index each={[...props.text]}>
        {(ch) =>
          ch() === ":" ? (
            <Narrow dots={[5.5, 12.5]} />
          ) : ch() === "." ? (
            <Narrow dots={[18]} />
          ) : ch() in LIT ? (
            <Digit ch={ch()} />
          ) : (
            <span class="daw-seg7-text">{ch()}</span>
          )
        }
      </Index>
    </span>
  );
}
