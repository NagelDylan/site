/**
 * Three windows about the desktop itself: Macintosh Guide, Résumé.pdf and the
 * Chooser (spec §4.11).
 *
 * WHAT IT IS: the Mac counterpart to `y2k/content/panels.tsx`, and grouped for the
 * same reason that file is — all three are about *this machine* rather than about
 * Dylan. The Y2K tree's equivalents are a help window, a webring and a
 * floppy-disk download; here they are a Guide written in questions, a Chooser with
 * two panes, and the résumé itself, opened rather than offered.
 *
 * Résumé.pdf is no longer the small panel it started as. It embeds the document, so
 * it is the largest window in this file and the only resizable one of the three —
 * see the geometry in wm.ts, which had to grow with it.
 *
 * WHAT IT READS: `IDENTITY` (availability and e-mail, for the case where no PDF is
 * on the server), `THEME_LABELS` for the theme names, and `Resume` from wm.ts. The
 * Guide reads nothing at all: every sentence in it describes behaviour that the
 * components in this tree genuinely implement.
 *
 * ─── RULES THESE PANELS GUARD ────────────────────────────────────────────────
 * R5  The Guide is the easiest file in the tree to accidentally lie in, because
 *     nothing in it comes from the fact layer to keep it honest. Every claim below
 *     was checked against the component that implements it: the close box really
 *     is on the left (MacWindow.tsx), the arrow keys really do nudge a focused
 *     title bar, the screensaver really is idle-triggered at seventy seconds
 *     (App.tsx), and reduced motion really does suppress it rather than freeze it.
 *     If one of those behaviours changes, this copy is wrong and must change too.
 * R5  The Chooser lists whatever THEMES in config.ts says is reachable, and each
 *     entry describes a theme that really exists. The chat driver entry below is
 *     retained but never rendered, because that theme is hidden — if it comes
 *     back, re-read its copy before shipping it, since it claims demo mode.
 * §13 The résumé panel renders the document, and a download, only when the file is
 *     actually on the server. Embedding it changed nothing about that rule and made
 *     it matter more: a download button pointing at a 404 is worse than no button,
 *     and an `<object>` pointing at one is a grey rectangle that never fills in.
 *     `resume.available` still gates every reference to the file.
 * R1  No figures anywhere in these three. Nothing here is measured — and note that
 *     that includes anything at all about the résumé. This window has twice tried
 *     to describe a PDF nobody in this repo has read: first a guessed page count,
 *     then a claim that the file held what these windows hold, in the order a
 *     reader expects, with nothing new in it. Both were invented (R5), and the
 *     second contradicted R1 on its own terms — the figures live on the résumé
 *     *because* the site strips them, so the two documents cannot match by
 *     construction. The copy now points at the document and characterises none of
 *     it. The document is directly underneath and speaks for itself.
 */
import { useState } from 'react';
import { THEMES } from '../../../config';
import { IDENTITY } from '../../../data';
import type { ThemeId } from '../../../data/voice';
import { THEME_LABELS } from '../../../lib/theme';
import type { IconName } from '../Icon';
import Icon from '../Icon';
import { Chiselled, Hairline, ThemeRing } from '../deco';
import type { Resume } from '../wm';

/* ───────────────────────────── Macintosh Guide ───────────────────────────── */

/**
 * Macintosh Guide phrased every one of its topics as a question the reader might
 * actually ask, then answered it in numbered steps. That shape is kept here
 * because it is the single most recognisable thing about the window, and because
 * it forces the copy to be about what the visitor does rather than about how
 * clever the desktop is.
 *
 * Every topic is rendered open. A collapsing list would be more faithful to the
 * real Guide's panels, but it would also hide half of this window's contents
 * behind a click for no gain: there is nothing here worth hiding, and a visitor
 * reading the Guide is by definition already looking for all of it.
 */
type Topic = { question: string; steps: string[] };

