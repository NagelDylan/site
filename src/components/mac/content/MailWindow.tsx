/**
 * New Message — contact, as a 1997 mail compose window (spec §4.11).
 *
 * ─── ON HONESTY. READ THIS BEFORE EDITING A WORD OF IT ───────────────────────
 * This window sends. `submitContact` hands the message to Web3Forms, which relays
 * it to Dylan's inbox — see src/lib/contact.ts for why a third party rather than a
 * server of ours (a static site has nowhere to keep a secret).
 *
 * The discipline that produced the old "Not sent." is unchanged, only its trigger
 * moved. This file therefore:
 *
 *   1. never says "sent", "delivered" or "received" unless Web3Forms confirmed it.
 *      `submitContact` returns `{ ok: true }` only on a confirmed relay, and the
 *      confirmation below is branched on exactly that;
 *   2. treats a failure as a failure, in plain words — "do not assume he saw it" —
 *      rather than a shrug, because a form that quietly eats a message costs Dylan
 *      the opportunity it existed to capture and he never finds out;
 *   3. keeps both server-free routes on screen at all times: the address itself,
 *      and the button that hands what you typed to your own mail program. Those
 *      work when Web3Forms is down, when the key is missing, and when the visitor
 *      simply does not want a middleman.
 *
 * This is `y2k/ContactWindow.tsx`'s guarantee in the Mac register: that window
 * shouts its outcome in a very loud font, this one states it calmly and once. Both
 * are the same promise. The costume is a joke about the *interface*; it is never a
 * licence to claim a delivery that did not happen (§18.5).
 *
 * If the delivery key is absent from a build, `FEATURES.formSubmission` is false —
 * it is computed from the key, not set by hand, so it cannot lie — and the notice
 * says so before anything is typed rather than after.
 *
 * WHAT IT READS: IDENTITY (name, e-mail, location, availability) and SOCIALS from
 * the fact layer, and `VOICES.mac.headings.contact` for the title. R4: the
 * availability line is a Summer 2027 co-op *term*, printed from the fact layer,
 * never a graduation date.
 */
import { useState } from "react";
import { FEATURES, TURNSTILE_SITE_KEY } from "../../../config";
import { IDENTITY, SOCIALS } from "../../../data";
import { VOICES } from "../../../data/voice";
import { contactMailto, submitContact } from "../../../lib/contact";
import { useHoneypot } from "../../shared/Honeypot";
import { Hairline } from "../deco";

const voice = VOICES.mac;

/**
 * What happened, for the confirmation. Only the subject is kept: the body is still
 * in the textarea below, where the visitor can see it, and copying it into a second
 * piece of state would be the beginning of pretending it went somewhere it didn't.
 */
type Outcome = {
  kind: "sent" | "failed" | "unconfigured";
  subject: string;
} | null;

