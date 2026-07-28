/**
 * The offline / cap-reached panel (spec §11.4, §18.5).
 *
 * ─── WHAT THIS DELIBERATELY DOES NOT DO ─────────────────────────────────────
 * When the bot cannot answer, the tempting move is to keep answering anyway from
 * a canned list and let the visitor assume it is still live. The spec forbids
 * that outright, and rightly: a recruiter who asks two questions and gets two
 * suspiciously similar replies concludes the whole site is theatre.
 *
 * So when the chat is done, it says it is done, and then does the genuinely
 * useful thing — hands over Dylan's email and points at the two themes that need
 * no backend at all and carry every fact this bot knows (G10).
 *
 * Phase A can only reach 'cap_reached' and 'unavailable'. The rate-limit and
 * budget branches are Worker-side states, written now because the copy is the
 * hard part and it should not be improvised during an outage.
 */
import { IDENTITY } from '../../data';
import type { ChatFailureKind } from '../../lib/chat';
import { requestTheme } from './Toolbar';

const COPY: Record<ChatFailureKind, { title: string; body: string[] }> = {
  cap_reached: {
    title: 'That is as far as one conversation goes',
    body: [
      'This chat caps each conversation so a demo cannot sprawl. You have hit the cap — nothing is broken and nothing was rate-limited, the conversation is just finished.',
      'Start a fresh one below if you want to keep going, or take one of the faster routes out.',
    ],
  },
  rate_limited: {
    title: 'Chat is rate-limited right now',
    body: [
      'Too many messages from this connection in a short window, so the bot has stopped answering for a bit. Give it a minute.',
      'Meanwhile: everything the bot knows is on the site itself, in a form you can skim much faster.',
    ],
  },
  budget_exhausted: {
    title: 'Chat is offline right now',
    body: [
      'The bot runs on a fixed monthly budget and that budget is spent, so it has switched itself off rather than quietly overspending. It will be back.',
      'This is the honest version of "offline": there is no fallback bot pretending to be the real one.',
    ],
  },
  unavailable: {
    title: 'Chat is offline right now',
    body: [
      'The chat could not be reached. That is a real failure, not a polite fiction — so rather than improvising answers from a script and letting you think a model wrote them, here is everything useful.',
      'The rest of the site needs no backend and carries every fact this bot would have told you.',
    ],
  },
};

type Props = {
  kind: ChatFailureKind;
  onReset: () => void;
};

const ChatUnavailable = ({ kind, onReset }: Props) => {
  const copy = COPY[kind];

  return (
    <section className="c-offline" role="status" aria-labelledby="offline-title">
      <h2 className="c-offline__title" id="offline-title">
        {copy.title}
      </h2>
      {copy.body.map((para) => (
        <p className="c-offline__text" key={para}>
          {para}
        </p>
      ))}

      <p className="c-offline__text">
        Direct line to Dylan, which always works:{' '}
        <a className="c-link" href={`mailto:${IDENTITY.email}`}>
          {IDENTITY.email}
        </a>
        . He is {IDENTITY.availability.toLowerCase()}.
      </p>

      <p className="c-actions">
        <button className="c-button c-button--primary" type="button" onClick={() => requestTheme('paper')}>
          Read the site instead
        </button>
        <button className="c-button" type="button" onClick={() => requestTheme('y2k')}>
          Or the Y2K version
        </button>
        {kind === 'cap_reached' ? (
          <button className="c-button" type="button" onClick={onReset}>
            Start a new conversation
          </button>
        ) : null}
      </p>
    </section>
  );
};

export default ChatUnavailable;
