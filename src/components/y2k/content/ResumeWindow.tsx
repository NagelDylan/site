/**
 * RÉSUMÉ.PDF — "Adobe Acrobat Reader 4.0", plus a temporal compatibility layer.
 *
 * ─── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
 * It used to be a short panel in content/panels.tsx alongside Help and the
 * webring. It is now the most stateful window on the desktop — a three-state
 * machine with a timer in it — so it moved out on its own.
 *
 * ─── THE GAG ─────────────────────────────────────────────────────────────────
 * A 1999 machine cannot read a PDF. Nothing on this desktop could. So pressing
 * INSTALL PDF PLUG-IN runs a Win98 progress dialog that "downloads a plug-in from
 * 2026", and then hands over the real embedded document behind a hazard strip
 * admitting exactly what happened. §18.5 means the site never pretends a thing
 * works differently than it does, and the joke is funnier for being true: the
 * viewer really is from the future as far as this desktop is concerned, and the
 * note under the document says so in as many words.
 *
 * ─── THE GAG IS NEVER LOAD-BEARING ───────────────────────────────────────────
 * SAVE TO A:\ and OPEN IN NEW WINDOW are on screen in every state that has a
 * file behind it, including 'idle'. A recruiter is one click from the document
 * and never has to sit through a bit to reach it. That constraint is the whole
 * reason the fake install is opt-in rather than automatic on open.
 *
 * ─── THE RULES, AS THEY APPLY HERE ───────────────────────────────────────────
 * R1  No metrics, including in the install chatter. The progress bar reports no
 *     percentage anywhere in visible copy.
 * R5  Every install status line is about the *machine*, not about Dylan. The
 *     window asserts nothing about the document it is displaying — not a page
 *     count, not a date. It cannot: the PDF is not written yet, and the file
 *     itself is the switch (src/lib/resume.ts).
 * G17 Reduced motion skips 'installing' entirely. See `start()`.
 */
import { useEffect, useState } from 'react';
import { IDENTITY } from '../../../data';
import { useReducedMotion } from '../hooks';
import type { Resume } from '../wm';

/**
 * Segmented, because that is what Win98 actually drew: discrete blocks with gaps,
 * not a smooth gradient. Twenty-two blocks at 80ms is a beat under two seconds —
 * long enough to read one status line, short enough that nobody feels detained.
 */
const BLOCK_COUNT = 22;
const TICK_MS = 80;

/**
 * Rotating install chatter. Plausible sysadmin prose colliding with time travel,
 * and every line is about this fictional computer (R5). No percentages (R1).
 */
const STATUS_LINES = [
  'DIALLING 2026 … CARRIER DETECTED',
  'DOWNLOADING ACROREAD.VXD FROM A SERVER THAT IS NOT BUILT YET',
  'ASKING THE FUTURE POLITELY FOR MORE THAN 640K',
  'TEACHING A 1999 FONT RENDERER ABOUT SUBPIXELS',
  'REGISTERING PDF HANDLER … PLEASE DO NOT REBOOT THE PAST',
  'DEFRAGMENTING THE TIMELINE … ALMOST THERE',
];

type Phase = 'idle' | 'installing' | 'ready';

