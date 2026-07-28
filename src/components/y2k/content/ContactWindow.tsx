/**
 * CONTACT, dressed as an MSN Messenger conversation window.
 *
 * ─── ON HONESTY ──────────────────────────────────────────────────────────────
 * FEATURES.formSubmission and FEATURES.turnstile are both false: there is no
 * backend and no CAPTCHA behind this form. So this window does NOT say "message
 * sent". The submit handler logs to the console — which is all it can truthfully
 * do — and the confirmation says so in plain words, then points at the address
 * that actually works.
 *
 * The Messenger costume is a joke about the *interface*. It is not a licence to
 * claim a delivery that did not happen (§18.5).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState } from 'react';
import { FEATURES } from '../../../config';
import { IDENTITY, SOCIALS } from '../../../data';

type Sent = { name: string; email: string; message: string } | null;

const ContactWindow = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState<Sent>(null);
  const [copied, setCopied] = useState(false);

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    const payload = { name, email, message };
    // The only honest destination available right now.
    console.log('[y2k contact] form submitted, not sent — no backend is wired up:', payload);
    setSent(payload);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(IDENTITY.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="y2k-client y2k-client--face" style={{ padding: 4 }}>
      <div className="y2k-msn">
        <header className="y2k-msn-head" data-chrome>
          <div className="y2k-msn-avatar" aria-hidden="true">
            ☻
          </div>
          <div>
            <strong>{IDENTITY.name}</strong>
            <div className="y2k-msn-status">
              &lt;Online — well, asynchronous. E-mail always arrives.&gt;
            </div>
          </div>
        </header>

        <div className="y2k-msn-toolbar" data-chrome>
          <span>To: </span>
          <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a>
          <button type="button" className="y2k-btn" onClick={copyEmail}>
            {copied ? 'copied!' : 'copy'}
          </button>
          <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer noopener">
            LinkedIn
          </a>
          <a href={SOCIALS.github} target="_blank" rel="noreferrer noopener">
            GitHub
          </a>
        </div>

        <div className="y2k-msn-log y2k-in" aria-live="polite">
          <p>
            <b>Dylan says:</b> hi!! this is a contact form wearing a Messenger costume.
          </p>
          <p>
            <b>Dylan says:</b> {IDENTITY.availability}. Based in {IDENTITY.location}.
          </p>
          <p>
            <b>Dylan says:</b> the box below is real UI on top of no server. Read the fine print
            before you trust it.
          </p>
          {sent ? (
            <>
              <p>
                <b>You said:</b> {sent.message || '(no message)'}
              </p>
              <p>
                <b>System:</b> ⚠ NOT SENT. This form has no backend yet, so your message went to
                the browser console and nowhere else. Nothing was delivered, and saying otherwise
                would be a lie in a very loud font.
              </p>
              <p>
                <b>System:</b> to actually reach Dylan, e-mail{' '}
                <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a> — that one works.
              </p>
            </>
          ) : null}
        </div>

        <form className="y2k-form" onSubmit={onSubmit}>
          <label>
            Screen name
            <input
              className="y2k-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>
          <label>
            Your e-mail
            <input
              className="y2k-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <label>
            Message
            <textarea
              className="y2k-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>

          {/* Phase B slot. Clearly marked as a placeholder: no widget is loaded. */}
          <div className="y2k-turnstile" data-turnstile-slot aria-label="Turnstile placeholder">
            {FEATURES.turnstile ? (
              <span>[ turnstile widget mounts here ]</span>
            ) : (
              <>
                <strong>[ CLOUDFLARE TURNSTILE — PLACEHOLDER SLOT ]</strong>
                <span>no widget is loaded; nothing is being verified</span>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="submit" className="y2k-btn y2k-btn-lg">
              Send ▶
            </button>
            <button
              type="button"
              className="y2k-btn"
              onClick={() =>
                console.log('[y2k contact] nudge — decorative; nothing was nudged and nothing was sent')
              }
            >
              Nudge
            </button>
            <small>
              Heads up: this button does not send mail. It logs to the console. The e-mail link
              above is the one that reaches him.
            </small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactWindow;
