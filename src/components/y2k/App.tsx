/**
 * Y2K THEME — a Windows 98/2000 desktop, mounted on the client (§10).
 *
 * This is not a document with a skin on it: it is a shell. The desktop is the
 * page, the Start menu is the navigation, and the windows really do drag. See
 * wm.ts for why the drag path deliberately bypasses React, and theme-mount.ts for
 * why this theme mounts on the client while paper is server-rendered.
 *
 * ─── WHAT THIS FILE OWNS ─────────────────────────────────────────────────────
 *   • the boot sequence, the BSOD/reboot cycle, and the idle screensaver
 *   • the desktop: banner, icons, sparkle trail, assistant, dialogs
 *   • routing a deep link to the window it should open (G7)
 *   • the always-visible theme switcher and the light/dark toggle (G4, G8)
 *   • narrow viewports, which get the simplified page instead (§10 mobile)
 *
 * ─── THE HARD RULES, AS THEY APPLY TO THIS THEME ─────────────────────────────
 * R1  No performance metrics anywhere, including in microcopy. The hit counter
 *     counts nothing and says so.
 * R2  FlowSense won nothing. There is no award slot, badge, trophy or placement
 *     anywhere in this tree, and a blinking false claim is still a false claim.
 *     Enthusiasm goes on the engineering.
 * R3  Apple gets APPLE_DESCRIPTION verbatim and no Y2K embellishment — see the
 *     .y2k-role--plain treatment in ExperienceWindow. Text only, never the logo.
 * R4  Graduation is 2028. The only 2027 on this desktop is the Summer 2027 co-op
 *     *term* availability line, which is a work term and not a degree date.
 * R5  Every claim traces to src/data. Microcopy is allowed to be loud; it is not
 *     allowed to be new information.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ThemeAppProps } from '../../lib/theme-mount';
import type { ThemeId } from '../../data/voice';
import { persistMode, type Mode } from '../../lib/theme';
import { IDENTITY } from '../../data';
import '../../styles/theme-y2k.css';

import Icon, { type IconName } from './Icon';
import Taskbar from './Taskbar';
import Y2kWindow from './Y2kWindow';
import Clippy from './Clippy';
import Boot, { hasBootedThisSession } from './Boot';
import { Bsod, Dialog, type DialogSpec } from './Dialog';
import { Screensaver, SparkleTrail } from './effects';
import MobileY2k from './Mobile';
import { HitCounter, MARQUEE_TEXT, Marquee, NetscapeBadge } from './deco';
import { useIdle, useNarrow, useReducedMotion } from './hooks';
import { useWindowManager, windowsForRoute, type OpenRequest, type WindowKind, type WindowState } from './wm';

import WelcomeWindow from './content/WelcomeWindow';
import ExperienceWindow from './content/ExperienceWindow';
import ProjectsExplorer, { BinList } from './content/ProjectsExplorer';
import ProjectWindow from './content/ProjectWindow';
import AboutWindow from './content/AboutWindow';
import SkillsWindow from './content/SkillsWindow';
import EducationWindow from './content/EducationWindow';
import ContactWindow from './content/ContactWindow';
import GuestbookWindow from './content/GuestbookWindow';
import WinampWindow from './content/WinampWindow';
import { HelpWindow, ResumeWindow, WebringWindow } from './content/panels';

/** Desktop icons. The whole site is reachable from here and from Start (G10). */
const DESKTOP_ICONS: { kind: WindowKind; label: string; icon: IconName }[] = [
  { kind: 'welcome', label: 'Welcome.htm', icon: 'globe' },
  { kind: 'projects', label: 'C:\\Projects\\', icon: 'folder' },
  { kind: 'experience', label: 'JOBS I HAVE HAD', icon: 'briefcase' },
  { kind: 'about', label: 'ABOUT ME!!', icon: 'person' },
  { kind: 'skills', label: 'MY SKILLZ', icon: 'gear' },
  { kind: 'education', label: 'My Computer', icon: 'pc' },
  { kind: 'contact', label: 'CONTACT ME', icon: 'mail' },
  { kind: 'guestbook', label: 'guestbook.cgi', icon: 'book' },
  { kind: 'winamp', label: 'Winamp 2.9', icon: 'cd' },
  { kind: 'recycle', label: 'Recycle Bin', icon: 'trash' },
  { kind: 'help', label: 'Help', icon: 'help' },
];

