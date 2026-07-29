/**
 * Startup sequence: Happy Mac, then the welcome plaque, then extensions marching in.
 *
 * The Mac counterpart to y2k/Boot.tsx (spec §4.7). Same engineering contract,
 * opposite temperament: where the Win98 tree scrolls a BIOS post at you, this one
 * shows a small smiling computer and then quietly narrates what it is doing.
 *
 * ─── WHAT IT READS ───────────────────────────────────────────────────────────
 * The fact layer, for counts only: ROLES.length, FEATURED.length,
 * SECONDARY.length. Nothing here states a fact about Dylan that is not already
 * stated elsewhere on the desktop — every other line is machine fiction about a
 * fictional operating system, which is the only kind of claim a boot screen is
 * allowed to make (R5).
 *
 * ─── RULES THIS FILE GUARDS ──────────────────────────────────────────────────
 * R1  The status lines count structure (roles, featured projects, archived
 *     projects). Structure is not performance: no percentages, no audience
 *     counts, and no "N of anything impressive".
 * R5  Machine fiction only. If a line would tell the visitor something new about
 *     Dylan, it does not belong in the boot screen — it belongs in a window.
 *
 * ─── TWO DECISIONS WORTH KEEPING ─────────────────────────────────────────────
 * 1. It plays on EVERY entry into the theme, not once per session. Carried over
 *    from the Y2K tree at Dylan's request: the startup is the theme's opening
 *    joke. This component only mounts when the theme is activated, so a fresh
 *    mount really is "entered the theme again". See the `booting` comment in
 *    App.tsx.
 * 2. It is skippable with any key, click or tap — a joke that cannot be
 *    interrupted is not a joke — and THE SKIP PATH IS THE SAME `onDone` AS A
 *    NATURAL FINISH. That matters beyond tidiness: App.tsx hangs the
 *    reboot-to-chooser handoff off `onDone`, so if skipping took a different
 *    path, impatiently clicking through a restart would strand the visitor on
 *    the desktop they just asked to leave.
 *
 * There is no audio in the boot sequence, and there never will be. The startup
 * chime is implied — an unrequested sound on page load is hostile, and the 1999
 * joke lands fine without it. QuickTime Player does now play real files
 * (content/QuickTimeWindow.tsx), which changes nothing here: that sound starts
 * from a press, inside a window the visitor went and opened.
 */
import { useEffect, useRef, useState } from 'react';
import { FEATURED, ROLES, SECONDARY } from '../../data';
import Icon, { RainbowMark, type IconName } from './Icon';

/** Beat 1: the Happy Mac sits alone on a grey field for this long. */
const HAPPY_MAC_MS = 640;
/** Beat 2/3: how long each status line holds before the next one replaces it. */
const STATUS_MS = 300;

/**
 * The extension row must never wrap — a second row of icons reads as a broken
 * layout rather than a loading Mac. Seven statuses fit comfortably; the cap is
 * here so that adding an eighth or ninth later degrades by truncating the row
 * instead of silently reflowing it.
 */
const MAX_EXTENSION_ICONS = 12;

type Status = { text: string; icon: IconName };

const Boot = ({ resumeAvailable, onDone }: { resumeAvailable: boolean; onDone: () => void }) => {
  /**
   * In a ref rather than state or a module const: the list depends on
   * `resumeAvailable`, but it must be built exactly once so the interval below
   * cannot be restarted mid-sequence by an unrelated re-render.
   */
  const statuses = useRef<Status[]>([
    { text: 'Starting up…', icon: 'extension' },
    { text: `Loading fact layer… ${ROLES.length} roles on file`, icon: 'doc' },
    {
      text: `Mounting Projects… ${FEATURED.length} featured, ${SECONDARY.length} archived`,
      icon: 'folder',
    },
    {
      // §13: the résumé is a real file that may or may not be present, so the
      // startup line tells the truth about it either way.
      text: `Checking Résumé.pdf… ${resumeAvailable ? 'found' : 'not installed'}`,
      icon: 'pdf',
    },
    { text: 'Balloon Help…', icon: 'guide' },
    { text: 'QuickTime™…', icon: 'quicktime' },
    { text: 'Building the desktop…', icon: 'hd' },
  ]);

  const [phase, setPhase] = useState<'chime' | 'welcome'>('chime');
  /** Index of the status line currently showing, and of the last icon marched in. */
  const [step, setStep] = useState(0);

  useEffect(() => {
    const total = statuses.current.length;
    let cancelled = false;
    let stepTimer = 0;

    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      onDone();
    };

    const toWelcome = window.setTimeout(() => {
      setPhase('welcome');
      stepTimer = window.setInterval(() => {
        setStep((n) => Math.min(n + 1, total - 1));
      }, STATUS_MS);
    }, HAPPY_MAC_MS);

    // 640 + 7 × 300 = 2,740ms, inside the 2.6–3.0s the spec asks for.
    const done = window.setTimeout(finish, HAPPY_MAC_MS + STATUS_MS * total);

    const skip = () => finish();
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);

    return () => {
      cancelled = true;
      window.clearTimeout(toWelcome);
      window.clearTimeout(done);
      window.clearInterval(stepTimer);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [onDone]);

  const current = statuses.current[step];
  const marched = statuses.current.slice(0, Math.min(step + 1, MAX_EXTENSION_ICONS));

  return (
    /*
     * data-chrome so a print triggered while this is on screen (File → Print… is
     * a real menu command in this theme) drops the startup screen rather than
     * printing a grey rectangle over the document. G15.
     */
    <div
      className="mac-boot"
      role="status"
      aria-label="Startup — press any key to skip"
      data-phase={phase}
      data-chrome
    >
      {/*
       * The Happy Mac stays on screen behind the plaque rather than being swapped
       * out, so the two beats compose into one picture instead of cutting. The
       * root's data-phase lets mac/system.css move or shrink it for beat 2 without
       * this component needing an opinion about the layout.
       */}
      <div className="mac-boot-happy">
        <Icon name="happymac" />
      </div>

      {phase === 'welcome' ? (
        <div className="mac-boot-plaque">
          <span className="mac-boot-plaque-mark" aria-hidden="true">
            <RainbowMark />
          </span>
          <strong className="mac-boot-welcome">Welcome to Dylan OS 9</strong>
          <span className="mac-boot-status">{current?.text ?? ''}</span>
        </div>
      ) : null}

      {/*
       * Beat 3. The extension icons are pure period detail — they name nothing
       * real and they are hidden from assistive tech, because the status line
       * above already says everything they illustrate.
       */}
      {phase === 'welcome' ? (
        <div className="mac-boot-extensions" aria-hidden="true">
          {marched.map((entry) => (
            <span className="mac-boot-extension" key={entry.icon}>
              <Icon name={entry.icon} />
            </span>
          ))}
        </div>
      ) : null}

      <p className="mac-boot-skip">Press any key to skip.</p>
    </div>
  );
};

export default Boot;
