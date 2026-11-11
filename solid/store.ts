// Solid adapter for the framework-free controller: the same state, as signals.
import { createSignal, getOwner, onCleanup, type Accessor } from "solid-js";
import type { Density, SoulWindow } from "soulwindow/runtime";

export interface SoulWindowSignals {
  theme: Accessor<string>;
  accent: Accessor<string>;
  density: Accessor<Density>;
  isDark: Accessor<boolean>;
}

/** Signals that follow `sw`. Call inside a component or root so the subscription is cleaned up. */
export function useSoulWindow(sw: SoulWindow): SoulWindowSignals {
  const [theme, setTheme] = createSignal(sw.theme());
  const [accent, setAccent] = createSignal(sw.accent());
  const [density, setDensity] = createSignal<Density>(sw.density());
  const unsubscribe = sw.subscribe((s) => {
    setTheme(s.theme);
    setAccent(s.accent);
    setDensity(s.density);
  });
  if (getOwner()) onCleanup(unsubscribe);
  return { theme, accent, density, isDark: () => (theme(), sw.isDark()) };
}
