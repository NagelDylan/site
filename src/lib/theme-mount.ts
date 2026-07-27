/**
 * How three themes share one set of URLs (spec G7, G9, G10, §13).
 *
 * ─── THE PROBLEM ────────────────────────────────────────────────────────────
 * G7 requires the same URLs across all three themes. §13 requires every route to
 * ship as real static HTML. But a static build cannot know which theme a given
 * visitor has persisted in localStorage, so it cannot pick a tree at build time,
 * and redirecting per theme would break G7's "same URLs".
 *
 * ─── THE RESOLUTION ─────────────────────────────────────────────────────────
 * Paper is server-rendered; Y2K and chat mount on the client.
 *
 *   • PAPER renders into static HTML at every route, server-side, with no JS
 *     required to read it. This is the canonical site: it is what crawlers index,
 *     what deep links resolve to, what the OG image comes from, and what Dylan
 *     links on applications (§9). It is also the no-JS fallback for all three
 *     themes, which is the best possible degradation — a recruiter with Y2K
 *     persisted and a broken bundle gets the most legible version of the site.
 *
 *   • Y2K and CHAT are interactive applications rather than documents — a window
 *     manager and a chat client. Each is one React root that takes over the
 *     viewport when its theme is active, dynamically imported so a paper visitor
 *     never downloads a byte of the other two. Both read the same fact layer, so
 *     G10 holds: each theme conveys all the information on its own.
 *
 * This keeps G9 honest — the trees share no structure, only the fact layer — and
 * it means switching themes is instant and never navigates or reloads.
 *
 * ─── THE CONTRACT EACH THEME IMPLEMENTS ─────────────────────────────────────
 * A theme module default-exports a React component accepting ThemeAppProps, and
 * lives at src/components/<theme>/App.tsx. Nothing else about its internals is
 * shared or specified.
 */
import type { ThemeId } from '../data/voice';

/** Routes the site knows about (§8). Paper renders all of them as pages. */
export const ROUTES = [
  '/',
  '/experience',
  '/projects',
  '/projects/acronymize',
  '/projects/flowsense',
  '/projects/tanks',
  '/about',
  '/contact',
] as const;

export type RouteId = (typeof ROUTES)[number];

/**
 * Props every client-mounted theme receives.
 *
 * `route` lets a deep link do the right thing per theme: /experience opens the
 * Experience window in Y2K rather than dumping the visitor on a bare desktop,
 * and the chat can open with relevant context. Same URL, theme-appropriate
 * behaviour — which is the whole intent of G7.
 */
export type ThemeAppProps = {
  route: string;
  /** Resolved server-side: whether public/resume.pdf exists (§13). */
  resume: { available: boolean; href: string; filename: string };
  /** Initial light/dark, already applied to <html> by the pre-paint script. */
  mode: 'light' | 'dark';
};

/** Where the client-mounted themes attach. Paper owns the server-rendered tree. */
export const APP_ROOT_ID = 'theme-app-root';
export const PAPER_ROOT_ID = 'paper-root';

/** Themes that mount on the client rather than being server-rendered. */
export const CLIENT_THEMES: readonly ThemeId[] = ['y2k', 'chat'];

export function isClientTheme(theme: ThemeId | null): boolean {
  return theme !== null && CLIENT_THEMES.includes(theme);
}
