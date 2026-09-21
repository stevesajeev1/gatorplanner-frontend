import { untrack } from 'svelte';

export function watch<T>(
  getter: () => T,
  effectCallback: (previous: T, current: T) => void | (() => void),
  initial: false
): void;

export function watch<T>(
  getter: () => T,
  effectCallback: (previous: T | undefined, current: T) => void | (() => void),
  initial?: true
): void;

export function watch<T>(
  getter: () => T,
  effectCallback: (previous: T | undefined, current: T) => void | (() => void),
  initial = true
) {
  let previous: T | undefined;
  let firstRun = true;

  $effect(() => {
    const current = $state.snapshot(getter()) as T;

    if (firstRun && !initial) {
      firstRun = false;
      previous = current;
      return;
    }

    firstRun = false;

    const cleanup = untrack(() => effectCallback(previous, current));
    previous = current;
    return cleanup;
  });
}
