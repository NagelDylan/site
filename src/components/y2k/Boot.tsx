/**
 * Boot sequence: BIOS post, then a loading bar.
 *
 * Plays on every entry and again on reboot (deliberately not gated per session).
 * Any keypress, click or tap skips it through the same `onDone` as a natural
 * finish, so a reboot still lands where it should.
 */
import { useEffect, useRef, useState } from 'react';
import { FEATURED, SECONDARY } from '../../data';

const pad = (label: string) => label.padEnd(30, '.');

const Boot = ({ resumeAvailable, onDone }: { resumeAvailable: boolean; onDone: () => void }) => {
  const lines = useRef<string[]>([
    'NAGEL BIOS v2.0.28  (C) 1999 Nagel Micro Devices',
    'Pentium(R) II 350 MHz  —  Cache: 512K',
    'Memory Test : 65536K OK',
    '',
    'Detecting IDE Primary Master ....... NAGEL-HDD-2048',
    'Detecting IDE Primary Slave ........ None',
    'Detecting Drive A: ................. 1.44M Floppy',
    '',
    `${pad('Mounting C:\\Projects\\')} ${FEATURED.length} featured, ${SECONDARY.length} archived`,
    `${pad('Loading JOBS.DAT')} OK`,
    `${pad('Loading window manager')} OK`,
    `${pad('Checking A:\\resume.pdf')} ${resumeAvailable ? 'FOUND' : 'not present (skipping)'}`,
    `${pad('Checking guestbook.cgi')} FULL SINCE 1999`,
    '',
    'Starting DYLAN OS 98 SE ...',
  ]);
  const [shown, setShown] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const total = lines.current.length;
    let cancelled = false;

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
    }, 105);

    const barTimer = window.setInterval(() => {
      setProgress((p) => Math.min(100, p + 7));
    }, 90);

    const done = window.setTimeout(finish, 2900);

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
  }, [onDone]);

  return (
    <div className="y2k-boot" role="status" aria-label="Boot sequence — press any key to skip">
      <div className="y2k-boot-logo">
        DYLAN
        <br />
        OS 98
      </div>
      <pre style={{ margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>
        {lines.current.slice(0, shown).join('\n')}
      </pre>
      {shown >= lines.current.length - 1 ? (
        <div className="y2k-boot-bar" aria-hidden="true">
          <i style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      <p className="y2k-boot-skip">press any key to skip</p>
    </div>
  );
};

export default Boot;
