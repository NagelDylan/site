/**
 * Theme + mode resolution (spec G4, G5, G7).
 *
 * Six visual states: {paper, y2k, mac} × {light, dark}. The chat tree is still in
 * the repo but is not a reachable theme — see the comment on THEMES in config.ts,
 * which is the one place that decides that.
 *
 * Resolution order for the theme:
 *   1. `?theme=` query param — wins always, so a link Dylan sends a recruiter
 *      lands directly in the paper theme and bypasses the splash (§12).
 *   2. localStorage — the persisted choice from a previous visit (G5).
 *   3. null — meaning "not chosen yet", which is what shows the splash.
 *
 * This module is framework-agnostic and safe to import from React islands, .astro
 * frontmatter, and the no-flash inline script alike. Keep it free of DOM access
 * at module scope.
 */
import { DEFAULT_THEME, MODE_STORAGE_KEY, THEMES, THEME_STORAGE_KEY } from '../config';
import type { ThemeId } from '../data/voice';

export type Mode = 'light' | 'dark';

/**
 * Whether this is a theme a visitor is allowed to be in.
 *
 * Reads THEMES, so it means *reachable* rather than *defined*: `ThemeId` has a
 * fourth member ('chat') that this returns false for on purpose. That is what
 * sends a returning visitor with 'chat' persisted to the chooser instead of into
 * a hidden theme.
 */
export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

export function isMode(value: unknown): value is Mode {
  return value === 'light' || value === 'dark';
}

/**
 * Reads the theme from a URL. Accepts a couple of forgiving aliases because
 * these links get typed by hand and pasted into applications.
 *
 * NOTE: this map is duplicated inside NO_FLASH_SCRIPT at the bottom of the
 * file, because a blocking inline script cannot import a module. Every alias
 * added here must be added there too, or `?theme=<alias>` resolves correctly
 * one frame *after* paper has already painted.
 *
 * The 'chat'/'bot'/'chatbot' aliases were removed when the chat theme was hidden
 * (see THEMES in config.ts): with no alias, `?theme=chat` returns null and the
 * visitor gets the chooser. Removing them here is what makes the theme
 * unreachable by URL rather than merely unadvertised — if you re-add them, add
 * 'chat' to THEMES in the same commit, or a link will resolve to a theme that
 * `isThemeId` then rejects one frame later.
 */
export function themeFromUrl(url: URL): ThemeId | null {
  const raw = url.searchParams.get('theme')?.toLowerCase().trim();
  if (!raw) return null;
  const aliases: Record<string, ThemeId> = {
    paper: 'paper',
    riso: 'paper',
    y2k: 'y2k',
    win98: 'y2k',
    // The Classic Mac theme. 'apple' is deliberately NOT an alias: the theme is
    // never labelled or addressed as Apple anywhere, in UI or in a URL (R3 and
    // the trademark boundary in the mac-theme spec, §2).
    mac: 'mac',
    macos: 'mac',
    classic: 'mac',
    system7: 'mac',
    os9: 'mac',
    platinum: 'mac',
    finder: 'mac',
  };
  return aliases[raw] ?? null;
}

/** Client-side resolution. Returns null when the splash should be shown. */
export function resolveTheme(url: URL): ThemeId | null {
  const fromUrl = themeFromUrl(url);
  if (fromUrl) return fromUrl;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeId(stored)) return stored;
  } catch {
    // Private-mode / blocked storage. Fall through to the splash rather than
    // guessing — a visitor who cannot persist a choice should still get one.
  }
  return null;
}

