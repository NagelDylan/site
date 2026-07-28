/**
 * Contact form — Phase A (§18.4).
 *
 * The UI is complete, the Turnstile widget has a marked slot, and the submit
 * handler logs to the console and shows a result state. What it does NOT do is
 * claim the message was sent, because nothing is sent: there is no Cloudflare
 * account, no Turnstile key, and no email service yet.
 *
 * That honesty is deliberate and load-bearing. A form that says "thanks, I'll be
 * in touch!" while dropping the message on the floor is worse than no form —
 * it silently loses a recruiter. So the success state says plainly that the form
 * isn't wired yet and points at the mailto link, which does work.
 *
 * Phase B: flip FEATURES.formSubmission and FEATURES.turnstile in src/config.ts,
 * set TURNSTILE_SITE_KEY, and POST to ENDPOINTS.contact where the Worker verifies
 * the Turnstile token server-side (§13).
 */
import { useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import { ENDPOINTS, FEATURES, TURNSTILE_SITE_KEY } from '../../config';
import { IDENTITY } from '../../data/identity';

type Status = 'idle' | 'sending' | 'stubbed' | 'sent' | 'error';

const ContactForm = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const update =
    (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const onSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');

    if (!FEATURES.formSubmission) {
      // eslint-disable-next-line no-console
      console.info('[contact] Phase A stub — nothing was transmitted:', form);
      setStatus('stubbed');
      return;
    }

    try {
      const response = await fetch(ENDPOINTS.contact, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(response.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <label className="field">
        <span>your name</span>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={update('name')}
          autoComplete="name"
          required
        />
      </label>

      <label className="field">
        <span>your email</span>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={update('email')}
          autoComplete="email"
          required
        />
      </label>

      <label className="field">
        <span>message</span>
        <textarea name="message" value={form.message} onChange={update('message')} required />
      </label>

      {/*
        Turnstile slot. Cloudflare's script renders into this container once a site
        key exists; the token is then verified server-side in the Worker, which is
        the whole reason Turnstile was chosen over a client-only captcha (§13).
      */}
      <div
        className="cf-turnstile"
        data-sitekey={TURNSTILE_SITE_KEY ?? undefined}
        style={{
          margin: '0 0 1.1rem',
          padding: '0.6rem 0.8rem',
          border: '1.5px dashed rgba(38,36,31,0.4)',
          fontSize: '0.85rem',
          fontFamily: 'var(--font-type)',
        }}
      >
        {FEATURES.turnstile ? null : 'Turnstile slot — activates in Phase B'}
      </div>

      <button className="btn btn--primary" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'sending…' : 'send ✎'}
      </button>

      <div role="status" aria-live="polite" style={{ marginTop: '1rem' }}>
        {status === 'stubbed' && (
          <p>
            <strong>This form isn't connected yet.</strong> Nothing was sent — I didn't want to
            pretend otherwise. Email me directly at{' '}
            <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a> and it'll actually reach me.
          </p>
        )}
        {status === 'sent' && <p>Thanks — that reached me. I'll reply soon.</p>}
        {status === 'error' && (
          <p>
            Something went wrong sending that. Please email{' '}
            <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a> instead.
          </p>
        )}
      </div>
    </form>
  );
};

export default ContactForm;
