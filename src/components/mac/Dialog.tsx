/**
 * Mac alerts, and the system-error / Sad Mac sequence (spec §4.8).
 *
 * ─── WHAT MAKES A MAC ALERT A MAC ALERT ──────────────────────────────────────
 * It has no title bar. That is the single structural difference from the Y2K
 * tree's dialog, and it is the whole reason this file cannot just be that one
 * with different class names: a Platinum alert is a bevelled box with a 32px icon
 * in the top-left, text beside it, buttons in the bottom-right, and a heavy ring
 * around whichever button `Return` would press. `spec.title` is therefore
 * rendered as bold lead TEXT, not as chrome.
 *
 * ─── WHY THE SYSTEM ERROR IS SAFE ────────────────────────────────────────────
 * `SystemError` is this theme's counterpart to the Y2K blue screen, and it
 * inherits that screen's honesty guarantee verbatim. It is only ever reachable
 * from Special → Shut Down, so it can never read as a real crash — the visitor
 * asked for it. It says so in plain words in the middle of the fiction, it states
 * that nothing is broken and that their real computer is fine, and it recovers
 * into the startup sequence rather than dead-ending. A fake crash that a visitor
 * might believe is not a joke, it is a support ticket.
 *
 * `Continue` is present and permanently disabled. That is not an oversight: on a
 * real Mac OS 9 bomb dialog, Continue was there and it never worked. It is the
 * most authentic detail on the screen, and the code comment beside it exists so
 * nobody "fixes" it.
 *
 * Reads nothing from the fact layer — every string here is machine fiction about
 * a fictional operating system, or an explanation of the gag (R5).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import Icon, { type IconName } from './Icon';

export type DialogSpec = {
  /** Rendered as bold lead text, NOT as a title bar — Mac alerts have none. */
  title: string;
  body: React.ReactNode;
  /** Defaults to 'caution', the era's yellow triangle-ish alert icon. */
  icon?: IconName;
  /** Label of the default (ringed, right-most) button. Defaults to OK. */
  okLabel?: string;
  /** When present, a second button appears to the LEFT of the default one. */
  cancelLabel?: string;
  /** Runs when the default button is chosen, before the dialog closes. */
  onConfirm?: () => void;
};

export const Dialog = ({ spec, onClose }: { spec: DialogSpec; onClose: () => void }) => {
  const defaultRef = useRef<HTMLButtonElement | null>(null);
  /**
   * The keyboard handler is installed once, so it reads the current spec through
   * a ref. Depending on `spec` directly would tear the listener down and rebuild
   * it every time a parent re-renders with a fresh object literal, which is how
   * an inline `spec={{…}}` prop quietly loses keystrokes.
   */
  const latest = useRef({ spec, onClose });
  latest.current = { spec, onClose };

  const confirm = useCallback(() => {
    latest.current.spec.onConfirm?.();
    latest.current.onClose();
  }, []);

  /** Focus the default button on mount: Return should work without a click. */
  useEffect(() => {
    defaultRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Same contract as the Y2K dialog. Escape dismisses; Return presses the
      // default button, which is what the ring around it promises.
      if (event.key === 'Escape') latest.current.onClose();
      else if (event.key === 'Enter') confirm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirm]);

  return (
    <div className="mac-dialog-layer" data-chrome>
      <div className="mac-dialog" role="alertdialog" aria-label={spec.title} aria-modal="false">
        <div className="mac-dialog-icon" aria-hidden="true">
          <Icon name={spec.icon ?? 'caution'} />
        </div>
        <div className="mac-dialog-text">
          <p className="mac-dialog-title">{spec.title}</p>
          <div className="mac-dialog-body">{spec.body}</div>
        </div>
        <div className="mac-dialog-actions">
          {spec.cancelLabel ? (
            <button
              type="button"
              className="mac-btn"
              onClick={onClose}
              data-balloon="Click here to dismiss this message and leave everything as it was."
            >
              {spec.cancelLabel}
            </button>
          ) : null}
          <button
            type="button"
            ref={defaultRef}
            className="mac-btn mac-btn--default"
            onClick={confirm}
            data-balloon="Click here to accept this message. Nothing on this desktop can be edited, so there is nothing to save."
          >
            {spec.okLabel ?? 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

/** How long the Sad Mac holds before handing back to the startup sequence. */
const SAD_MAC_MS = 1200;
/**
 * Nothing listens for a dismissal for this long. Without it, the very
 * pointerdown that chose Shut Down arrives at the new screen's listener and
 * dismisses it before anyone has read a word. The Y2K blue screen learned this.
 */
const ARM_MS = 400;

export const SystemError = ({ onReboot }: { onReboot: () => void }) => {
  const [phase, setPhase] = useState<'bomb' | 'sadmac'>('bomb');
  const restartRef = useRef<HTMLButtonElement | null>(null);
  /** Guards against the button click and the window listener both firing. */
  const rebooted = useRef(false);

  const restart = useCallback(() => setPhase('sadmac'), []);
  const reboot = useCallback(() => {
    if (rebooted.current) return;
    rebooted.current = true;
    onReboot();
  }, [onReboot]);

  useEffect(() => {
    restartRef.current?.focus();
  }, []);

  useEffect(() => {
    const advance = phase === 'bomb' ? restart : reboot;
    const armed = window.setTimeout(() => {
      window.addEventListener('keydown', advance);
      window.addEventListener('pointerdown', advance);
    }, ARM_MS);
    // The Sad Mac is a beat, not a wall: it leaves on its own.
    const auto = phase === 'sadmac' ? window.setTimeout(reboot, SAD_MAC_MS) : 0;
    return () => {
      window.clearTimeout(armed);
      window.clearTimeout(auto);
      window.removeEventListener('keydown', advance);
      window.removeEventListener('pointerdown', advance);
    };
  }, [phase, restart, reboot]);

  if (phase === 'sadmac') {
    return (
      <div
        className="mac-sadmac"
        role="alertdialog"
        aria-label="Restarting — press any key to continue"
        data-chrome
      >
        <Icon name="sadmac" />
        <p className="mac-sadmac-code">0000000F 00000003</p>
        <p className="mac-sadmac-note">Restarting. You will be returned to the theme chooser.</p>
      </div>
    );
  }

  return (
    <div className="mac-syserr" data-chrome>
      <div
        className="mac-dialog mac-dialog--error"
        role="alertdialog"
        aria-label="System error — press Restart to continue"
      >
        <div className="mac-dialog-icon" aria-hidden="true">
          <Icon name="bomb" />
        </div>
        <div className="mac-dialog-text">
          <p className="mac-dialog-title">Sorry, a system error occurred.</p>
          <p className="mac-syserr-id">Dylan OS 9&nbsp;&nbsp;ID = 02</p>
          <div className="mac-dialog-body">
            <p>
              You chose Shut Down, so this was the plan. Nothing is actually broken, and your real
              computer is fine — this is a drawing of a 1999 crash, made on purpose.
            </p>
            <p>Restart takes you back to the theme chooser, where you can pick a different one.</p>
          </div>
        </div>
        <div className="mac-dialog-actions">
          {/*
           * Disabled, permanently, on purpose. On a real Mac OS bomb dialog
           * Continue was always there and never once worked. Do not wire it up.
           */}
          <button type="button" className="mac-btn" disabled aria-disabled="true">
            Continue
          </button>
          <button
            type="button"
            ref={restartRef}
            className="mac-btn mac-btn--default"
            onClick={restart}
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  );
};
