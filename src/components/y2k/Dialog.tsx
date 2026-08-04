/**
 * Modal-ish dialog, and the blue screen.
 *
 * The BSOD is only reachable from Start → Shut Down, so it can never read as a
 * real crash. It says so in the stop message, and it reboots into the boot
 * sequence rather than dead-ending.
 */
import { useEffect } from 'react';
import Icon, { type IconName } from './Icon';

export type DialogSpec = {
  title: string;
  body: React.ReactNode;
  icon?: IconName;
  /** Label of the confirm button; defaults to OK. */
  okLabel?: string;
};

/**
 * The one dialog both shells raise, so it lives next to the component that draws
 * it rather than in either shell.
 */
export const GUESTBOOK_FULL: DialogSpec = {
  title: 'guestbook.cgi',
  icon: 'warn',
  body: (
    <>
      <p style={{ margin: 0 }}>guestbook is full, sorry! (1999)</p>
      <p style={{ margin: '6px 0 0', fontSize: 11 }}>
        It is also read-only, and there is no database behind it. Nothing you type on this site is
        stored anywhere.
      </p>
    </>
  ),
  okLabel: 'Aw, OK',
};

export const Dialog = ({ spec, onClose }: { spec: DialogSpec; onClose: () => void }) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="y2k-dialog-layer">
      <div className="y2k-dialog y2k-out" role="alertdialog" aria-label={spec.title} aria-modal="false">
        <header className="y2k-titlebar" data-chrome>
          <span className="y2k-titlebar-text">{spec.title}</span>
          <button type="button" className="y2k-tb-btn" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </header>
        <div className="y2k-dialog-body">
          <Icon name={spec.icon ?? 'warn'} />
          <div>{spec.body}</div>
        </div>
        <div className="y2k-dialog-actions">
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <button type="button" className="y2k-btn y2k-btn-lg" onClick={onClose} autoFocus>
            {spec.okLabel ?? 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const Bsod = ({ onReboot }: { onReboot: () => void }) => {
  useEffect(() => {
    const go = () => onReboot();
    // A short delay so the click that opened it does not immediately dismiss it.
    const armed = window.setTimeout(() => {
      window.addEventListener('keydown', go);
      window.addEventListener('pointerdown', go);
    }, 400);
    return () => {
      window.clearTimeout(armed);
      window.removeEventListener('keydown', go);
      window.removeEventListener('pointerdown', go);
    };
  }, [onReboot]);

  return (
    <div className="y2k-bsod" role="alertdialog" aria-label="Blue screen — press any key to reboot">
      <h2>DYLAN OS</h2>
      <p style={{ margin: 0 }}>
        A fatal exception 0E has occurred at 0028:C001CAFE in VXD DESKTOP(01) + 00010E36. The
        current application will be terminated.
      </p>
      <ul style={{ margin: 0, paddingLeft: '2ch', listStyle: 'none' }}>
        <li>* Press any key to terminate the current application.</li>
        <li>* Press any key to restart your computer. You will lose any</li>
        <li>&nbsp;&nbsp;unsaved information in all applications.</li>
      </ul>
      <p style={{ margin: 0 }}>
        (You chose Shut Down. This was the plan. Nothing is actually broken, and your real computer
        is fine.)
      </p>
      <p style={{ margin: 0 }}>
        Press any key to continue <span className="y2k-blink">_</span>
      </p>
      <p style={{ margin: 0 }}>
        <button type="button" className="y2k-btn y2k-btn-lg" onClick={onReboot}>
          Reboot
        </button>
      </p>
    </div>
  );
};
