import { useEffect } from 'react';

/**
 * Removes the `pointer-events: none` Radix UI sometimes leaves on document.body
 * when a Dialog unmounts or closes mid-animation.
 *
 * Pass the `open` boolean(s) of every Dialog on the page so the cleanup runs
 * whenever any of them transitions from open → closed.
 */
export function useDialogCleanup(openStates: boolean[]) {
  const anyOpen = openStates.some(Boolean);

  useEffect(() => {
    if (!anyOpen) {
      document.body.style.removeProperty('pointer-events');
    }
  }, [anyOpen]);
}
