/**
 * The soft-key bar: Back, Today, and one popup key.
 *
 * Pocket PC put its commands at the bottom of the screen and never moved them,
 * which is the whole reason this bar exists instead of a per-program menu strip:
 * the thumb learns three positions once. So the bar never changes shape — the
 * Today key stays put and goes inert on the Today screen rather than vanishing and
 * shuffling the other two under the thumb.
 *
 * The third key is the one that changes, because there are two different things to
 * put in a popup. Inside a program it is Menu, and the program's menu labels are
 * the point of it. Those labels are dressing on the desktop too (WINDOW_MENUS in
 * wm.ts is a list of strings for exactly that reason), so they render here as
 * disabled rows: a File menu that opened would be a promise this site cannot keep.
 * On Today there is no program and no menu, so the key becomes Programs and the
 * popup is a real launcher.
 */
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Icon from '../Icon';
import { PROGRAMS, type Shell } from './shell';

type CommandBarProps = {
  shell: Shell;
  /** WINDOW_MENUS for the running program; empty on Today and on the windows that never had a menu. */
  menu: string[];
  onAssistant: () => void;
};

const CommandBar = ({ shell, menu, onAssistant }: CommandBarProps) => {
  const [popOpen, setPopOpen] = useState(false);
  const popId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const popKeyRef = useRef<HTMLButtonElement | null>(null);
  const current = shell.current;
  const onToday = current === null;

  /**
   * Every row in the popup unmounts the popup by being pressed, so focus is
   * handed back to the key it came out of rather than left to fall to the body.
   */
  const dismiss = useCallback(() => {
    setPopOpen(false);
    popKeyRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!popOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setPopOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [popOpen, dismiss]);

  const run = (action: () => void) => {
    dismiss();
    action();
  };

  /*
   * Unavailable keys are aria-disabled rather than disabled, which is the one
   * place this bar departs from the desktop's greyed buttons. A `disabled`
   * attribute drops the element out of the tab order the moment it applies, and
   * both of these keys go unavailable *by being pressed*: Back on the step that
   * lands on Today, Today by arriving there. The keyboard focus would go with
   * them, to the body, mid-navigation. Inert-but-focusable is the only version
   * that survives its own click.
   */
  const softKey = (inert: boolean, action: () => void) => ({
    type: 'button' as const,
    className: 'y2k-ce-cmd-btn y2k-btn',
    'aria-disabled': inert || undefined,
    onClick: () => {
      if (!inert) run(action);
    },
  });

  return (
    <div className="y2k-ce-cmd" data-chrome ref={rootRef}>
      <div className="y2k-ce-cmd-inner">
        <button {...softKey(!shell.canGoBack, shell.back)}>◀ Back</button>

        {/* Inert, not absent: see the file header. */}
        <button {...softKey(onToday, shell.home)} aria-current={onToday ? 'page' : undefined}>
          Today
        </button>

        <button
          ref={popKeyRef}
          type="button"
          className="y2k-ce-cmd-btn y2k-btn"
          aria-expanded={popOpen}
          aria-controls={popId}
          onClick={() => setPopOpen((open) => !open)}
        >
          {onToday ? 'Programs' : 'Menu'} ▲
        </button>
      </div>

      {popOpen ? (
        <div className="y2k-ce-pop y2k-out" id={popId}>
          {onToday ? (
            <ul>
              {/*
               * Résumé.pdf is the one program missing from this list. Whether the
               * PDF exists is a build-time fact, and this bar is not handed it —
               * the Today grid and Start → Documents both are, and both gate on it.
               * Offering a document that may not be there is worse than offering it
               * one tap further away.
               */}
              {PROGRAMS.filter((entry) => entry.kind !== 'resume').map((entry) => (
                <li key={entry.kind}>
                  <button
                    type="button"
                    className="y2k-ce-pop-item"
                    onClick={() => run(() => shell.open(entry.kind))}
                  >
                    <Icon name={entry.icon} /> {entry.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <ul>
              {menu.length > 0 ? (
                <>
                  <li>
                    <p className="y2k-ce-pop-head">MENUS (FOR LOOKS)</p>
                  </li>
                  {menu.map((label) => (
                    <li key={label}>
                      <span className="y2k-ce-pop-item" aria-disabled="true">
                        {label}
                      </span>
                    </li>
                  ))}
                  <li className="y2k-ce-mi-sep" />
                </>
              ) : null}

              <li>
                <button
                  type="button"
                  className="y2k-ce-pop-item"
                  data-summons-assistant
                  onClick={() => run(onAssistant)}
                >
                  <Icon name="info" /> Summon the paperclip
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="y2k-ce-pop-item"
                  onClick={() => run(() => shell.close(current.id))}
                >
                  <Icon name="warn" /> Close this program
                </button>
              </li>
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default CommandBar;