const MENUS: Partial<Record<WindowKind, string[]>> = {
  welcome: ['File', 'Edit', 'View', 'Go', 'Bookmarks'],
  experience: ['File', 'Edit', 'View', 'Insert', 'Help'],
  projects: ['File', 'Edit', 'View', 'Tools', 'Help'],
  about: ['File', 'Edit', 'Search', 'Help'],
  guestbook: ['File', 'Edit', 'View', 'Help'],
  project: ['File', 'Edit', 'View'],
};

const SIGN_DIALOG: DialogSpec = {
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

const App = ({ route, resume, mode: initialMode }: ThemeAppProps) => {
  const narrow = useNarrow();
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [booting, setBooting] = useState(() => !hasBootedThisSession());
  const [crashed, setCrashed] = useState(false);
  const [assistant, setAssistant] = useState(false);
  const [dialog, setDialog] = useState<DialogSpec | null>(null);
  const wm = useWindowManager();
  const routed = useRef(false);

  /** The screensaver only exists when motion is welcome, and never mid-boot. */
  const { idle, wake } = useIdle(70_000, !reducedMotion && !booting && !crashed && !narrow);

  const setTheme = useCallback((theme: ThemeId) => {
    // Never navigate, never reload (G8). ThemeBoot.astro swaps the tree in place.
    window.dispatchEvent(new CustomEvent('nagel:theme-change', { detail: { theme } }));
  }, []);

  const toggleMode = useCallback(() => {
    setMode((current) => {
      const next: Mode = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.mode = next;
      document.documentElement.style.colorScheme = next;
      persistMode(next);
      return next;
    });
  }, []);

  /** The mobile page scrolls; the desktop must not. */
  useEffect(() => {
    document.documentElement.classList.toggle('y2k-mobile', narrow);
    return () => document.documentElement.classList.remove('y2k-mobile');
  }, [narrow]);

  /**
   * Deep link → windows (G7). /experience opens the Experience window rather than
   * dropping the visitor on a bare desktop; /projects/tanks opens the explorer
   * with that project on top. Runs once — reopening on every render would fight
   * the visitor for control of their own windows.
   */
  const { open } = wm;
  useEffect(() => {
    if (routed.current || narrow) return;
    routed.current = true;
    for (const req of windowsForRoute(route)) open(req);
  }, [route, narrow, open]);

  /** The paperclip introduces himself once the boot is out of the way. */
  useEffect(() => {
    if (booting || narrow) return;
    const timer = window.setTimeout(() => setAssistant(true), 1200);
    return () => window.clearTimeout(timer);
  }, [booting, narrow]);

  if (narrow) {
    return <MobileY2k onTheme={setTheme} onToggleMode={toggleMode} mode={mode} resume={resume} />;
  }

  const openKind = (kind: WindowKind, arg?: string) => open({ kind, arg: arg ?? null });

  const renderContent = (win: WindowState) => {
    switch (win.kind) {
      case 'welcome':
        return <WelcomeWindow resume={resume} onTheme={setTheme} onOpen={(kind) => openKind(kind)} />;
      case 'experience':
        return <ExperienceWindow />;
      case 'projects':
        return <ProjectsExplorer onOpenProject={(slug) => open({ kind: 'project', arg: slug })} />;
      case 'project':
        return <ProjectWindow slug={win.arg ?? ''} />;
      case 'about':
        return <AboutWindow onContact={() => openKind('contact')} />;
      case 'skills':
        return <SkillsWindow />;
      case 'education':
        return <EducationWindow />;
      case 'contact':
        return <ContactWindow />;
      case 'guestbook':
        return <GuestbookWindow onSign={() => setDialog(SIGN_DIALOG)} />;
      case 'recycle':
        return (
          <div className="y2k-client y2k-client--face">
            <BinList />
          </div>
        );
      case 'winamp':
        return <WinampWindow />;
      case 'resume':
        return <ResumeWindow resume={resume} />;
      case 'help':
        return <HelpWindow onTheme={setTheme} />;
      case 'webring':
        return <WebringWindow onTheme={setTheme} />;
      default:
        return <div className="y2k-client" />;
    }
  };

  return (
    <div className="y2k-root" data-busy={booting ? 'true' : undefined}>
      <div className="y2k-desktop">
        <div className="y2k-icons">
          {DESKTOP_ICONS.map((entry) => (
            <button
              key={entry.kind}
              type="button"
              className="y2k-icon"
              onClick={() => openKind(entry.kind)}
              onDoubleClick={() => openKind(entry.kind)}
            >
              <Icon name={entry.icon} />
              <span>{entry.label}</span>
            </button>
          ))}
          {/* §13: the résumé icon exists only when the file does. */}
          {resume.available ? (
            <button type="button" className="y2k-icon" onClick={() => openKind('resume')}>
              <Icon name="floppy" />
              <span>Résumé.pdf</span>
            </button>
          ) : null}
        </div>

        {/*
         * G10: the availability line is readable without opening anything. This
         * banner is the one piece of the desktop that no window covers.
         */}
        <div className="y2k-banner" data-decorative>
          <h1>
            ★ {IDENTITY.name.toUpperCase()} ★
            <span className="y2k-banner-head">{IDENTITY.headline}</span>
          </h1>
          <span className="y2k-avail">{IDENTITY.availability.toUpperCase()}</span>
          <div className="y2k-banner-row">
            <HitCounter />
            <NetscapeBadge />
          </div>
          <Marquee text={MARQUEE_TEXT} label="Site announcements" />
        </div>

        {wm.windows.map((win) => (
          <Y2kWindow
            key={win.id}
            win={win}
            active={win.id === wm.activeId}
            onClose={wm.close}
            onFocus={wm.focus}
            onMinimize={wm.minimize}
            onMaximize={wm.maximize}
            onMove={wm.move}
            onResize={wm.resize}
            menu={MENUS[win.kind]}
          >
            {renderContent(win)}
          </Y2kWindow>
        ))}

        {assistant ? (
          <Clippy onDismiss={() => setAssistant(false)} onOpen={(what) => openKind(what)} />
        ) : null}

        {dialog ? <Dialog spec={dialog} onClose={() => setDialog(null)} /> : null}
      </div>

      <Taskbar
        windows={wm.windows}
        activeId={wm.activeId}
        onOpen={(req: OpenRequest) => open(req)}
        onTaskClick={wm.toggleTask}
        onTheme={setTheme}
        onToggleMode={toggleMode}
        mode={mode}
        onShutDown={() => setCrashed(true)}
        onAssistant={() => setAssistant(true)}
        resumeAvailable={resume.available}
      />

      {/* Trail and screensaver are motion-only, so reduced motion removes them (G17). */}
      {!reducedMotion ? <SparkleTrail /> : null}
      {idle && !booting && !crashed ? <Screensaver onWake={wake} /> : null}

      {booting ? <Boot resumeAvailable={resume.available} onDone={() => setBooting(false)} /> : null}

      {/*
       * Only ever reachable from Start → Shut Down, so it can never be mistaken
       * for a real crash, and it recovers into the boot sequence.
       */}
      {crashed ? (
        <Bsod
          onReboot={() => {
            setCrashed(false);
            setBooting(true);
            wm.closeAll();
          }}
        />
      ) : null}
    </div>
  );
};

export default App;
