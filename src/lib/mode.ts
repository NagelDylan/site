/**
 * Light/dark mode: teal Windows desktop vs. late-night CRT.
 *
 * No DOM access at module scope, so this is safe to import from React and from
 * .astro frontmatter alike.
 */
export type Mode = 'light' | 'dark';

const MODE_STORAGE_KEY = 'nagel-mode';

export function persistMode(mode: Mode): void {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    /* private mode — the toggle still works for this page view */
  }
}

/**
 * Runs before first paint so a dark-mode visitor never gets a frame of teal.
 * Inlined into <head>, so it has to be synchronous and dependency-free; hence the
 * duplicated storage key logic.
 */
export const NO_FLASH_SCRIPT = `
(function(){
  try {
    var m = localStorage.getItem('${MODE_STORAGE_KEY}');
    if (m !== 'light' && m !== 'dark') {
      m = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.dataset.mode = m;
    document.documentElement.style.colorScheme = m;
  } catch (e) {}
})();
`.trim();
