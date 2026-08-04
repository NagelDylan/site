/**
 * DYLAN CE's title bar, and the Start menu that drops out of it.
 *
 * Start sits top-LEFT because Windows CE really did put it there — the taskbar
 * was a title bar, the tray shared it, and there was no room for anything else.
 * That is also why this bar carries the current program's name instead of the
 * program drawing its own: one app owns the screen, so one title bar is enough.
 *
 * The menu has to reach everything Taskbar.tsx reaches, but it cannot reach it the
 * same way. The desktop uses hover fly-outs (Taskbar's `Sub`), and a finger has no
 * hover: a fly-out that only opens on pointerenter is a fly-out that opens by
 * accident, in a layer that has nowhere to go on a 360px screen. So the groups are
 * tap-to-expand accordions that push the rows below them down, which is what
 * Pocket PC's own Start menu did with its folders.
 *
 * The battery and signal meters are set dressing and they say so (aria-hidden, no
 * text): reading a real battery level would make this bar a status widget, and the
 * one thing a handheld's chrome must never do is lie about the hardware.
 */
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { FEATURED } from '../../../data';
import Icon, { StartFlag } from '../Icon';
import { useClock } from '../hooks';
import type { WindowKind } from '../wm';
import type { Shell } from './shell';

type TopBarProps = {
  /** 'Today' on the home screen; otherwise the running program's short title. */
  title: string;
  shell: Shell;
  mode: 'light' | 'dark';
  onToggleMode: () => void;
  resumeAvailable: boolean;
  onSuspend: () => void;
  onShutDown: () => void;
  onAssistant: () => void;
};

/** Drawn three-quarters full and staying there. See the file header. */
const BatteryMeter = () => (
  <svg className="y2k-ce-batt" viewBox="0 0 24 12" aria-hidden="true" data-decorative>
    <rect x="0.5" y="0.5" width="20" height="11" fill="none" stroke="currentColor" />
    <rect x="21" y="3.5" width="3" height="5" fill="currentColor" />
    <rect x="2" y="2" width="13" height="8" fill="var(--y2k-accent-2)" />
  </svg>
);

/** Three bars of four, because a 2002 handheld never had four. */
const SignalMeter = () => (
  <svg className="y2k-ce-sig" viewBox="0 0 18 12" aria-hidden="true" data-decorative>
    <rect x="0" y="9" width="3" height="3" fill="currentColor" />
    <rect x="4.5" y="6" width="3" height="6" fill="currentColor" />
    <rect x="9" y="3" width="3" height="9" fill="currentColor" />
    <rect x="13.5" y="0" width="3" height="12" fill="currentColor" opacity="0.3" />
  </svg>
);

