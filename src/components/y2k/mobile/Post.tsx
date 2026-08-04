/**
 * DYLAN CE's power-on self test: the handheld's answer to Boot.tsx.
 *
 * It is a separate component rather than a reuse because of one hard constraint:
 * Boot pads every label to thirty characters and then appends a value, so its
 * lines run past sixty columns. In a 320px column of monospace that is roughly
 * thirty-four characters wide, every one of them wraps, and a BIOS console that
 * wraps mid-value reads as mush rather than as a machine. So the lines here are
 * written to fit ~34 characters, and the facts — the ROM, the memory, the store,
 * the project counts, JOBS.DAT, the résumé check, the guestbook — are the same
 * facts Boot recites, in the same order.
 *
 * The counts come from the data layer for the same reason Boot's do: a hardcoded
 * "5 featured" goes stale the first time a project is added.
 */
import { useEffect, useMemo, useState } from 'react';
import { FEATURED, SECONDARY } from '../../../data';

/** 20 columns of label leaves 14 for the value, which is the widest one. */
const pad = (label: string) => label.padEnd(20, '.');

const Post = ({ resumeAvailable, onDone }: { resumeAvailable: boolean; onDone: () => void }) => {
  const lines = useMemo(
    () => [
      'CE ROM v3.0.19 (C) 1999 NMD',
      'Nagel Handheld PC',
      'StrongARM SA-1110 206MHz',
      '',
      `${pad('RAM')} 32768K OK`,
      `${pad('Storage')} NAGEL-CF-64M`,
      '',
      `${pad('C:\\Projects\\')} ${FEATURED.length} featured`,
      `${pad('  archive\\')} ${SECONDARY.length} mounted`,
      `${pad('JOBS.DAT')} OK`,
      `${pad('Résumé.pdf')} ${resumeAvailable ? 'FOUND' : 'not present'}`,
      'guestbook.cgi: FULL SINCE 1999',
      '',
      'Starting DYLAN CE...',
    ],
    [resumeAvailable],
  );

  const [shown, setShown] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const total = lines.length;
    let cancelled = false;

    /* Guarded, because a tap that skips also lets the natural timer fire. */
    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      onDone();
    };

    const lineTimer = window.setInterval(() => {
      setShown((n) => {
        if (n >= total) {
          window.clearInterval(lineTimer);
          return n;
        }
        return n + 1;
      });
    }, 110);

    /* Paced to fill just before `finish` below, so the bar is still moving while
       the console prints rather than sitting full and waiting. */
    const barTimer = window.setInterval(() => {
      setProgress((p) => Math.min(100, p + 4));
    }, 100);

    const done = window.setTimeout(finish, 2700);

    const skip = () => finish();
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);

    return () => {
      cancelled = true;
      window.clearInterval(lineTimer);
      window.clearInterval(barTimer);
      window.clearTimeout(done);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [lines, onDone]);

  return (
    <div className="y2k-ce-post" role="status" aria-label="Power-on sequence — tap to skip">
      <div className="y2k-ce-post-logo" data-decorative aria-hidden="true">
        DYLAN
        <br />
        CE 3.0
      </div>
      <pre className="y2k-ce-post-lines">{lines.slice(0, shown).join('\n')}</pre>
      {/* From the first frame, not once the lines are done: gated on the last line
          the bar would only ever appear already full. */}
      <div className="y2k-ce-post-bar" data-decorative aria-hidden="true">
        <i style={{ width: `${progress}%` }} />
      </div>
      {/*
       * A tap anywhere skips, but the hint is a real button so that it is also
       * reachable by keyboard and announced as the way out.
       */}
      <button type="button" className="y2k-ce-post-skip" onClick={onDone}>
        tap to skip
      </button>
    </div>
  );
};

export default Post;