const ResumeWindow = ({ resume }: { resume: Resume }) => {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('idle');
  const [filled, setFilled] = useState(0);

  /**
   * The install animation, and the one bug worth naming: an interval that
   * outlives the panel. Closing the window mid-install unmounts this component
   * and pressing CANCEL leaves 'installing' — both would otherwise leave a timer
   * calling setState into nothing, forever, once per open window. Clearing from
   * the effect's cleanup covers both cases at once, because a phase change
   * re-runs the effect and therefore its teardown.
   *
   * The bar is driven by an interval and the hand-off by a separate timeout,
   * rather than by setPhase from inside the setFilled updater: updaters must stay
   * pure, and React may run one twice.
   */
  useEffect(() => {
    if (phase !== 'installing') return;
    const bar = window.setInterval(() => {
      setFilled((n) => Math.min(BLOCK_COUNT, n + 1));
    }, TICK_MS);
    const done = window.setTimeout(() => setPhase('ready'), BLOCK_COUNT * TICK_MS + 140);
    return () => {
      window.clearInterval(bar);
      window.clearTimeout(done);
    };
  }, [phase]);

  const start = () => {
    setFilled(0);
    /*
     * G17: reduced motion does not get a slower bar or a frozen one — it gets no
     * bar and no timers at all. The press lands straight on the document. Motion
     * is removed, not stilled.
     */
    setPhase(reducedMotion ? 'ready' : 'installing');
  };

  /**
   * Nobody should have to wait for the same joke twice, so the whole panel skips
   * on click. Both of these stop propagation for the same reason: the buttons sit
   * *inside* that panel, so without it CANCEL would be immediately overruled by
   * the panel's own skip handler and land on 'ready'.
   */
  const skip = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setPhase('ready');
  };

  const cancel = (event: React.MouseEvent) => {
    event.stopPropagation();
    setFilled(0);
    setPhase('idle');
  };

  /**
   * §13: with no file on the server there is nothing to view and nothing to
   * download, so this state offers neither. It says so and points at the windows
   * that do carry the same information.
   */
  if (!resume.available) {
    return (
      <div className="y2k-client y2k-client--face">
        <h2>RÉSUMÉ.PDF</h2>
        <p>
          There is no PDF on the server yet, so there is nothing to download. Everything it would
          say is already in these windows — {IDENTITY.availability.toLowerCase()}, and{' '}
          <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a> reaches him directly.
        </p>
      </div>
    );
  }

  /**
   * The escape hatches, rendered in every available state.
   *
   * OPEN IN NEW WINDOW is not decoration: plenty of mobile and tablet browsers
   * refuse to draw a PDF inline no matter what element it is in, and a coarse
   * pointer on a wide screen still reaches this desktop. `href` rather than
   * `viewHref` — the open parameters exist for the embed, and a standalone tab
   * should just be the file.
   */
  const actions = (
    <div className="y2k-pdf-actions">
      <a className="y2k-btn" href={resume.href} download={resume.filename}>
        💾 SAVE TO A:\
      </a>
      <a className="y2k-btn" href={resume.href} target="_blank" rel="noreferrer noopener">
        🌐 OPEN IN NEW WINDOW ↗
      </a>
    </div>
  );

  if (phase === 'ready') {
    return (
      <div className="y2k-client y2k-client--face y2k-pdf">
        {/*
         * Marked decorative so print drops it (G15): it is a joke about how the
         * document got here, not information about Dylan.
         */}
        <p className="y2k-hazard" data-decorative>
          ⚠ RENDERED BY A BROWSER FROM THE FUTURE
        </p>

        {/*
         * <object> rather than <iframe> for exactly one reason: its children are
         * real fallback content when nothing can display the file, where an iframe
         * shows a silent blank rectangle. The aria-label is not optional — an
         * unlabelled embedded object is invisible to a screen reader.
         */}
        <div className="y2k-pdf-frame y2k-in">
          <object
            className="y2k-pdf-object"
            type="application/pdf"
            data={resume.viewHref}
            aria-label="Dylan Nagel's résumé (PDF)"
          >
            <p className="y2k-pdf-fallback">
              This browser will not draw a PDF inside the page — which is fair, since this desktop
              could not either. The file is still right here:{' '}
              <a href={resume.href} download={resume.filename}>
                save it to disk
              </a>{' '}
              or{' '}
              <a href={resume.href} target="_blank" rel="noreferrer noopener">
                open it in a new window
              </a>
              .
            </p>
          </object>
        </div>

        {actions}

        <p className="y2k-pdf-note">
          Full disclosure, since this site does not pretend things work: there was no PDF plug-in
          for a machine like this in 1999, and nothing was downloaded from 2026. That is your own
          browser&apos;s PDF viewer doing the work — which, from where this desktop is standing, is
          genuinely from the future.
        </p>
      </div>
    );
  }

  if (phase === 'installing') {
    // Which line is showing is derived from the bar rather than kept in its own
    // piece of state: two timers that can disagree is one timer too many.
    const step = Math.floor((filled * STATUS_LINES.length) / BLOCK_COUNT);
    const status = STATUS_LINES[Math.min(STATUS_LINES.length - 1, step)];
    return (
      <div className="y2k-client y2k-client--face">
        <h2>RÉSUMÉ.PDF</h2>
        {/*
         * Click anywhere in the panel to skip to the end. Keyboard and assistive
         * tech get the same escape as a real button in the row below, so the div
         * handler is a shortcut rather than the only way out.
         */}
        <div className="y2k-install y2k-out" onClick={skip}>
          <h3>⚠ PDF PLUG-IN NOT FOUND</h3>
          <p className="y2k-install-sub">ESTABLISHING TEMPORAL LINK TO 2026…</p>

          {/*
           * One announcement mechanism, not two: this is a progressbar with real
           * aria-value* attributes, and aria-valuetext carries the current status
           * line so what a screen reader hears is the sentence rather than a
           * count of blocks. No aria-live anywhere near it — the pair fight, and
           * the result is either silence or everything read twice.
           */}
          <div
            className="y2k-progress"
            role="progressbar"
            aria-label="Installing the PDF plug-in"
            aria-valuemin={0}
            aria-valuemax={BLOCK_COUNT}
            aria-valuenow={filled}
            aria-valuetext={status}
          >
            {Array.from({ length: BLOCK_COUNT }, (_, i) => (
              <i key={i} data-on={i < filled ? 'true' : undefined} />
            ))}
          </div>

          <p className="y2k-progress-status">{status}</p>

          <div className="y2k-install-actions">
            <button type="button" className="y2k-btn" onClick={cancel}>
              CANCEL
            </button>
            <button type="button" className="y2k-btn" onClick={skip}>
              SKIP
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="y2k-client y2k-client--face">
      <h2>RÉSUMÉ.PDF</h2>
      <p>
        <strong>THIS COMPUTER CANNOT READ PDF FILES.</strong> It is 1999. Portable Document Format
        is something other people have, and this machine has a floppy drive and opinions.
      </p>
      <p>
        Fortunately there is a compatibility layer. It takes about two seconds, it is completely
        unnecessary, and the two buttons under it already work perfectly well without it.
      </p>
      <p>
        <button type="button" className="y2k-btn y2k-btn-lg" onClick={start}>
          ▶ INSTALL PDF PLUG-IN
        </button>
      </p>
      {actions}
      <p className="y2k-pdf-note">
        One file, and no animated flames. Nothing is really installed and nothing is really
        fetched from 2026 — the button plays a joke at you and then shows you the document.
      </p>
    </div>
  );
};

export default ResumeWindow;
