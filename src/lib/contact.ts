/**
 * Posts the contact form to Web3Forms.
 *
 * The site is fully static, so there is no server of ours to hold a mail secret.
 * Web3Forms holds the credentials and relays submissions to the inbox. The access
 * key ships in the JS bundle by design: it says "deliver to this inbox" and nothing
 * more, so it is a routing identifier rather than a credential. It can still be
 * scraped and POSTed to by a bot, hence the honeypot below.
 *
 * Callers must show a success state only when this returns `{ ok: true }`. On any
 * other outcome, say it did not go through and offer the mailto fallback.
 */
import { IDENTITY } from '../data/identity';

/**
 * From `.env` (gitignored) at build time, or the Pages build environment in
 * production. `PUBLIC_` is required for Astro to expose it to client bundles, and
 * the prefix is an accurate label: this value is public.
 */
const ACCESS_KEY: string | null = import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY?.trim() || null;

const ENDPOINT = 'https://api.web3forms.com/submit';

/** Give up rather than leave a form spinning forever on a dead network. */
const TIMEOUT_MS = 15_000;

/**
 * Whether a message can actually be delivered right now. `FEATURES.formSubmission`
 * in src/config.ts is derived from this rather than set by hand, so the flag cannot
 * be switched on with nothing behind it.
 */
export const CONTACT_ENABLED = ACCESS_KEY !== null;

export type ContactMessage = {
  email: string;
  message: string;
  name?: string;
  company?: string;
  subject?: string;
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
    sent_from: 'nagel-site — Messenger window',
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

/** The prefilled-mailto fallback offered on every failure branch. */
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
  });

  return `mailto:${IDENTITY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    lines.join('\n'),
  )}`;
};