const TopBar = ({
  title,
  shell,
  mode,
  onToggleMode,
  resumeAvailable,
  onSuspend,
  onShutDown,
  onAssistant,
}: TopBarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  /* One group at a time: two expanded accordions plus the running list is taller
     than any phone, and the scroll position is the only place left to hide. */
  const [group, setGroup] = useState<string | null>('programs');
  const clock = useClock();
  const menuId = useId();
  const startRef = useRef<HTMLButtonElement | null>(null);

  /**
   * Closing always sends focus back to Start, whichever way the menu went away.
   * Every row in here unmounts itself by acting — navigating, quitting, toggling
   * the mode — so without this the focus ring falls to the document body and a
   * keyboard visitor has to tab in from the top of the page again.
   */
  const dismiss = useCallback(() => {
    setMenuOpen(false);
    startRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen, dismiss]);

  /** Navigate and dismiss: no row in this menu leaves it open behind the program. */
  const go = (kind: WindowKind, arg?: string | null, label?: string) => {
    shell.open(kind, arg ?? null, label);
    dismiss();
  };

  const run = (action: () => void) => {
    dismiss();
    action();
  };

  const groupProps = (id: string) => ({
    type: 'button' as const,
    className: 'y2k-ce-mi',
    'aria-expanded': group === id,
    onClick: () => setGroup((open) => (open === id ? null : id)),
  });

  return (
    <>
      <header className="y2k-ce-top" data-chrome>
        {/* Capped to the same column as the content so the bar and the program
            below it share edges once the viewport is wider than the device. */}
        <div className="y2k-ce-top-inner">
          <button
            ref={startRef}
            type="button"
            className="y2k-ce-start y2k-btn"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <StartFlag />
            Start
          </button>

          <span className="y2k-ce-top-title" title={title}>
            {title}
          </span>

          <div className="y2k-ce-tray">
            <SignalMeter />
            <BatteryMeter />
            <button
              type="button"
              className="y2k-ce-tray-btn"
              aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={onToggleMode}
            >
              {mode === 'dark' ? '☀' : '☾'}
            </button>
            <button
              type="button"
              className="y2k-ce-tray-btn"
              aria-label="Summon the assistant"
              onClick={onAssistant}
            >
              ☻
            </button>
            <span className="y2k-ce-clock">{clock}</span>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <>
          <nav className="y2k-ce-menu y2k-out" id={menuId} aria-label="Start menu">
            <p className="y2k-ce-mi-head">DYLAN CE</p>
            <ul>
              <li>
                <button {...groupProps('programs')}>
                  <Icon name="folder" /> Programs
                </button>
                {group === 'programs' ? (
                  <ul>
                    <li>
                      <button
                        type="button"
                        className="y2k-ce-mi y2k-ce-mi--sub"
                        onClick={() => go('projects')}
                      >
                        <Icon name="folderOpen" /> C:\Projects\
                      </button>
                    </li>
                    {FEATURED.map((project) => (
                      <li key={project.slug}>
                        {/*
                         * The desktop opens these titled "<name> — Properties".
                         * Here the title lands in a 34px bar, so the program is
                         * named after the project and nothing else.
                         */}
                        <button
                          type="button"
                          className="y2k-ce-mi y2k-ce-mi--sub"
                          onClick={() => go('project', project.slug, project.name)}
                        >
                          <Icon name="doc" /> {project.name}
                        </button>
                      </li>
                    ))}
                    <li className="y2k-ce-mi-sep" />
                    <li>
                      <button
                        type="button"
                        className="y2k-ce-mi y2k-ce-mi--sub"
                        onClick={() => go('winamp')}
                      >
                        <Icon name="cd" /> Winamp 2.9
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="y2k-ce-mi y2k-ce-mi--sub"
                        onClick={() => go('guestbook')}
                      >
                        <Icon name="book" /> Guestbook
                      </button>
                    </li>
                  </ul>
                ) : null}
              </li>

              <li>
                <button {...groupProps('documents')}>
                  <Icon name="file" /> Documents
                </button>
                {group === 'documents' ? (
                  <ul>
                    <li>
                      <button
                        type="button"
                        className="y2k-ce-mi y2k-ce-mi--sub"
                        onClick={() => go('experience')}
                      >
                        <Icon name="briefcase" /> JOBS I HAVE HAD
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="y2k-ce-mi y2k-ce-mi--sub"
                        onClick={() => go('about')}
                      >
                        <Icon name="person" /> ABOUT ME!!
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="y2k-ce-mi y2k-ce-mi--sub"
                        onClick={() => go('education')}
                      >
                        <Icon name="grad" /> SCHOOL
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="y2k-ce-mi y2k-ce-mi--sub"
                        onClick={() => go('skills')}
                      >
                        <Icon name="gear" /> MY SKILLZ
                      </button>
                    </li>
                    {/* Only offered when the file actually exists, as on the desktop. */}
                    {resumeAvailable ? (
                      <li>
                        <button
                          type="button"
                          className="y2k-ce-mi y2k-ce-mi--sub"
                          onClick={() => go('resume')}
                        >
                          <Icon name="floppy" /> Résumé.pdf
                        </button>
                      </li>
                    ) : null}
                  </ul>
                ) : null}
              </li>

              <li className="y2k-ce-mi-sep" />

              {/*
               * The desktop's task buttons have no home on a handheld, so the list
               * of what is running lives here — expanded, not behind another tap,
               * because switching programs is the one thing this menu is for that
               * the Today screen cannot do. Real Pocket PC buried it in Settings,
               * and real Pocket PC users could not find it either.
               */}
              <li>
                <p className="y2k-ce-mi-head">RUNNING PROGRAMS</p>
              </li>
              {shell.running.length === 0 ? (
                <li>
                  <p className="y2k-ce-mi-dim">(nothing running)</p>
                </li>
              ) : (
                shell.running.map((app) => (
                  <li key={app.id} className="y2k-ce-mi-row">
                    <button
                      type="button"
                      className="y2k-ce-mi"
                      data-pressed={app.id === shell.current?.id ? 'true' : undefined}
                      onClick={() => run(() => shell.switchTo(app.id))}
                    >
                      <Icon name={app.icon} /> {app.title}
                    </button>
                    {/* Nested inside the switch button it would be unreachable by
                        keyboard, so quitting is its own control beside it. Quitting
                        leaves the menu open — closing four programs should not cost
                        four trips to Start — but the row it was pressed on has just
                        unmounted, so focus is handed back to Start deliberately. */}
                    <button
                      type="button"
                      className="y2k-ce-mi-quit"
                      aria-label={`Quit ${app.title}`}
                      onClick={() => {
                        shell.close(app.id);
                        startRef.current?.focus();
                      }}
                    >
                      ✕
                    </button>
                  </li>
                ))
              )}

              <li className="y2k-ce-mi-sep" />

              <li>
                <button type="button" className="y2k-ce-mi" onClick={() => run(onToggleMode)}>
                  <Icon name="palette" /> {mode === 'dark' ? 'Teal screen (light)' : 'CRT screen (dark)'}
                </button>
              </li>
              <li>
                <button type="button" className="y2k-ce-mi" onClick={() => go('contact')}>
                  <Icon name="mail" /> Contact Dylan
                </button>
              </li>
              <li>
                <button type="button" className="y2k-ce-mi" onClick={() => go('help')}>
                  <Icon name="help" /> Help
                </button>
              </li>
              <li>
                <button type="button" className="y2k-ce-mi" onClick={() => run(onAssistant)}>
                  <Icon name="info" /> Summon the paperclip
                </button>
              </li>

              <li className="y2k-ce-mi-sep" />

              <li>
                <button type="button" className="y2k-ce-mi" onClick={() => run(onSuspend)}>
                  <Icon name="pc" /> Suspend
                </button>
              </li>
              <li>
                <button type="button" className="y2k-ce-mi" onClick={() => run(onShutDown)}>
                  <Icon name="warn" /> Shut Down...
                </button>
              </li>
            </ul>
          </nav>

          {/*
           * A real button rather than a div with a handler: tapping outside a menu
           * to close it is an action, and an action a mouse can take has to be one
           * a keyboard and a screen reader can take too. It sits after the panel in
           * the DOM so tabbing runs Start → the rows → "close", and it is painted
           * under the panel by z-index rather than by source order.
           */}
          <button
            type="button"
            className="y2k-ce-menu-scrim"
            aria-label="Close the Start menu"
            onClick={dismiss}
          />
        </>
      ) : null}
    </>
  );
};

export default TopBar;
