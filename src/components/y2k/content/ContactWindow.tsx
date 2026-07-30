/**
 * CONTACT, dressed as an MSN Messenger conversation window.
 *
 * `submitContact` relays the message through Web3Forms (src/lib/contact.ts covers
 * why a third party). The log only says delivered when the relay confirmed it; a
 * failure gets a loud line and the mailto fallback.
 */
import { useState } from "react";
import { FEATURES, TURNSTILE_SITE_KEY } from "../../../config";
import { IDENTITY, SOCIALS } from "../../../data";
import { contactMailto, submitContact } from "../../../lib/contact";
import { useHoneypot } from "../Honeypot";

/** What came back, in the register of a chat log. */
type Outcome =
  | { kind: "sent"; message: string }
  | { kind: "failed"; message: string }
  | { kind: "unconfigured"; message: string }
  | null;

const ContactWindow = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [copied, setCopied] = useState(false);
  const honeypot = useHoneypot();

  const onSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (!FEATURES.formSubmission) {
      setOutcome({ kind: "unconfigured", message });
      return;
    }

    setSending(true);
    const result = await submitContact({
      name,
      email,
      message,
      botcheck: honeypot.tripped,
    });
    setSending(false);
    setOutcome({ kind: result.ok ? "sent" : "failed", message });
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

  /** Rebuilt from current state, so it stays right if they edit and retry. */
  const fallback = contactMailto({ name, email, message });

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
            {copied ? "copied!" : "copy"}
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
            <b>Dylan says:</b> hi!! this is a contact form wearing a Messenger
            costume.
          </p>
          <p>
            <b>Dylan says:</b> {IDENTITY.availability}. Based in{" "}
            {IDENTITY.location}.
          </p>

          {outcome ? (
            <>
              <p>
                <b>You said:</b> {outcome.message || "(no message)"}
              </p>

              {outcome.kind === "sent" ? (
                <p>
                  <b>System:</b> ✓ DELIVERED. that is in his inbox — confirmed
                  by the relay, not guessed at. he reads it and he replies.
                </p>
              ) : null}

              {outcome.kind === "failed" ? (
                <>
                  <p>
                    <b>System:</b> ⚠ NOT SENT. the send failed, so do not assume
                    he saw that. pretending otherwise would be a lie in a very
                    loud font.
                  </p>
                  <p>
                    <b>System:</b> nothing is lost —{" "}
                    <a href={fallback}>
                      click here to send it as a real e-mail
                    </a>
                    , or write to{" "}
                    <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a>.
                    that one always works.
                  </p>
                </>
              ) : null}

              {outcome.kind === "unconfigured" ? (
                <>
                  <p>
                    <b>System:</b> ⚠ NOT SENT. this build has no delivery key,
                    so that went nowhere at all.
                  </p>
                  <p>
                    <b>System:</b> everything you typed is in{" "}
                    <a href={fallback}>this prefilled e-mail</a> — one click and
                    it actually arrives.
                  </p>
                </>
              ) : null}
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

          {honeypot.field}

          {/*
            Turnstile mounts once a site key exists and its secret is in the
            Web3Forms dashboard, which is what actually verifies the token. While
            the key is null nothing renders and the honeypot is the only defence.
          */}
          {FEATURES.turnstile && TURNSTILE_SITE_KEY ? (
            <div
              className="y2k-turnstile cf-turnstile"
              data-sitekey={TURNSTILE_SITE_KEY}
            />
          ) : null}

          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="submit"
              className="y2k-btn y2k-btn-lg"
              disabled={sending}
            >
              {sending ? "Sending…" : "Send ▶"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactWindow;
