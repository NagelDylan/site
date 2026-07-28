/**
 * CHAT THEME — the client-mounted chat application (spec §11).
 *
 * ─── WHAT THIS THEME IS ─────────────────────────────────────────────────────
 * A single-route chat client. No content sidebar, no rendered pages: if you are
 * in this theme you are talking to the bot. That is a real constraint on a
 * portfolio site, and the always-visible theme switcher in the header is what
 * makes it acceptable — anyone who would rather read normally is one click from
 * the paper version, which carries every fact this bot knows (G10).
 *
 * ─── PHASE A HONESTY ────────────────────────────────────────────────────────
 * There is no Anthropic key yet, so the bot is a scripted stub and the
 * demo-mode notice sits permanently above the transcript. See DemoNotice.tsx for
 * why that notice is not negotiable, and src/lib/chat/worker-transport.ts for
 * the three-step change that makes this live.
 *
 * ─── STRUCTURE ──────────────────────────────────────────────────────────────
 *   Toolbar          theme switcher + light/dark          (G4, G8)
 *   DemoNotice       persistent Phase A disclosure        (§18.5)
 *   transcript       Message[] + typing indicator         (§11.3)
 *   StarterPrompts   the four spec prompts, verbatim      (§11.3)
 *   Composer         input + privacy notice               (§11.4)
 *   ChatUnavailable  honest offline / cap-reached state   (§11.4)
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { IDENTITY, PHOTOS } from '../../data';
import { VOICES } from '../../data/voice';
import type { ThemeAppProps } from '../../lib/theme-mount';
import type { Mode } from '../../lib/theme';
import ChatUnavailable from './ChatUnavailable';
import Composer from './Composer';
import DemoNotice from './DemoNotice';
import Message from './Message';
import StarterPrompts from './StarterPrompts';
import Toolbar from './Toolbar';
import { ChatContext } from './context';
import type { Block } from './model';
import { useChat } from './useChat';
import '../../styles/theme-chat.css';

const voice = VOICES.chat;

/**
 * Route-aware opening (G7). The same URL means something in every theme, so
 * /projects/tanks should not drop the visitor into a generic hello — it should
 * open with the thing they clicked toward.
 */
const ROUTE_OPENERS: Record<string, string> = {
  '/experience': 'You came in from his experience — four co-op terms, most recently at Apple. Ask me about any of them.',
  '/projects': 'You came in from his projects. Three worth your time, and I have opinions about which one is best.',
  '/projects/acronymize': 'You came in from Acronymize — the one with the sentence-transformer scoring. Happy to go deeper.',
  '/projects/flowsense': 'You came in from FlowSense — the RAG-backed PDF reader from Hack the 6ix 2024.',
  '/projects/tanks': 'You came in from Tanks — hand-written A* pathfinding in C#, and the reason he understands the machinery.',
  '/about': 'You came in from his about page, so you have read his own version. Mine is more flattering and equally true.',
  '/contact': `You came in from his contact page, so let me save you a step: ${IDENTITY.email}.`,
};

function normalizeRoute(route: string): string {
  const trimmed = route.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

function buildGreeting(route: string): Block[] {
  const opener = ROUTE_OPENERS[normalizeRoute(route)];
  const lines = [`${voice.greeting} ${voice.heroSub}`, opener].filter(
    (line): line is string => typeof line === 'string',
  );
  return [{ id: 'greeting-text', type: 'text', text: lines.join('\n\n') }];
}

const App = ({ route, resume, mode: initialMode }: ThemeAppProps) => {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [draft, setDraft] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // G17: the stub's artificial typing delay is a motion effect too, so a visitor
  // who asked for less motion gets the answer immediately instead of watching it
  // type. The CSS kills the indicator's own animation separately.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  const greeting = useMemo(() => buildGreeting(route), [route]);
  const chat = useChat({ greeting, reducedMotion });

  // Follow the stream, but never fight a visitor who has scrolled up to reread.
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = list.current;
    if (!container) return;
    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 220;
    if (nearBottom) {
      endRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  }, [chat.messages, reducedMotion]);

  const submit = (text: string) => {
    setDraft('');
    void chat.send(text);
  };

  const context = useMemo(
    () => ({ resume, transportKind: chat.transportKind }),
    [resume, chat.transportKind],
  );

  const showStarters = chat.userTurns === 0 && !chat.failure;

  return (
    <ChatContext.Provider value={context}>
      <div className="c-app">
        <header className="c-header">
          <div className="c-header__id">
            {/*
              The portrait is this theme's own artwork — a flat vector cut, where
              paper gets a risograph print and Y2K gets pixel art (G9). Decorative
              only: the name beside it already carries the information, so it is
              alt="" rather than repeating "Dylan Nagel" to a screen reader.
            */}
            <img
              className="c-avatar"
              src={PHOTOS.chat.small}
              alt=""
              width={44}
              height={44}
              loading="eager"
              decoding="async"
            />
            <div>
              <p className="c-header__name">{IDENTITY.name}</p>
              <p className="c-header__role">{IDENTITY.availabilityShort}</p>
            </div>
          </div>
          <Toolbar mode={mode} onModeChange={setMode} />
        </header>

        <DemoNotice />

        <main className="c-main" id="main" ref={list}>
          <div className="c-thread">
            <ul className="c-msgs" role="log" aria-live="polite" aria-relevant="additions text">
              {chat.messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
            </ul>

            {/* Typing indicator. Only before the first delta lands — once text is
                arriving the streaming caret on the message says the same thing. */}
            {chat.status === 'waiting' ? (
              <p className="c-typing" aria-hidden="true">
                <span className="c-typing__dot" />
                <span className="c-typing__dot" />
                <span className="c-typing__dot" />
              </p>
            ) : null}
            {chat.status === 'waiting' ? (
              <p className="sr-only" role="status">
                Assistant is typing
              </p>
            ) : null}

            {showStarters ? <StarterPrompts onPick={submit} /> : null}

            {chat.failure ? (
              <ChatUnavailable kind={chat.failure} onReset={chat.reset} />
            ) : null}

            <div ref={endRef} />
          </div>
        </main>

        <footer className="c-footer">
          <Composer
            value={draft}
            onChange={setDraft}
            onSubmit={() => submit(draft)}
            onStop={chat.stop}
            busy={chat.busy}
            disabled={chat.failure !== null}
            turnsRemaining={chat.turnsRemaining}
          />
        </footer>
      </div>
    </ChatContext.Provider>
  );
};

export default App;
