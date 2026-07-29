/**
 * The one place a contact message actually leaves the browser.
 *
 * ─── WHY A THIRD PARTY AND NOT A WORKER ──────────────────────────────────────
 * This site is fully static (`output: 'static'`, no adapter — see astro.config.mjs)
 * and it is going to stay that way, because prerendered HTML is what §13 wants for
 * deep links and SEO. A static site has nowhere to keep a secret: anything the
 * browser can read, a visitor can read. So the original Phase B plan — a Pages
 * Function that verifies a Turnstile token with a secret key and then talks to an
 * email service — cannot be done without standing up a server.
 *
 * Web3Forms is the substitute. It holds the mail credentials and (once Turnstile
 * is switched on) the captcha secret, and it relays submissions to Dylan's inbox.
 * The verification that used to be "server-side in our Worker" is still genuinely
 * server-side — just on their servers rather than ours.
 *
 * ─── WHAT THE ACCESS KEY IS, AND ISN'T ───────────────────────────────────────
 * The access key ships in the JS bundle. That is by design: it is a routing
 * identifier, not a credential — it says "deliver to this inbox" and nothing more.
 * It cannot read past submissions or change the destination. What it *can* do is
 * be scraped and POSTed to by a bot, which is why the honeypot below exists and
 * why Turnstile is worth turning on. Do not treat this key as a secret and do not
 * add anything to this module that assumes it is one.
 *
 * ─── THE HONESTY CONTRACT (§18.5) ────────────────────────────────────────────
 * Every caller must render a success state only when this function returns
 * `{ ok: true }`, which happens only when Web3Forms answered `success: true`. A
 * form that reports delivery it did not confirm is the one failure mode this
 * codebase argues against in four different voices. Optimism is not permitted
 * here: on any other outcome the caller says it did not go through and points at
 * the mailto link, which needs no server at all.
 */
import { IDENTITY } from '../data/identity';

/**
 * From `.env` (gitignored) at build time, or the Pages build environment in
 * production. `PUBLIC_` is required for Astro to expose it to client bundles, and
 * the prefix is an accurate label: this value is public.
 */
const ACCESS_KEY: string | null = import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY?.trim() || null;

/** Web3Forms' single submission endpoint. */
const ENDPOINT = 'https://api.web3forms.com/submit';

/** Give up rather than leave a form spinning forever on a dead network. */
const TIMEOUT_MS = 15_000;

/**
 * Whether a message can actually be delivered right now.
 *
 * `FEATURES.formSubmission` in src/config.ts is derived from this rather than set
 * by hand, so the flag cannot be switched on with nothing behind it — the exact
 * dishonesty the old Phase A comments were guarding against.
 */
export const CONTACT_ENABLED = ACCESS_KEY !== null;

/** Which theme the visitor was in. Rides along so Dylan can see what they used. */
export type ContactSource = 'paper' | 'y2k' | 'mac' | 'chat';

export type ContactMessage = {
  email: string;
  message: string;
  name?: string;
  company?: string;
  subject?: string;
  source: ContactSource;
  /** True when the honeypot was filled. See `useHoneypot`. */
  botcheck?: boolean;
};

/**
 * `unconfigured` — no access key in this build, so nothing was attempted.
 * `rejected`     — Web3Forms answered, and the answer was no (bad key, captcha
 *                  failure, honeypot, quota). The message did not arrive.
 * `network`      — the request never completed. Unknown whether it arrived; the
 *                  caller must not claim it did.
 */
export type ContactFailure = 'unconfigured' | 'rejected' | 'network';

export type ContactResult = { ok: true } | { ok: false; reason: ContactFailure };

const SOURCE_LABELS: Record<ContactSource, string> = {
  paper: 'paper theme — /contact',
  y2k: 'Y2K theme — Messenger window',
  mac: 'Classic Mac theme — New Message window',
  chat: 'chat theme — recruiter capture',
};

const defaultSubject = (msg: ContactMessage) => {
  if (msg.subject?.trim()) return msg.subject.trim();
  if (msg.company?.trim()) return `nagel-site — ${msg.company.trim()}`;
  if (msg.name?.trim()) return `nagel-site — message from ${msg.name.trim()}`;
  return 'nagel-site — new message';
};

/**
 * Send a message. Never throws: every failure comes back as a `reason` so the
 * caller is forced to have a branch for it.
 */
export const submitContact = async (msg: ContactMessage): Promise<ContactResult> => {
  if (!ACCESS_KEY) return { ok: false, reason: 'unconfigured' };

  // Local honeypot check. Web3Forms rejects `botcheck` on its side too, and that
  // is the one that counts — this just saves a round trip.
  if (msg.botcheck) return { ok: false, reason: 'rejected' };

  const body = {
    access_key: ACCESS_KEY,
    subject: defaultSubject(msg),
    from_name: msg.name?.trim() || 'nagel-site visitor',
    // Puts the visitor's address in Reply-To, so answering the notification email
    // answers the visitor rather than Web3Forms.
    replyto: msg.email,
    botcheck: msg.botcheck ?? false,
    name: msg.name?.trim() || '(not given)',
    email: msg.email,
    company: msg.company?.trim() || '(not given)',
    message: msg.message,
    sent_from: SOURCE_LABELS[msg.source],
  };

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    // Web3Forms answers 200 with `{ success: false, message }` for a rejected
    // submission, so the status code alone is not enough to claim delivery.
    const payload = (await response.json().catch(() => null)) as { success?: boolean } | null;
    if (response.ok && payload?.success === true) return { ok: true };
    return { ok: false, reason: 'rejected' };
  } catch {
    return { ok: false, reason: 'network' };
  }
};

/**
 * The prefilled-mailto fallback, which every failure branch offers.
 *
 * This is the route that works with no server, no third party and no key, and it
 * is why a failed submission never costs the visitor what they typed.
 */
export const contactMailto = (msg: Partial<ContactMessage>) => {
  const lines = [
    msg.name?.trim() ? `From: ${msg.name.trim()}` : null,
    msg.company?.trim() ? `Company: ${msg.company.trim()}` : null,
    msg.email?.trim() ? `Reply to: ${msg.email.trim()}` : null,
    '',
    msg.message?.trim() || '(no message)',
  ].filter((line) => line !== null);

  const subject = defaultSubject({
    email: msg.email ?? '',
    message: msg.message ?? '',
    name: msg.name,
    company: msg.company,
    subject: msg.subject,
    source: msg.source ?? 'paper',
  });

  return `mailto:${IDENTITY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    lines.join('\n'),
  )}`;
};
