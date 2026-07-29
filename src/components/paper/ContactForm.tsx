/**
 * Contact form — paper theme.
 *
 * ─── ON HONESTY ──────────────────────────────────────────────────────────────
 * This form now really sends: `submitContact` POSTs to Web3Forms, which relays
 * the message to Dylan's inbox (src/lib/contact.ts explains why a third party
 * rather than a Worker — a static site has nowhere to keep a secret).
 *
 * What has NOT changed is the rule that made the old stub say "nothing was sent":
 * the success state appears only when Web3Forms confirmed delivery. Every other
 * outcome says it did not go through and hands back a prefilled mailto, so the
 * visitor's effort survives a failure. A form that reports a delivery it did not
 * confirm silently loses a recruiter, and that is still the one thing this file
 * refuses to do (§18.5).
 *
 * When `FEATURES.formSubmission` is false — no access key in this build — the
 * form says so up front, before anything is typed, rather than after.
 */
import { useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import { FEATURES, TURNSTILE_SITE_KEY } from '../../config';
import { IDENTITY } from '../../data/identity';
import { contactMailto, submitContact } from '../../lib/contact';
import { useHoneypot } from '../shared/Honeypot';

type Status = 'idle' | 'sending' | 'sent' | 'unconfigured' | 'failed';

const ContactForm = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const honeypot = useHoneypot();

  const update =
    (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const onSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!FEATURES.formSubmission) {
      setStatus('unconfigured');
      return;
    }

    setStatus('sending');
    const result = await submitContact({ ...form, source: 'paper', botcheck: honeypot.tripped });
    setStatus(result.ok ? 'sent' : 'failed');
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* Said before anything is typed, not in a confirmation afterwards. */}
      {FEATURES.formSubmission ? null : (
        <p style={{ marginBottom: '1rem' }}>
          <strong>Heads up: this form can't send in this build.</strong> No delivery key is
          configured, so nothing would leave your browser. Email{' '}
          <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a> instead — that always arrives.
        </p>
      )}

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

      {honeypot.field}

      {/*
        Turnstile slot. The widget mounts here once TURNSTILE_SITE_KEY is set and
        the matching secret is in the Web3Forms dashboard, which is where the
        token gets verified. Until then nothing is rendered at all: a placeholder
        that loads a third-party script would be worse than no placeholder, and
        the honeypot is doing the work in the meantime.
      */}
      {FEATURES.turnstile && TURNSTILE_SITE_KEY ? (
        <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} style={{ margin: '0 0 1.1rem' }} />
      ) : null}

      <button className="btn btn--primary" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'sending…' : 'send ✎'}
      </button>

      <div role="status" aria-live="polite" style={{ marginTop: '1rem' }}>
        {status === 'sent' && (
          <p>
            <strong>That arrived.</strong> It's in his inbox — he reads it and he'll reply. Relayed
            through Web3Forms, which is the only way a site with no server can send mail.
          </p>
        )}
        {status === 'unconfigured' && (
          <p>
            <strong>Nothing was sent.</strong> Delivery isn't configured in this build, so saying
            otherwise would be a lie. Everything you typed is in{' '}
            <a href={contactMailto({ ...form, source: 'paper' })}>this prefilled email</a> — one
            click and it's on its way.
          </p>
        )}
        {status === 'failed' && (
          <p>
            <strong>That didn't go through.</strong> The send failed, so don't assume he saw it.
            Everything you typed is in{' '}
            <a href={contactMailto({ ...form, source: 'paper' })}>this prefilled email</a>, or write
            to <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a> directly.
          </p>
        )}
      </div>
    </form>
  );
};

export default ContactForm;