const TOPICS: Topic[] = [
  {
    question: 'How do I find my way around?',
    steps: [
      'The menu bar along the top of the screen is the navigation. Every window on this desktop can be opened from it, including the ones with no icon.',
      'The icons down the right-hand side open the same windows. Click once to select one, then double-click — or press Return — to open it.',
      'The yellow note in the top-left corner is never covered by a window, so the important line stays readable.',
    ],
  },
  {
    question: 'How do I close a window?',
    steps: [
      'The close box is the small square at the LEFT end of the title bar. This is the Macintosh convention, and it is the clearest difference between this desktop and the Windows 98 one next door.',
      'The two boxes at the right end are zoom and collapse.',
      'An inactive window shows no boxes at all. That is authentic, and it doubles as a way to see at a glance which window is listening to you.',
    ],
  },
  {
    question: 'How do I move and resize a window?',
    steps: [
      'Drag it by the title bar. The windows really do move; that is most of the point of this theme.',
      'If you would rather not drag, put keyboard focus on the title text and use the arrow keys.',
      'The bottom-right corner has a grow box on the windows that can be resized. One of them cannot be, and it does not draw one.',
    ],
  },
  {
    question: 'Where did my window go?',
    steps: [
      'Nowhere. It collapsed. The collapse box rolls a window up into its own title bar — a window shade — instead of sending it to a bar along the bottom of the screen.',
      'Click the collapse box again to roll it back down.',
      'The Application menu at the right end of the menu bar lists every open window, collapsed ones included, with a mark beside the one in front. Choosing one brings it back.',
    ],
  },
  {
    question: 'What is Balloon Help?',
    steps: [
      'Turn it on from the Help menu, or from the balloon on the Control Strip. Then point at almost anything on this desktop.',
      'A small yellow balloon appears beside whatever is under the pointer and explains it in one sentence.',
      'The balloons are a period detail rather than an accessibility feature: every control already carries its own label for a screen reader, and the balloon only repeats it.',
    ],
  },
  {
    question: 'Something is drifting across the screen.',
    steps: [
      'That is the screensaver. It arrives after a little over a minute without input, and any key or click dismisses it.',
      'If your system asks for reduced motion, it is never built at all — nor are the dotted zoom rectangles that fly out of an icon when a window opens. They are switched off rather than frozen.',
    ],
  },
  {
    question: 'How do I change the appearance, or leave altogether?',
    steps: [
      'The Control Strip in the bottom-left corner is always on screen. It holds light and dark, this theme’s Chooser, the QuickTime Player, Balloon Help, and a way back to the opening screen where every theme is offered.',
      'The same switches live in the menu bar, under the System menu and the Help menu, so neither route depends on the other.',
      'File → Print really does print. The stylesheet drops the desktop and leaves a plain document behind, which is the joke and also the correct behaviour.',
    ],
  },
  {
    question: 'What does Shut Down do?',
    steps: [
      'Exactly what you are afraid of, and then it restarts. Special → Shut Down is the only way to reach that particular screen, so it can never be mistaken for a real fault.',
      'Nothing on your own computer is affected, and nothing on this site is stored anywhere.',
    ],
  },
];