const MailWindow = () => {
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [copied, setCopied] = useState(false);
  const honeypot = useHoneypot();

  const onSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (!FEATURES.formSubmission) {
      setOutcome({ kind: "unconfigured", subject });
      return;
    }

    setSending(true);
    const result = await submitContact({
      email: from,
      subject,
      message: body,
      source: "mac",
      botcheck: honeypot.tripped,
    });
    setSending(false);
    setOutcome({ kind: result.ok ? "sent" : "failed", subject });
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(IDENTITY.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard permission refused, or no clipboard at all. Say nothing false:
      // the address is on screen and selectable either way.
      setCopied(false);
    }
  };

  /**
   * The route that needs nothing but the visitor's own mail program, prefilled with
   * what they typed. Built by the shared helper so its encoding — a subject line
   * with an ampersand in it would otherwise truncate the body — is done once.
   */
  const mailto = contactMailto({
    email: from,
    subject,
    message: body,
    source: "mac",
  });

  return (
    <div className="mac-client mac-mail">
      <h2>{voice.headings.contact}</h2>
      <p className="mac-lead">
        {IDENTITY.availability}. Based in {IDENTITY.location}.
      </p>

      {/* The compose header, in the era's shape: addressed fields above a divider. */}
      <div className="mac-mail-head">
        <div className="mac-mail-field mac-mail-field--to">
          <span className="mac-mail-label">To:</span>
          <span className="mac-mail-value">
            <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a>
            <button
              type="button"
              className="mac-btn mac-btn--sm"
              onClick={copyAddress}
              data-balloon="Click here to copy the address to the clipboard. It reaches him directly, with nothing in between."
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </span>
        </div>
      </div>

      <Hairline />

      <form className="mac-mail-form" onSubmit={onSubmit}>
        <label className="mac-mail-field">
          <span className="mac-mail-label">From:</span>
          <input
            className="mac-input"
            type="email"
            value={from}
            autoComplete="email"
            onChange={(event) => setFrom(event.target.value)}
          />
        </label>

        <label className="mac-mail-field">
          <span className="mac-mail-label">Subject:</span>
          <input
            className="mac-input"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
        </label>

        <label className="mac-mail-field mac-mail-field--body">
          <span className="mac-mail-label">Message:</span>
          <textarea
            className="mac-textarea"
            rows={6}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </label>

        {honeypot.field}

        {/*
          Turnstile mounts here once a site key exists and its secret sits in the
          Web3Forms dashboard, which is what verifies the token. Nothing renders
          while the key is null: the old placeholder announced a widget that had no
          arrival date, and no third-party script is fetched for decoration.
        */}
        {FEATURES.turnstile && TURNSTILE_SITE_KEY ? (
          <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} />
        ) : null}

        <div className="mac-btn-row">
          <button
            type="submit"
            className="mac-btn"
            disabled={sending}
            data-balloon={
              FEATURES.formSubmission
                ? "This button sends the message to Dylan, and reports honestly whether it arrived."
                : "This button cannot send in this build. It will tell you so instead of pretending."
            }
          >
            {sending ? "Sending…" : "Send"}
          </button>
          <a
            className="mac-btn mac-btn--default"
            href={mailto}
            data-balloon="This opens your own mail program with this message in it. Nothing sits in between."
          >
            Open in your mail program
          </a>
        </div>
      </form>

      {/*
        The outcome. `aria-live` so a screen reader hears it, and the outcome is
        stated before the alternative in every branch.
      */}
      <div className="mac-mail-result" aria-live="polite">
        {outcome?.kind === "sent" ? (
          <>
            <p>
              <strong>Delivered.</strong> The relay confirmed it, so this is not
              a guess: the message is in Dylan's inbox. He reads it, and he will
              reply.
            </p>
            <p>
              Your subject line was{" "}
              {outcome.subject ? `“${outcome.subject}”` : "left empty"}.
            </p>
          </>
        ) : null}

        {outcome?.kind === "failed" ? (
          <>
            <p className="mac-mail-notsent">
              <strong>Not sent.</strong> The send failed, so please do not
              assume he saw it. Saying otherwise would be the one thing this
              site refuses to do.
            </p>
            <p>
              Nothing is lost — everything you typed is still in the boxes
              above, and <a href={mailto}>this link</a> hands it to your own
              mail program. The address that always arrives is{" "}
              <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a>.
            </p>
          </>
        ) : null}

        {outcome?.kind === "unconfigured" ? (
          <>
            <p className="mac-mail-notsent">
              <strong>Not sent.</strong> This build has no delivery key, so the
              message went nowhere at all.
            </p>
            <p>
              <a href={mailto}>This link</a> carries everything you typed into
              your own mail program, where it really can be sent, and{" "}
              <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a> reaches
              him directly.
            </p>
          </>
        ) : null}
      </div>

      <Hairline />

      <p className="mac-links">
        <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a>
        <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer noopener">
          LinkedIn
        </a>
        <a href={SOCIALS.github} target="_blank" rel="noreferrer noopener">
          GitHub
        </a>
      </p>
    </div>
  );
};

export default MailWindow;
