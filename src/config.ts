/**
 * Site-level configuration.
 */
import { CONTACT_ENABLED } from './lib/contact';

export const SITE_URL = 'https://dylan.nagelbros.com';

export const SITE = {
  title: 'Dylan Nagel — Full-Stack Developer · AI & LLM Systems',
  ogImage: '/og/card.png',
  locale: 'en_CA',
} as const;

/**
 * The résumé is a drop-in: put public/resume.pdf in place and the desktop icon,
 * the Start menu entry and the Acrobat window all appear at once. `force`
 * overrides the existence check in either direction.
 */
export const RESUME = {
  path: '/resume.pdf',
  filename: 'Dylan-Nagel-Resume.pdf',
  /**
   * Appended when embedding the PDF so it opens fitted to the window. Kept
   * minimal on purpose: #toolbar=0 and #navpanes=0 are Acrobat-plugin
   * parameters that Chrome only partly honours and Firefox ignores, so relying
   * on them means a different-looking window per browser. view=FitH is broadly
   * respected.
   */
  viewParams: '#view=FitH',
  force: null as boolean | null,
} as const;

/**
 * Cloudflare Turnstile site key. Public by design — it identifies the widget.
 *
 * Turning it on takes three steps together: paste the site key here, paste the
 * secret key into the Web3Forms dashboard so tokens actually get verified, and
 * add Cloudflare's script to the layout guarded on this key (no page loads it
 * today).
 */
export const TURNSTILE_SITE_KEY: string | null = null;

export const FEATURES = {
  /**
   * Contact form delivery, derived from whether a Web3Forms access key exists in
   * this build so the form can't advertise a delivery path it doesn't have. Add
   * PUBLIC_WEB3FORMS_ACCESS_KEY to .env locally, or as a repo secret for the
   * deploy build (.github/workflows/deploy.yml), and it starts sending.
   * See src/lib/contact.ts.
   */
  formSubmission: CONTACT_ENABLED,
  turnstile: TURNSTILE_SITE_KEY !== null,
} as const;