export const GuideWindow = ({ onTheme }: { onTheme: (theme: ThemeId) => void }) => (
  <div className="mac-client mac-guide">
    <h2>Macintosh Guide</h2>
    <p className="mac-lead">
      This desktop is a website wearing a Macintosh from about 1999. Everything below is a real
      behaviour of this window, not a picture of one.
    </p>

    <Hairline />

    <dl className="mac-guide-topics">
      {TOPICS.map((topic) => (
        <div className="mac-guide-topic" key={topic.question}>
          <dt className="mac-guide-q">
            <Chiselled>{topic.question}</Chiselled>
          </dt>
          <dd className="mac-guide-a">
            <ol className="mac-guide-steps">
              {topic.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </dd>
        </div>
      ))}
    </dl>

    <Hairline />

    <ThemeRing onTheme={onTheme} />
  </div>
);

/* ────────────────────────────── Résumé.pdf ───────────────────────────────── */

/**
 * The résumé window, and the Mac register's version of Y2K's "Save to A:\".
 *
 * §13 makes the file itself the switch: `resume.available` is a build-time check
 * for public/resume.pdf, so dropping the PDF in makes this window open it with no
 * code change. Until then the window says there is nothing to download and points
 * at the two things that always work — the windows on this desktop, and the e-mail
 * address. It never renders a link to a file that is not there.
 *
 * ─── WHY THIS WINDOW SIMPLY SHOWS THE DOCUMENT ───────────────────────────────
 * The Y2K desktop stages a whole performance around the same PDF: a 1999 machine
 * cannot read one, so it pretends to fetch a plug-in from the future first. That is
 * the correct answer over there and it would be the wrong one here. This desktop's
 * character is that it explains rather than performs, so the Macintosh opens the
 * document on the first click and admits, in one line underneath, that the viewer
 * drawing it belongs to the browser and not to this machine. Same underlying truth
 * — no computer from 1999 rendered this — opposite temperament, and the contrast
 * between the two windows is the joke. Do not add a gag to this one.
 *
 * ─── WHY `<object>` AND NOT `<iframe>` ───────────────────────────────────────
 * An `<object>` renders its children when the browser has no viewer for the type;
 * an `<iframe>` in the same situation shows an empty box and no explanation, which
 * is indistinguishable from a broken window. So the fallback below is real content
 * rather than a placeholder: one sentence saying what happened, and both links to
 * the file. `aria-label` is not optional either — an unlabelled embedded object is
 * an anonymous frame to a screen reader.
 *
 * The two buttons stay outside the embed and are always rendered, because the
 * fallback children only appear when the *browser* declines the PDF. A browser that
 * embeds it happily but scrolls it badly, or a visitor who simply wants the file,
 * needs the same two routes out and should not have to hunt for them.
 */
export const ResumeWindow = ({ resume }: { resume: Resume }) => (
  <div className="mac-client mac-resume">
    <div className="mac-resume-head">
      <span className="mac-resume-icon" aria-hidden="true">
        <Icon name="pdf" />
      </span>
      <strong className="mac-resume-name">Résumé.pdf</strong>
    </div>

    <Hairline />

    {resume.available ? (
      <>
        {/*
          One line, and it is about this window rather than about the file. The
          previous version asserted the PDF's contents, its ordering and that
          nothing in it was new — three claims that trace to nothing in src/data/
          (R5), and that this site is in no position to make: R1 keeps figures off
          these pages and on the résumé, so "nothing in it is new" is false the
          moment the file lands, and the launch checklist records that today's PDF
          still carries the Hack the North placement R2 exists to keep off the site.
          Vouching for a document nobody here can inspect is how the corrected
          version ends up certifying the uncorrected one.
        */}
        <p>The document is below. Both buttons under it hand you the same file.</p>

        {/*
          The balloon sits on the frame rather than on the `<object>` itself, and
          that is deliberate. Pointer events over an embedded PDF belong to the
          browser's viewer and never reach this page, so a `data-balloon` on the
          object would be a balloon that can never be triggered — the frame's border
          is the only part of this area the desktop still hears about.

          G15: `data-decorative` so print.css drops the whole frame. An embedded
          viewer does not print — what comes out is a blank rectangle where a page of
          the résumé appears to be, which is precisely the screenshot-of-a-desktop
          the print rules exist to prevent. The PDF is a document in its own right
          and prints itself; the two buttons below survive, so a printed copy of this
          window still tells you where the file is.
        */}
        <div
          className="mac-resume-page"
          data-decorative
          data-balloon="This is the document itself. The window only holds it; your browser is what draws it."
        >
          <object
            className="mac-resume-object"
            type="application/pdf"
            data={resume.viewHref}
            aria-label="Dylan Nagel’s résumé (PDF)"
          >
            <p className="mac-resume-fallback">
              This browser will not draw a PDF inside a page, so the document cannot be shown
              here. Both of these open the same file.
            </p>
            <p className="mac-resume-fallback-row">
              <a className="mac-btn mac-btn--default" href={resume.href} download={resume.filename}>
                Save to disk
              </a>
              <a
                className="mac-btn"
                href={resume.viewHref}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open in a new window
              </a>
            </p>
          </object>
        </div>

        <div className="mac-btn-row">
          <a
            className="mac-btn mac-btn--default"
            href={resume.href}
            download={resume.filename}
            data-balloon="Click here to save the document to your disk. It is the only file this desktop hands over."
          >
            Save to disk
          </a>
          {/*
            `viewHref` rather than `href` on this one: it carries the open parameters,
            so the document arrives fitted to the width of the new window instead of
            at whatever zoom the viewer last remembered. The download above keeps the
            bare path, because a fragment on a saved file is meaningless.
          */}
          <a
            className="mac-btn"
            href={resume.viewHref}
            target="_blank"
            rel="noreferrer noopener"
            data-balloon="Click here to open the document in a window of its own, at full size."
          >
            Open in a new window
          </a>
        </div>

        <p className="mac-note">
          The page above is drawn by your browser’s own PDF viewer rather than by this window. A
          Macintosh of this vintage would have needed a separate application for that, so this is
          the one place on the desktop where the pretence politely steps aside.
        </p>
      </>
    ) : (
      <>
        <p>
          There is no PDF on this server yet, so there is nothing here to hand you. Rather than
          offer a file that is not present, this window says so.
        </p>
        <p>
          Everything the document would contain is already open to you: the Projects folder, the
          Work History window, and About This Macintosh.
        </p>
        <p className="mac-avail">{IDENTITY.availability}.</p>
        <p className="mac-note">
          <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a> reaches Dylan directly, and a
          copy can be sent the ordinary way.
        </p>
      </>
    )}
  </div>
);

/* ──────────────────────────────── Chooser ────────────────────────────────── */

/**
 * The Chooser, which on a real Macintosh was where you picked which driver talked
 * to which device. Here the drivers are the four presentation layers of this site,
 * which is a joke that only works because it is also literally true: each theme is
 * a different piece of software rendering the same facts.
 *
 * Left pane lists the drivers; right pane describes the selected one and offers a
 * Select button. The descriptions are about the *presentation*, never about Dylan
 * — those facts live in the content windows and are identical in all four.
 */
type Driver = {
  icon: IconName;
  /** One line, in the register of a device description. */
  note: string;
  body: string[];
};

/**
 * Keyed by theme id rather than held in an array, for one specific reason:
 * `noUncheckedIndexedAccess` makes every array lookup `Driver | undefined`, and a
 * Record over the ThemeId union does not — so the selected driver needs no fallback
 * and no non-null assertion, and adding a fifth theme to `ThemeId` would fail the
 * type check here until this window described it.
 */
const DRIVERS: Record<ThemeId, Driver> = {
  paper: {
    icon: 'doc',
    note: 'Quiet, printed, easiest to read.',
    body: [
      'A printed page rather than a desktop: plain type, generous margins, and the facts in the order a reader expects to meet them.',
      'This is the one to send to somebody who has four minutes.',
    ],
  },
  y2k: {
    icon: 'floppy',
    note: 'A Windows 98 desktop, circa 1999.',
    body: [
      'The same facts on the other side of the aisle, at roughly ten times the volume: capital letters, a marquee, a sparkle trail and a guest book that shouts back.',
      'It is the reason this theme is so calm. Read them one after the other.',
    ],
  },
  mac: {
    icon: 'hd',
    note: 'This Macintosh. Already in use.',
    body: [
      'The desktop in front of you: Platinum windows, a menu bar along the top, pinstripes on whichever window is listening, and a Trash that is never emptied.',
      'This driver is already selected, which is why the button below is unavailable.',
    ],
  },
  chat: {
    icon: 'person',
    note: 'A conversation instead of a page.',
    body: [
      'Answers questions about Dylan, and is openly transparent that its whole job is to make him look good. It does not embellish; the humour is in the bias.',
      'It runs in demo mode. There is no live model behind it, and the window says so on screen rather than pretending otherwise.',
    ],
  },
};

/** The driver this desktop is. Kept as a constant so the two uses cannot drift. */
const ACTIVE: ThemeId = 'mac';

export const ChooserWindow = ({ onTheme }: { onTheme: (theme: ThemeId) => void }) => {
  const [selected, setSelected] = useState<ThemeId>(ACTIVE);
  const driver = DRIVERS[selected];
  const inUse = selected === ACTIVE;

  const choose = (id: ThemeId) => {
    if (id === ACTIVE) return;
    onTheme(id);
  };

  return (
    <div className="mac-client mac-chooser">
      <div className="mac-chooser-panes">
        <div className="mac-chooser-side">
          <Chiselled>Themes</Chiselled>
          {/*
            A list of buttons rather than a listbox widget. A real Chooser list is
            closest to a listbox, but a listbox has to own arrow-key navigation and
            a roving tabindex to be honest about the role — and a handful of buttons
            in the tab order are easier to operate and impossible to get subtly
            wrong. `aria-pressed` states which one is showing on the right.

            The order comes from THEMES in config.ts, which is the site's single
            source of truth for it, so this list and the opening screen's panels can
            never disagree about which theme sits where.
          */}
          <ul className="mac-chooser-list mac-scroll">
            {THEMES.map((theme) => (
              <li key={theme}>
                <button
                  type="button"
                  className="mac-chooser-item"
                  aria-pressed={selected === theme}
                  data-selected={selected === theme || undefined}
                  onClick={() => setSelected(theme)}
                  /* Double-click applies, exactly as it did in the Chooser. The
                     single click above still only selects, so nothing switches
                     underneath somebody who is reading. */
                  onDoubleClick={() => choose(theme)}
                  data-balloon="Click a theme to read about it. The Select button on the right switches to it."
                >
                  <span className="mac-chooser-icon" aria-hidden="true">
                    <Icon name={DRIVERS[theme].icon} />
                  </span>
                  <span className="mac-chooser-name">{THEME_LABELS[theme]}</span>
                  {theme === ACTIVE ? <span className="mac-chooser-inuse"> (in use)</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* aria-live because the right pane changes without moving focus. */}
        <div className="mac-chooser-detail" aria-live="polite">
          <strong className="mac-chooser-detail-name">{THEME_LABELS[selected]}</strong>
          <p className="mac-chooser-detail-note">{driver.note}</p>
          {driver.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          <div className="mac-btn-row">
            {/*
              Disabled on the active driver, which is both authentic and the honest
              option: selecting the theme already running would dispatch a change
              that nothing acts on, and a button that visibly does nothing reads as
              broken. The right pane says why it is unavailable.
            */}
            <button
              type="button"
              className="mac-btn mac-btn--default"
              onClick={() => choose(selected)}
              disabled={inUse}
              aria-disabled={inUse}
              data-balloon="Click here to switch to the theme described beside this button. Nothing reloads."
            >
              Select
            </button>
          </div>
        </div>
      </div>

      <p className="mac-note">
        Four presentations, one set of facts. Nothing you read changes between them except the
        voice and the furniture, and your choice is remembered for next time.
      </p>
    </div>
  );
};
