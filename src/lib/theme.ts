/**
 * Theme + mode resolution (spec G4, G5, G7).
 *
 * Six visual states: {paper, y2k, chat} × {light, dark}.
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

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

export function isMode(value: unknown): value is Mode {
  return value === 'light' || value === 'dark';
}

/**
 * Reads the theme from a URL. Accepts a couple of forgiving aliases because
 * these links get typed by hand and pasted into applications.
 */
export function themeFromUrl(url: URL): ThemeId | null {
  const raw = url.searchParams.get('theme')?.toLowerCase().trim();
  if (!raw) return null;
  const aliases: Record<string, ThemeId> = {
    paper: 'paper',
    riso: 'paper',
    y2k: 'y2k',
    win98: 'y2k',
    chat: 'chat',
    bot: 'chat',
    chatbot: 'chat',
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

/** Human labels for the always-visible theme switcher (G8). */
export const THEME_LABELS: Record<ThemeId, string> = {
  paper: 'Paper',
  y2k: 'Y2K',
  chat: 'Ask the bot',
};

/**
 * Runs before first paint to prevent a flash of the wrong theme. Inlined into
 * <head> by BaseHead.astro — it must stay dependency-free and synchronous, so
 * the logic above is duplicated here in miniature on purpose. Keep the two in
 * sync; there is no way to share a module with a blocking inline script.
 */
export const NO_FLASH_SCRIPT = `
(function(){
  try {
    var p = new URLSearchParams(location.search).get('theme');
    var alias = {paper:'paper',riso:'paper',y2k:'y2k',win98:'y2k',chat:'chat',bot:'chat',chatbot:'chat'};
    var t = p ? alias[p.toLowerCase().trim()] : null;
    if (!t) { var s = localStorage.getItem('${THEME_STORAGE_KEY}'); if (s === 'paper' || s === 'y2k' || s === 'chat') t = s; }
    var m = localStorage.getItem('${MODE_STORAGE_KEY}');
    if (m !== 'light' && m !== 'dark') {
      m = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    var r = document.documentElement;
    r.dataset.theme = t || '${DEFAULT_THEME}';
    r.dataset.mode = m;
    r.style.colorScheme = m;
    if (t) r.dataset.themeChosen = 'true';
  } catch (e) {}
})();
`.trim();
