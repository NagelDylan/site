/**
 * Site-level configuration and Phase B seams.
 *
 * Anything that needs an account, a key, or a domain Dylan does not have yet
 * (spec §18.4) is switched off here rather than half-built. Flipping a flag in
 * this file is the whole of the Phase B wiring on the frontend side.
 */

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
 * download button appears everywhere at once, with no code change. The existence
 * check runs at build time in src/lib/resume.ts — server-only, so this module
 * stays importable from React islands.
 *
 * `force` overrides the check: true to render the button regardless, false to
 * suppress it even if the file is present.
 */
export const RESUME = {
  path: '/resume.pdf',
  filename: 'Dylan-Nagel-Resume.pdf',
  force: null as boolean | null,
} as const;

/**
 * Phase B feature flags (§18.4). All false until credentials exist.
 * Do not flip one without wiring the thing behind it — a switched-on flag with
 * a stub behind it is exactly the dishonesty §18.5 forbids.
 */
export const FEATURES = {
  /** false ⇒ chat uses StubTransport and shows the demo-mode notice (§18.5). */
  liveChat: false,
  /** false ⇒ contact form renders a Turnstile placeholder slot, no real widget. */
  turnstile: false,
  /** false ⇒ submit handler logs and shows the success state; nothing is sent. */
  formSubmission: false,
  /** false ⇒ no analytics snippet is emitted (§18.4). */
  analytics: false,
} as const;

/** Phase B endpoints, served by the Cloudflare Worker via Pages Functions. */
export const ENDPOINTS = {
  chat: '/api/chat',
  contact: '/api/contact',
} as const;

/** Populated in Phase B from a Cloudflare Turnstile site key. */
export const TURNSTILE_SITE_KEY: string | null = null;

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

/** Theme ids, in the order the splash presents them (§12). */
export const THEMES = ['paper', 'y2k', 'chat'] as const;
export const DEFAULT_THEME = 'paper';
/** localStorage key for the persisted theme choice (G5). */
export const THEME_STORAGE_KEY = 'nagel-theme';
export const MODE_STORAGE_KEY = 'nagel-mode';
