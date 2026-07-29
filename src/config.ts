/**
 * Site-level configuration.
 *
 * Anything that needs an account, a key, or a domain Dylan does not have yet
 * (spec §18.4) is switched off here rather than half-built. Two flags are no
 * longer switches at all — `formSubmission` and `turnstile` are computed from
 * whether their key exists, so they cannot be on with nothing behind them.
 */
import { CONTACT_ENABLED } from './lib/contact';

/** Deferred: ship on the Pages subdomain first (§1, §13). */
export const SITE_URL = 'https://nagel-site.pages.dev';

/** Where the site will eventually live (§13). Used only in docs for now. */
export const FUTURE_DOMAIN = 'me.nagelbros.com';

export const SITE = {
  title: 'Dylan Nagel — Full-Stack Developer · AI & LLM Systems',
  /** OG/social preview is rendered from the paper theme (§9, §13). */
  ogImage: '/og/paper.png',
  locale: 'en_CA',
} as const;

/**
 * Résumé (§13). The file itself is the switch: drop public/resume.pdf in and the
 * download button appears everywhere at once, along with the /resume viewer page
 * and its nav link, with no code change. The existence check runs at build time
 * in src/lib/resume.ts — server-only, so this module stays importable from React
 * islands.
 *
 * `force` overrides the check: true to render the button regardless, false to
 * suppress it even if the file is present.
 */
export const RESUME = {
  path: '/resume.pdf',
  filename: 'Dylan-Nagel-Resume.pdf',
  /**
   * The canonical viewer route, and the single source of truth for that URL.
   * ROUTES in src/lib/theme-mount.ts, the paper page that renders the embed, the
   * paper nav link, and both windowsForRoute() implementations (y2k and mac,
   * which resolve it to their own Résumé window) all key off this string. G7
   * means one set of URLs across four themes, so it must be written once.
   */
  page: '/resume',
  /**
   * Appended to the PDF href when embedding, so the document opens fitted to the
   * width of whatever box it lands in rather than at some arbitrary zoom.
   *
   * Deliberately this minimal. #toolbar=0 and #navpanes=0 are Adobe-plugin open
   * parameters: Chrome's built-in viewer honours them only partially and
   * Firefox's pdf.js ignores them outright, so leaning on them to hide viewer
   * chrome yields a different-looking window in every browser — the worst kind of
   * layout bug, because it only appears on someone else's machine. view=FitH is
   * the one parameter broadly respected, so it is the only one we send.
   */
  viewParams: '#view=FitH',
  force: null as boolean | null,
} as const;

/**
 * Cloudflare Turnstile site key. Public by design — it identifies the widget and
 * is meant to be in the page.
 *
 * To switch it on: create a widget at Cloudflare (free, no Pages project needed),
 * paste the site key here, and paste the *secret* key into the Web3Forms dashboard
 * for this form. Web3Forms then verifies the token before relaying anything. Do
 * not set this without doing the dashboard half — a widget nobody verifies is
 * decoration that costs a third-party script.
 *
 * The widget also needs Cloudflare's script, which no page loads today on purpose
 * (nothing third-party is fetched while the key is null). Add it to
 * src/components/shared/BaseHead.astro, guarded on this key, at the same time.
 *
 * Declared above FEATURES because FEATURES reads it. Moving it below would be a
 * temporal-dead-zone crash at module init, not a type error.
 */
export const TURNSTILE_SITE_KEY: string | null = null;

/**
 * Feature flags (§18.4). Anything still false has no implementation behind it.
 * Do not flip one by hand without wiring the thing behind it — a switched-on flag
 * with a stub behind it is exactly the dishonesty §18.5 forbids.
 */
