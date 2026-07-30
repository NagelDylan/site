/**
 * RÉSUMÉ.PDF — a fake "Acrobat Reader 4.0" plug-in install wrapped around a real
 * PDF embed. Three states: idle, installing, ready.
 *
 * The fake install is opt-in, and SAVE TO A:\ / OPEN IN NEW WINDOW render in
 * every state that has a file behind it, so nobody has to sit through the bit to
 * reach the document. Reduced motion skips 'installing' outright.
 */
import { useEffect, useState } from "react";
import { IDENTITY } from "../../../data";
import { useReducedMotion } from "../hooks";
import type { Resume } from "../wm";

/**
 * Segmented rather than smooth, because that is what Win98 drew. 22 blocks at
 * 80ms is a beat under two seconds.
 */
const BLOCK_COUNT = 22;
const TICK_MS = 80;

/** Rotating install chatter. */
const STATUS_LINES = [
  "DIALLING 2026 … CARRIER DETECTED",
  "DOWNLOADING ACROREAD.VXD FROM A SERVER THAT IS NOT BUILT YET",
  "ASKING THE FUTURE POLITELY FOR MORE THAN 640K",
  "TEACHING A 1999 FONT RENDERER ABOUT SUBPIXELS",
  "REGISTERING PDF HANDLER … PLEASE DO NOT REBOOT THE PAST",
  "DEFRAGMENTING THE TIMELINE … ALMOST THERE",
];

type Phase = "idle" | "installing" | "ready";

const ResumeWindow = ({ resume }: { resume: Resume }) => {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [filled, setFilled] = useState(0);

  /**
   * Clearing from the effect cleanup covers both closing the window mid-install
   * and pressing CANCEL, since a phase change re-runs the teardown. Otherwise the
   * interval outlives the panel and calls setState into nothing.
   *
   * The hand-off is its own timeout rather than a setPhase inside the setFilled
   * updater: updaters must stay pure, and React may run one twice.
   */
  useEffect(() => {
    if (phase !== "installing") return;
    const bar = window.setInterval(() => {
      setFilled((n) => Math.min(BLOCK_COUNT, n + 1));
    }, TICK_MS);
    const done = window.setTimeout(
      () => setPhase("ready"),
      BLOCK_COUNT * TICK_MS + 140,
    );
    return () => {
      window.clearInterval(bar);
      window.clearTimeout(done);
    };
  }, [phase]);

  const start = () => {
    setFilled(0);
    // Reduced motion gets no bar and no timers at all: the press lands straight
    // on the document.
    setPhase(reducedMotion ? "ready" : "installing");
  };

  /**
   * Clicking the panel skips to the end. Both handlers stop propagation because
   * the buttons sit inside the panel, so CANCEL would otherwise be overruled by
   * the panel's own skip handler.
   */
  const skip = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setPhase("ready");
  };

  const cancel = (event: React.MouseEvent) => {
    event.stopPropagation();
    setFilled(0);
    setPhase("idle");
  };

  // No file on the server means nothing to view and nothing to download, so this
  // state offers neither and points at the windows that carry the same facts.
  if (!resume.available) {
    return (
      <div className="y2k-client y2k-client--face">
        <h2>RÉSUMÉ.PDF</h2>
        <p>
          There is no PDF on the server yet, so there is nothing to download.
          Everything it would say is already in these windows —{" "}
          {IDENTITY.availability.toLowerCase()}, and{" "}
          <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a> reaches him
          directly.
        </p>
      </div>
    );
  }

  /**
   * Rendered in every available state. OPEN IN NEW WINDOW is not decoration:
   * plenty of mobile and tablet browsers refuse to draw a PDF inline. `href`
   * rather than `viewHref` — the open parameters are for the embed only.
   */
  const actions = (
    <div className="y2k-pdf-actions">
      <a className="y2k-btn" href={resume.href} download={resume.filename}>
        💾 SAVE TO A:\
      </a>
      <a
        className="y2k-btn"
        href={resume.href}
        target="_blank"
        rel="noreferrer noopener"
      >
        🌐 OPEN IN NEW WINDOW ↗
      </a>
    </div>
  );

  if (phase === "ready") {
    return (
      <div className="y2k-client y2k-client--face y2k-pdf">
        {/* Decorative so print drops it. */}
        <p className="y2k-hazard" data-decorative>
          ⚠ RENDERED BY A BROWSER FROM THE FUTURE
        </p>

        {/*
         * <object> rather than <iframe>: its children are real fallback content
         * when nothing can display the file, where an iframe shows a blank
         * rectangle. An unlabelled embedded object is invisible to a screen
         * reader, hence the aria-label.
         */}
        <div className="y2k-pdf-frame y2k-in">
          <object
            className="y2k-pdf-object"
            type="application/pdf"
            data={resume.viewHref}
            aria-label="Dylan Nagel's résumé (PDF)"
          >
            <p className="y2k-pdf-fallback">
              This browser will not draw a PDF inside the page — which is fair,
              since this desktop could not either. The file is still right here:{" "}
              <a href={resume.href} download={resume.filename}>
                save it to disk
              </a>{" "}
              or{" "}
              <a href={resume.href} target="_blank" rel="noreferrer noopener">
                open it in a new window
              </a>
              .
            </p>
          </object>
        </div>

        {actions}
      </div>
    );
  }

  if (phase === "installing") {
    // Derived from the bar rather than kept in its own state: two timers that can
    // disagree is one timer too many.
    const step = Math.floor((filled * STATUS_LINES.length) / BLOCK_COUNT);
    const status = STATUS_LINES[Math.min(STATUS_LINES.length - 1, step)];
    return (
      <div className="y2k-client y2k-client--face">
        <h2>RÉSUMÉ.PDF</h2>
        {/* Click anywhere to skip; the SKIP button below is the keyboard route. */}
        <div className="y2k-install y2k-out" onClick={skip}>
          <h3>⚠ PDF PLUG-IN NOT FOUND</h3>
          <p className="y2k-install-sub">ESTABLISHING TEMPORAL LINK TO 2026…</p>

          {/*
           * aria-valuetext carries the status line so a screen reader hears the
           * sentence rather than a block count. No aria-live near it: paired with
           * a progressbar you get either silence or everything twice.
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
              <i key={i} data-on={i < filled ? "true" : undefined} />
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
        <strong>THIS COMPUTER CANNOT READ PDF FILES.</strong> It is 1999.
        Portable Document Format is something other people have, and this
        machine has a floppy drive and opinions.
      </p>
      <p>
        Fortunately there is a compatibility layer. It takes about two seconds,
        it is completely unnecessary, and the two buttons under it already work
        perfectly well without it.
      </p>
      <p>
        <button type="button" className="y2k-btn y2k-btn-lg" onClick={start}>
          ▶ INSTALL PDF PLUG-IN
        </button>
      </p>
      {actions}
    </div>
  );
};

export default ResumeWindow;
