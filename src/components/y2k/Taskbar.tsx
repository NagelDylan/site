/**
 * Taskbar and Start menu.
 *
 * The Start menu is the primary navigation (§10): every window on this desktop is
 * reachable from it, including the ones with no desktop icon.
 *
 * G8 — the theme switcher is here twice on purpose. Once in the Start menu under
 * "🎨 Themes", where a visitor looking for settings will look, and once in the
 * system tray, which is always visible without opening anything. Both are real
 * <button>s in the tab order: nobody may be trapped in this theme, including
 * someone navigating by keyboard.
 */
import { useEffect, useId, useRef, useState } from 'react';
import type { ThemeId } from '../../data/voice';
import { THEME_LABELS } from '../../lib/theme';
import { FEATURED } from '../../data';
import Icon, { StartFlag } from './Icon';
import { useClock } from './hooks';
import type { OpenRequest, WindowState } from './wm';

type Props = {
  windows: WindowState[];
  activeId: string | null;
  onOpen: (req: OpenRequest) => void;
  onTaskClick: (id: string) => void;
  onTheme: (theme: ThemeId) => void;
  onToggleMode: () => void;
  mode: 'light' | 'dark';
  onShutDown: () => void;
  onAssistant: () => void;
  resumeAvailable: boolean;
};