export const FEATURES = {
  /** false ⇒ chat uses StubTransport and shows the demo-mode notice (§18.5). */
  liveChat: false,
  /**
   * Contact form delivery. NOT hand-set: derived from whether a Web3Forms access
   * key exists in this build, so the flag physically cannot claim a delivery path
   * that isn't there. Add PUBLIC_WEB3FORMS_ACCESS_KEY to .env (or the Pages build
   * environment) and all four forms start sending. See src/lib/contact.ts.
   */
  formSubmission: CONTACT_ENABLED,
  /**
   * Cloudflare Turnstile. Also derived, from the presence of the site key above.
   *
   * Note what this flag now means: the secret half of the verification lives in
   * the Web3Forms dashboard, not in a Worker of ours, because a static site has
   * nowhere to keep a secret.
   */
  turnstile: TURNSTILE_SITE_KEY !== null,
  /** false ⇒ no analytics snippet is emitted (§18.4). */
  analytics: false,
} as const;

/**
 * Chat endpoint, still unbuilt (functions/README.md). The contact endpoint that
 * used to sit beside it is gone: delivery goes straight to Web3Forms from the
 * browser, so there is no route of ours in the path. See src/lib/contact.ts for
 * why that is the only option on a fully static site.
 */
export const ENDPOINTS = {
  chat: '/api/chat',
} as const;

/**
 * Launch-pass link audit (spec Appendix).
 *
 * Outbound links were unreachable from the environment where the spec was
 * compiled, and the six secondary repo URLs were inferred from the §19.9
 * wireframe rather than given verbatim. Every Link in the fact layer carries a
 * `verified` boolean.
 *
 * Set this to true once Dylan has clicked through the unverified ones. While it
 * is false the site still renders them — a plausible repo link is better than a
 * missing one for a project that definitely exists — but `npm run audit:links`
 * lists exactly what needs checking.
 */
export const LINK_AUDIT_COMPLETE = false;

/**
 * Theme ids, in the order the splash presents them (§12).
 *
 * ─── THIS LIST IS THE VISIBILITY SWITCH ──────────────────────────────────────
 * Everything that offers a theme to a visitor reads it: the splash panels, the
 * Mac's Chooser, paper's control chips, the Y2K taskbar's switcher, and
 * `isThemeId` — which is what validates a `?theme=` value and a persisted
 * localStorage choice. An id missing from here is unreachable at runtime: no
 * control links to it, no URL resolves to it, and a stored preference for it
 * fails validation and falls through to the chooser.
 *
 * 'chat' is deliberately absent. The whole chat tree is still in the repo and
 * still compiles — src/components/chat/, src/lib/chat/, src/lib/fact-pack.ts,
 * theme-chat.css, its splash panel CSS, its Chooser driver entry and its
 * THEME_LABELS entry are all intact — it simply cannot be reached. `ThemeId` in
 * src/data/voice.ts still has four members, which is what keeps those
 * `Record<ThemeId, …>` tables compiling with their chat entries in place.
 *
 * To bring it back: add 'chat' to this list, restore the `chat` aliases and the
 * persisted-id guard in src/lib/theme.ts (both the module and NO_FLASH_SCRIPT),
 * add it back to CLIENT_THEMES in src/lib/theme-mount.ts, restore the
 * `import('../chat/App')` line in ThemeBoot.astro's loadApp — without it the tree
 * is never bundled — and re-render the splash's chat panel, whose markup is quoted
 * in place in Splash.astro. Then widen .splash-panels back to four.
 *
 * The two retro-OS themes sit next to each other on purpose: 'y2k' is a
 * Windows 98 desktop and 'mac' is a Mac OS 8/9 Platinum one, so putting them
 * side by side in the chooser is what makes the joke land. This order is the
 * single source of truth for the splash panel order — if you reorder here,
 * reorder the panels in Splash.astro to match.
 */
export const THEMES = ['paper', 'y2k', 'mac'] as const;
export const DEFAULT_THEME = 'paper';
/** localStorage key for the persisted theme choice (G5). */
export const THEME_STORAGE_KEY = 'nagel-theme';
export const MODE_STORAGE_KEY = 'nagel-mode';
