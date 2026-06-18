import { useEffect } from 'react';

/**
 * Resets the styles Radix UI leaves on `document.body` while a modal is open
 * (`pointer-events: none`, and sometimes `overflow: hidden`) but occasionally
 * fails to remove if the component unmounts before the close animation finishes.
 * SSR-safe — only touches `document` in the browser.
 */
function resetBodyStyles() {
  if (typeof document === 'undefined') {
    return;
  }
  document.body.style.removeProperty('pointer-events');
  document.body.style.removeProperty('overflow');
}

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
      resetBodyStyles();
    }
  }, [anyOpen]);
}

/**
 * Restores `document.body` interactivity when the calling component unmounts.
 *
 * Wired inside the Radix-based UI primitives (Dialog/AlertDialog/Sheet/Drawer
 * Content). Because the Content component only mounts while the modal is open,
 * its unmount cleanup guarantees the body is always restored even when the
 * modal is torn down before Radix finishes its own close cleanup — the
 * well-known "frozen page" bug. Works for every consumer without changes to
 * feature code.
 */
export function useBodyPointerEventsCleanup() {
  useEffect(() => {
    return () => {
      resetBodyStyles();
    };
  }, []);
}

export { resetBodyStyles };
