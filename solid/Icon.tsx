import type { JSX } from "solid-js";

/** A Bootstrap Icons glyph. Needs `bootstrap-icons/font/bootstrap-icons.css` loaded by the app. */
export interface IconProps {
  /** Name without the `bi-` prefix: "search", "x-lg", "arrow-clockwise". */
  name: string;
  size?: number | string;
  color?: string;
  /** Rotate continuously (`.ds-spin`), e.g. a refresh icon while checking. */
  spin?: boolean;
  class?: string;
  style?: JSX.CSSProperties;
  title?: string;
  onClick?: (ev: MouseEvent) => void;
}

export function Icon(props: IconProps) {
  return (
    <i
      class={`bi bi-${props.name}${props.spin ? " ds-spin" : ""}${props.class ? ` ${props.class}` : ""}`}
      style={{
        ...(props.size !== undefined ? { "font-size": typeof props.size === "number" ? `${props.size}px` : props.size } : {}),
        ...(props.color ? { color: props.color } : {}),
        ...props.style,
      }}
      title={props.title}
      aria-hidden={props.title ? undefined : "true"}
      onClick={props.onClick}
    />
  );
}
