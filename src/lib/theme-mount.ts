/**
 * How the themes share one set of URLs (spec G7, G9, G10, §13).
 *
 * Three themes are reachable — paper, y2k, mac. A fourth tree (chat) is still in
 * the repo and still compiles, but is hidden and cannot be mounted; THEMES in
 * config.ts is the switch, and the CLIENT_THEMES comment below is the second lock.
 * Read the description of it here as "how it works when it is switched on".
 *
 * ─── THE PROBLEM ────────────────────────────────────────────────────────────
 * G7 requires the same URLs across every theme. §13 requires every route to
 * ship as real static HTML. But a static build cannot know which theme a given
 * visitor has persisted in localStorage, so it cannot pick a tree at build time,
 * and redirecting per theme would break G7's "same URLs".
 *
 * ─── THE RESOLUTION ─────────────────────────────────────────────────────────
 * Paper is server-rendered; Y2K, mac and chat mount on the client.
 *
 *   • PAPER renders into static HTML at every route, server-side, with no JS
 *     required to read it. This is the canonical site: it is what crawlers index,
 *     what deep links resolve to, what the OG image comes from, and what Dylan
 *     links on applications (§9). It is also the no-JS fallback for every other
 *     theme, which is the best possible degradation — a recruiter with Y2K
 *     persisted and a broken bundle gets the most legible version of the site.
 *
 *   • Y2K, MAC and CHAT are interactive applications rather than documents — two
 *     window managers and a chat client. Each is one React root that takes over
 *     the viewport when its theme is active, dynamically imported so a paper
 *     visitor never downloads a byte of the other three. All read the same fact
 *     layer, so G10 holds: each theme conveys all the information on its own.
 *
 * Y2K (Windows 98) and mac (Mac OS 8/9 Platinum) are the same era from opposite
 * sides of the aisle. They deliberately share no code — not a hook, not an icon
 * — because G9's independence is what keeps them from converging into one grey
 * desktop with two skins. The duplication is the intended cost.
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
  // Sits beside /about because it is another document about Dylan, not a project.
  // Paper owns this one as a real page with the PDF embedded in it; y2k and mac
  // resolve the same URL to their own Résumé window, and chat has no special
  // handling and falls through to its default opening. The route exists whether
  // or not the file does — the page itself is what says so honestly (§18.5).
  '/resume',
  '/contact',
] as const;

export type RouteId = (typeof ROUTES)[number];

/**
 * Props every client-mounted theme receives.
 *
 * `route` lets a deep link do the right thing per theme: /experience opens the
 * Experience window in Y2K and Work History on the Mac desktop rather than
 * dumping the visitor on a bare desktop, and the chat can open with relevant
 * context. Same URL, theme-appropriate behaviour — which is the whole intent of
 * G7.
 */
export type ThemeAppProps = {
  route: string;
  /**
   * Resolved server-side: whether public/resume.pdf exists (§13), plus every href
   * a theme could need. `viewHref` is precomputed so a client theme never has to
   * know the PDF open-parameter syntax — one place decides how the document is
   * fitted, and a download link can never accidentally inherit the fragment.
   * Mirrors ResumeState in src/lib/resume.ts; that module is the shape's owner.
   */
  resume: {
    available: boolean;
    href: string;
    viewHref: string;
    page: string;
    filename: string;
  };
  /** Initial light/dark, already applied to <html> by the pre-paint script. */
  mode: 'light' | 'dark';
};

/** Where the client-mounted themes attach. Paper owns the server-rendered tree. */
export const APP_ROOT_ID = 'theme-app-root';
export const PAPER_ROOT_ID = 'paper-root';

/**
 * Themes that mount on the client rather than being server-rendered.
 *
 * A theme missing from this list silently renders as paper: isClientTheme()
 * returns false, ThemeBoot reveals the server tree and never imports the App.
 * Add the id here and to loadApp() in ThemeBoot.astro together.
 *
 * 'chat' is off this list because the chat theme is hidden (see THEMES in
 * config.ts). Belt and braces: it is already unreachable — nothing links to it,
 * no URL alias resolves to it, and `isThemeId` rejects it — so this line is the
 * second lock rather than the first. ThemeBoot's `loadApp` deliberately KEEPS its
 * chat branch, so restoring the theme is one edit here rather than two.
 */
export const CLIENT_THEMES: readonly ThemeId[] = ['y2k', 'mac'];

export function isClientTheme(theme: ThemeId | null): boolean {
  return theme !== null && CLIENT_THEMES.includes(theme);
}
