/**
 * capture_recruiter_email — the follow-up form (spec §11.3, §18.4).
 *
 * ─── THE HONESTY PROBLEM THIS COMPONENT HAS ─────────────────────────────────
 * A contact form with no backend is the most tempting place on a site to lie.
 * The easy build shows a green "Thanks, Dylan will be in touch!" and drops the
 * data on the floor — which costs him the exact opportunity the form existed to
 * capture, and he never finds out it happened.
 *
 * So while FEATURES.formSubmission is false this does two things instead:
 *   1. Says plainly, before submission, that nothing is sent yet.
 *   2. On submit, hands back a prefilled mailto: link containing everything the
 *      visitor typed. Their effort is not wasted — it is one click from
 *      arriving, through a channel that definitely works.
 *
 * Phase B: implement POST to ENDPOINTS.contact, flip FEATURES.formSubmission,
 * and the success state below becomes a real confirmation. The mailto fallback
 * is worth keeping for the failure branch regardless.
 */
import { useId, useState } from 'react';
import { ENDPOINTS, FEATURES, TURNSTILE_SITE_KEY } from '../../config';
import { IDENTITY } from '../../data';

type Props = {
  /** Prefilled by the model when the visitor already gave these in chat. */
  email?: string;
  name?: string;
  company?: string;
  message?: string;
};

const RecruiterCapture = ({ email = '', name = '', company = '', message = '' }: Props) => {
  const id = useId();
  const [form, setForm] = useState({ name, company, email, message });
  const [submitted, setSubmitted] = useState(false);

  const mailto = () => {
    const body = [
      form.name ? `From: ${form.name}` : null,
      form.company ? `Company: ${form.company}` : null,
      form.email ? `Reply to: ${form.email}` : null,
      '',
      form.message || '(no message)',
    ]
      .filter((line) => line !== null)
      .join('\n');
    return `mailto:${IDENTITY.email}?subject=${encodeURIComponent(
      form.company ? `Opportunity — ${form.company}` : 'Opportunity for Dylan',
    )}&body=${encodeURIComponent(body)}`;
  };

  const onSubmit = () => {
    if (FEATURES.formSubmission) {
      // TODO(phase-b): POST to ENDPOINTS.contact with a Turnstile token, then
      // render the real confirmation. Deliberately not called while the flag is
      // false — see the header comment.
      void ENDPOINTS.contact;
    }
    setSubmitted(true);
  };

  const field = (key: keyof typeof form) => ({
    id: `${id}-${key}`,
    value: form[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: event.target.value })),
  });

  if (submitted) {
    return (
      <article className="c-card c-card--form" aria-live="polite">
        <h3 className="c-card__title">Nothing was sent — on purpose</h3>
        <p className="c-card__text">
          There is no backend behind this form in this build, so your details were not transmitted,
          stored, or logged anywhere. Telling you that is better than a fake confirmation.
        </p>
        <p className="c-card__text">
          Everything you typed is packed into this link, though, and email definitely reaches him:
        </p>
        <p className="c-actions">
          <a className="c-button c-button--primary" href={mailto()}>
            Send it as an email instead
          </a>
          <button className="c-button" type="button" onClick={() => setSubmitted(false)}>
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
        Heads up: submission is not wired up yet, so this will hand you a prefilled email rather
        than sending anything.
      </p>

      <form
        className="c-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
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

        {/*
          Turnstile slot. TURNSTILE_SITE_KEY is null in Phase A, so no widget and
          no third-party script — a placeholder that loads a tracker would be
          worse than no placeholder.
        */}
        {FEATURES.turnstile && TURNSTILE_SITE_KEY ? (
          <div className="c-field" data-turnstile-slot />
        ) : null}

        <p className="c-actions">
          <button className="c-button c-button--primary" type="submit">
            Continue
          </button>
        </p>
      </form>
    </article>
  );
};

export default RecruiterCapture;