export function resolveMode(): Mode {
  try {
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    if (isMode(stored)) return stored;
  } catch {
    /* ignore */
  }
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function persistTheme(theme: ThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function persistMode(mode: Mode): void {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

/** Applies state to <html> as data attributes; all theme CSS keys off these. */
export function applyToDocument(theme: ThemeId | null, mode: Mode): void {
  const root = document.documentElement;
  root.dataset.theme = theme ?? DEFAULT_THEME;
  root.dataset.mode = mode;
  root.style.colorScheme = mode;
}

/**
 * Human labels for the always-visible theme switcher (G8).
 *
 * "Windows Y2K" rather than bare "Y2K", because there are two retro-OS themes
 * now and the pair has to name its platform on both sides to mean anything.
 * Against "Classic Mac", a label reading only "Y2K" implies the Macintosh one is
 * from some other era — it is the same year — when the actual difference between
 * them is which machine. The theme *id* stays `y2k`: it is in persisted
 * localStorage values, in `?theme=y2k` links already sent out, in the component
 * directory name and in every CSS selector, and none of that is worth churning
 * to match a chip.
 *
 * Still keyed by the full `ThemeId`, chat included, even though no control renders
 * the chat entry any more: the record is what makes it a one-line restore, and
 * `Record<ThemeId, string>` would stop compiling if the key were removed.
 */
export const THEME_LABELS: Record<ThemeId, string> = {
  paper: 'Paper',
  y2k: 'Windows Y2K',
  mac: 'Classic Mac',
  chat: 'Ask the bot',
};

/**
 * Forgets the persisted theme and re-opens the chooser splash (§12).
 *
 * Every theme needs a route back to the splash, not just a route to the other
 * two: the splash is the only screen that shows all of them side by side, and it
 * is a portfolio piece in its own right. Y2K reaches it through Start → Shut
 * Down → reboot, and the Classic Mac through Special → Shut Down → the bomb
 * dialog → Restart; paper uses this directly, and both retro desktops also
 * expose it as a plain button (Y2K's taskbar, the Mac's Control Strip) so nobody
 * has to find a shutdown menu to get out (G8).
 *
 * Only the theme choice is cleared. Light/dark and any per-theme boot flag are
 * separate keys and deliberately survive.
 */
export function returnToChooser(): void {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } catch {
    /* private mode — the splash still opens for this page view */
  }
  const root = document.documentElement;
  delete root.dataset.themeChosen;
  root.dataset.splash = 'show';
  /*
   * Tell ThemeBoot to unmount whichever client theme is running.
   *
   * Without this, re-picking the same theme from the splash is a no-op in
   * ThemeBoot (it early-returns when the requested theme is already mounted), so
   * you would land back on a desktop in exactly the state you left it — no boot
   * sequence, windows still open. Unmounting makes the next pick a genuine fresh
   * entry, which is what the Y2K boot console and the Mac startup screen both
   * depend on.
   */
  window.dispatchEvent(new CustomEvent('nagel:theme-reset'));
  /*
   * The splash's own focus handling runs at page load, so move focus in here too
   * for anyone arriving by keyboard after first paint.
   *
   * Focus the dialog, NOT the first panel: focusing an anchor programmatically
   * makes Chrome match :focus-visible on it, which paints the Paper panel in its
   * raised hover state and reads as pre-selected. Tab from the container still
   * lands on Paper first.
   */
  document.getElementById('splash')?.focus({ preventScroll: true });
}

/**
 * Runs before first paint to prevent a flash of the wrong theme. Inlined into
 * <head> by BaseHead.astro — it must stay dependency-free and synchronous, so
 * the logic above is duplicated here in miniature on purpose. Keep the two in
 * sync; there is no way to share a module with a blocking inline script.
 *
 * TWO THINGS DRIFT, AND BOTH HAVE BITTEN THIS FILE:
 *   1. the `alias` map — must list every alias `themeFromUrl` accepts, or
 *      `?theme=platinum` resolves a frame late, after paper has painted;
 *   2. the persisted-theme guard, which spells out the valid ids literally
 *      rather than reading THEMES (nothing can be imported here). A theme
 *      missing from that guard is read from localStorage, fails the check, and
 *      falls through to DEFAULT_THEME — so a returning visitor gets a flash of
 *      paper before their real theme mounts. That is precisely the bug commit
 *      900c415 was written to fix. Adding a theme means editing both lines.
 *
 * 'chat' is absent from both, which is deliberate and is the whole reason the
 * hidden theme is unreachable rather than just unlinked. Note the interaction
 * with (2): a visitor with 'chat' still in localStorage fails the guard, so this
 * script leaves `data-themeChosen` unset and sets `data-splash="show"` — they get
 * the chooser, which is the intended landing, not a flash of paper.
 */
export const NO_FLASH_SCRIPT = `
(function(){
  try {
    var p = new URLSearchParams(location.search).get('theme');
    var alias = {paper:'paper',riso:'paper',y2k:'y2k',win98:'y2k',mac:'mac',macos:'mac',classic:'mac',system7:'mac',os9:'mac',platinum:'mac',finder:'mac'};
    var t = p ? alias[p.toLowerCase().trim()] : null;
    if (!t) { var s = localStorage.getItem('${THEME_STORAGE_KEY}'); if (s === 'paper' || s === 'y2k' || s === 'mac') t = s; }
    var m = localStorage.getItem('${MODE_STORAGE_KEY}');
    if (m !== 'light' && m !== 'dark') {
      m = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    var r = document.documentElement;
    r.dataset.theme = t || '${DEFAULT_THEME}';
    r.dataset.mode = m;
    r.style.colorScheme = m;
    if (t) {
      r.dataset.themeChosen = 'true';
    } else {
      // No stored or requested theme: this is a first visit, so show the splash
      // (G5). Set from script rather than in the markup so that a visitor
      // without JS — and any crawler — gets the full paper site immediately
      // instead of being held behind a gate they cannot dismiss.
      r.dataset.splash = 'show';
    }
  } catch (e) {}
})();
`.trim();