const Taskbar = ({
  windows,
  activeId,
  onOpen,
  onTaskClick,
  onTheme,
  onToggleMode,
  mode,
  onShutDown,
  onAssistant,
  resumeAvailable,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenu, setSubmenu] = useState<string | null>(null);
  const clock = useClock();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const go = (req: OpenRequest) => {
    onOpen(req);
    setMenuOpen(false);
    setSubmenu(null);
  };

  const Sub = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => (
    <li onPointerEnter={() => setSubmenu(id)}>
      <button
        type="button"
        className="y2k-mi"
        aria-haspopup="true"
        aria-expanded={submenu === id}
        data-open={submenu === id || undefined}
        onClick={() => setSubmenu(submenu === id ? null : id)}
      >
        {label}
      </button>
      {submenu === id ? <ul className="y2k-submenu y2k-out">{children}</ul> : null}
    </li>
  );

  return (
    <div ref={rootRef}>
      {menuOpen ? (
        <nav className="y2k-startmenu y2k-out" id={menuId} aria-label="Start menu">
          <div className="y2k-startmenu-spine" aria-hidden="true">
            Dylan OS 98
          </div>
          <ul>
            <Sub id="programs" label="📁 Programs">
              <li>
                <button type="button" className="y2k-mi" onClick={() => go({ kind: 'projects' })}>
                  <Icon name="folderOpen" /> C:\Projects\
                </button>
              </li>
              {FEATURED.map((project) => (
                <li key={project.slug}>
                  <button
                    type="button"
                    className="y2k-mi"
                    onClick={() => go({ kind: 'project', arg: project.slug, title: `${project.name} — Properties` })}
                  >
                    <Icon name="doc" /> {project.name}
                  </button>
                </li>
              ))}
              <li className="y2k-mi-sep" />
              <li>
                <button type="button" className="y2k-mi" onClick={() => go({ kind: 'winamp' })}>
                  <Icon name="cd" /> Winamp 2.9
                </button>
              </li>
              <li>
                <button type="button" className="y2k-mi" onClick={() => go({ kind: 'guestbook' })}>
                  <Icon name="book" /> Guestbook
                </button>
              </li>
              <li>
                <button type="button" className="y2k-mi" onClick={() => go({ kind: 'webring' })}>
                  <Icon name="star" /> The Web Ring
                </button>
              </li>
            </Sub>

            <Sub id="documents" label="📄 Documents">
              <li>
                <button type="button" className="y2k-mi" onClick={() => go({ kind: 'experience' })}>
                  <Icon name="briefcase" /> JOBS I HAVE HAD
                </button>
              </li>
              <li>
                <button type="button" className="y2k-mi" onClick={() => go({ kind: 'about' })}>
                  <Icon name="person" /> ABOUT ME!!
                </button>
              </li>
              <li>
                <button type="button" className="y2k-mi" onClick={() => go({ kind: 'education' })}>
                  <Icon name="grad" /> SCHOOL
                </button>
              </li>
              <li>
                <button type="button" className="y2k-mi" onClick={() => go({ kind: 'skills' })}>
                  <Icon name="gear" /> MY SKILLZ
                </button>
              </li>
              {/* §13: only offered when the file actually exists. */}
              {resumeAvailable ? (
                <li>
                  <button type="button" className="y2k-mi" onClick={() => go({ kind: 'resume' })}>
                    <Icon name="floppy" /> Résumé.pdf
                  </button>
                </li>
              ) : null}
            </Sub>

            <Sub id="themes" label="🎨 Themes">
              {(['paper', 'y2k', 'chat'] as ThemeId[]).map((theme) => (
                <li key={theme}>
                  <button
                    type="button"
                    className="y2k-mi"
                    onClick={() => {
                      setMenuOpen(false);
                      onTheme(theme);
                    }}
                    aria-current={theme === 'y2k'}
                  >
                    <Icon name="palette" /> {THEME_LABELS[theme]}
                    {theme === 'y2k' ? ' ✓' : ''}
                  </button>
                </li>
              ))}
              <li className="y2k-mi-sep" />
              <li>
                <button
                  type="button"
                  className="y2k-mi"
                  onClick={() => {
                    onToggleMode();
                    setMenuOpen(false);
                  }}
                >
                  <Icon name="flag" /> {mode === 'dark' ? 'Teal desktop (light)' : 'CRT desktop (dark)'}
                </button>
              </li>
            </Sub>

            <li>
              <button type="button" className="y2k-mi" onClick={() => go({ kind: 'contact' })}>
                <Icon name="mail" /> Contact Dylan
              </button>
            </li>
            <li>
              <button type="button" className="y2k-mi" onClick={() => go({ kind: 'help' })}>
                <Icon name="help" /> Help
              </button>
            </li>
            <li>
              <button
                type="button"
                className="y2k-mi"
                onClick={() => {
                  onAssistant();
                  setMenuOpen(false);
                }}
              >
                <Icon name="info" /> Summon the paperclip
              </button>
            </li>
            <li className="y2k-mi-sep" />
            <li>
              <button
                type="button"
                className="y2k-mi"
                onClick={() => {
                  setMenuOpen(false);
                  onShutDown();
                }}
              >
                <Icon name="warn" /> Shut Down...
              </button>
            </li>
          </ul>
        </nav>
      ) : null}

      <div className="y2k-taskbar" data-chrome>
        <button
          type="button"
          className="y2k-btn y2k-start-btn"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <StartFlag />
          Start
        </button>

        <div className="y2k-tasks">
          {windows.map((win) => (
            <button
              key={win.id}
              type="button"
              className="y2k-btn y2k-task"
              data-pressed={win.id === activeId && !win.minimized ? 'true' : undefined}
              onClick={() => onTaskClick(win.id)}
            >
              <Icon name={win.icon} />
              <span>{win.title}</span>
            </button>
          ))}
        </div>

        <div className="y2k-tray">
          {/* Always-visible theme switcher (G8). Keyboard-reachable, like everything else. */}
          <button
            type="button"
            className="y2k-tray-btn"
            title="Switch to the Paper theme"
            aria-label="Switch to the Paper theme"
            onClick={() => onTheme('paper')}
          >
            📄
          </button>
          <button
            type="button"
            className="y2k-tray-btn"
            title="Switch to the chatbot theme"
            aria-label="Switch to the chatbot theme"
            onClick={() => onTheme('chat')}
          >
            💬
          </button>
          <button
            type="button"
            className="y2k-tray-btn"
            title={mode === 'dark' ? 'Light mode' : 'Dark mode'}
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={onToggleMode}
          >
            {mode === 'dark' ? '☀' : '☾'}
          </button>
          <button
            type="button"
            className="y2k-tray-btn"
            title="Summon the assistant"
            aria-label="Summon the assistant"
            onClick={onAssistant}
          >
            ☻
          </button>
          <span className="y2k-clock">{clock}</span>
        </div>
      </div>
    </div>
  );
};

export default Taskbar;
