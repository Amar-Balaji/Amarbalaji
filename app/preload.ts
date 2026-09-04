/** Length of the preloader timeline (see .loader keyframes in globals.css). */
export const PRELOAD_MS = 7100;

/** ms still to wait before the page's own intro should start playing. */
export function preloadRemaining() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
  return Math.max(0, PRELOAD_MS - performance.now());
}
