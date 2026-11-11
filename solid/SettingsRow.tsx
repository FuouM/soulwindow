/** Settings row (`.ds-settings-row`): label and description left, control right. */
import type { JSX } from "solid-js";
import { Switch } from "./Button";

export interface SettingsRowProps {
  label: JSX.Element;
  desc?: JSX.Element;
  /** Line above the row (leave off the first row of a group). */
  divider?: boolean;
  /** Control on its own line under the label. */
  stacked?: boolean;
  children: JSX.Element;
}

export function SettingsRow(props: SettingsRowProps) {
  return (
    <div class="ds-settings-row" classList={{ "has-divider": !!props.divider, "is-stacked": !!props.stacked }}>
      <div class="ds-settings-row-label">
        <div class="ds-label">{props.label}</div>
        {props.desc && <div class="ds-muted ds-settings-row-desc">{props.desc}</div>}
      </div>
      <div class="ds-settings-row-control">{props.children}</div>
    </div>
  );
}

export interface SettingsToggleRowProps {
  id?: string;
  label: JSX.Element;
  desc?: JSX.Element;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  divider?: boolean;
  title?: string;
}

export function SettingsToggleRow(props: SettingsToggleRowProps) {
  return (
    <SettingsRow label={props.label} desc={props.desc} divider={props.divider}>
      <Switch
        id={props.id}
        checked={props.checked}
        onChange={props.onChange}
        disabled={props.disabled}
        title={props.title}
        aria-label={typeof props.label === "string" ? props.label : undefined}
      />
    </SettingsRow>
  );
}
