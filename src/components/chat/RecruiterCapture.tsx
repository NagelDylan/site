/**
 * capture_recruiter_email — the follow-up form (spec §11.3, §18.4).
 *
 * ─── THE HONESTY PROBLEM THIS COMPONENT HAS ─────────────────────────────────
 * A contact form is the most tempting place on a site to lie. The easy build shows
 * a green "Thanks, Dylan will be in touch!" whatever happened underneath — which
 * costs him the exact opportunity the form existed to capture, and he never finds
 * out it happened.
 *
 * This one now really submits: `submitContact` relays the details to Dylan's inbox
 * via Web3Forms (src/lib/contact.ts — a static site has nowhere to keep a secret,
 * so the relay is a third party by necessity). The safeguard is unchanged in
 * substance: the confirmation appears only when delivery was confirmed, and every
 * other outcome hands back a prefilled mailto carrying everything they typed. Their
 * effort is never wasted, and it is never claimed to have arrived when it did not.
 */
import { useId, useState } from 'react';
import { FEATURES, TURNSTILE_SITE_KEY } from '../../config';
import { IDENTITY } from '../../data';
import { contactMailto, submitContact } from '../../lib/contact';
import { useHoneypot } from '../shared/Honeypot';

type Props = {
  /** Prefilled by the model when the visitor already gave these in chat. */
  email?: string;
  name?: string;
  company?: string;
  message?: string;
};

type Status = 'idle' | 'sending' | 'sent' | 'unconfigured' | 'failed';

const RecruiterCapture = ({ email = '', name = '', company = '', message = '' }: Props) => {
  const id = useId();
  const [form, setForm] = useState({ name, company, email, message });
  const [status, setStatus] = useState<Status>('idle');
  const honeypot = useHoneypot();

  const mailto = () => contactMailto({ ...form, source: 'chat' });

  const onSubmit = async () => {
    if (!FEATURES.formSubmission) {
      setStatus('unconfigured');
      return;
    }

    setStatus('sending');
    const result = await submitContact({ ...form, source: 'chat', botcheck: honeypot.tripped });
    setStatus(result.ok ? 'sent' : 'failed');
  };

  const field = (key: keyof typeof form) => ({
    id: `${id}-${key}`,
    value: form[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: event.target.value })),
  });

  if (status === 'sent') {
    return (
      <article className="c-card c-card--form" aria-live="polite">
        <h3 className="c-card__title">That's with him</h3>
        <p className="c-card__text">
          Delivered — the relay confirmed it, so this is not a hopeful message on a page. Your
          details are in Dylan's inbox and he will reply to {form.email || 'the address you gave'}.
        </p>
        <p className="c-card__note">
          Relayed by Web3Forms, since this site has no server of its own to send mail from.
        </p>
      </article>
    );
  }

  if (status === 'failed' || status === 'unconfigured') {
    return (
      <article className="c-card c-card--form" aria-live="polite">
        <h3 className="c-card__title">
          {status === 'failed' ? "That didn't go through" : 'Nothing was sent'}
        </h3>
        <p className="c-card__text">
          {status === 'failed'
            ? "The send failed, so please don't assume he has it. Telling you that is better than a confirmation I cannot back up."
            : 'This build has no delivery key configured, so your details were not transmitted, stored, or logged anywhere. Telling you that is better than a fake confirmation.'}
        </p>
        <p className="c-card__text">
          Everything you typed is packed into this link, though, and email definitely reaches him:
        </p>
        <p className="c-actions">
          <a className="c-button c-button--primary" href={mailto()}>
            Send it as an email instead
          </a>
          <button className="c-button" type="button" onClick={() => setStatus('idle')}>
            Edit the details
          </button>
        </p>
      </article>
    );
  }

  return (
    <article className="c-card c-card--form">
      <h3 className="c-card__title">Leave your details</h3>
      <p className="c-card__note">
        {FEATURES.formSubmission
          ? 'This goes to his actual inbox, and I will tell you honestly whether it arrived.'
          : 'Heads up: delivery is not configured in this build, so this will hand you a prefilled email rather than sending anything.'}
      </p>

      <form
        className="c-form"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit();
        }}
      >
        <div className="c-field">
          <label htmlFor={`${id}-name`}>Your name</label>
          <input type="text" autoComplete="name" {...field('name')} />
        </div>
        <div className="c-field">
          <label htmlFor={`${id}-company`}>Company</label>
          <input type="text" autoComplete="organization" {...field('company')} />
        </div>
        <div className="c-field">
          <label htmlFor={`${id}-email`}>
            Your email <span className="c-field__req">required</span>
          </label>
          <input type="email" required autoComplete="email" {...field('email')} />
        </div>
        <div className="c-field">
          <label htmlFor={`${id}-message`}>What is the role?</label>
          <textarea rows={3} {...field('message')} />
        </div>

        {honeypot.field}

        {/*
          Turnstile slot. Nothing renders until TURNSTILE_SITE_KEY is set and its
          secret is in the Web3Forms dashboard, which is where the token is actually
          verified — a placeholder that loads a third-party script would be worse
          than no placeholder.
        */}
        {FEATURES.turnstile && TURNSTILE_SITE_KEY ? (
          <div className="c-field cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} />
        ) : null}

        <p className="c-actions">
          <button className="c-button c-button--primary" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Continue'}
          </button>
        </p>
      </form>
    </article>
  );
};

export default RecruiterCapture;
