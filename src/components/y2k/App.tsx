/**
 * The desktop: a Windows 98/2000 machine that happens to be a personal site.
 *
 * Owns the boot/BSOD/screensaver states, the desktop chrome and the light/dark
 * toggle. Narrow viewports get MobileApp — DYLAN CE, a different machine — instead.
 * Window dragging lives in wm.ts, which bypasses React on the drag path.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { persistMode, type Mode } from '../../lib/mode';
import { IDENTITY } from '../../data';
import '../../styles/y2k.css';

import Icon, { type IconName } from './Icon';
import Taskbar from './Taskbar';
import Y2kWindow from './Y2kWindow';
import Clippy from './Clippy';
import Boot from './Boot';
import { Bsod, Dialog, GUESTBOOK_FULL, type DialogSpec } from './Dialog';
import { Screensaver, SparkleTrail } from './effects';
import MobileApp from './mobile/MobileApp';
import { MARQUEE_TEXT, Marquee } from './deco';
import { useIdle, useNarrow, useReducedMotion } from './hooks';
import {
  useWindowManager,
  WINDOW_MENUS,
  type OpenRequest,
  type Resume,
  type WindowKind,
  type WindowState,
} from './wm';

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
import ResumeWindow from './content/ResumeWindow';
import HelpWindow from './content/HelpWindow';

/** Desktop icons. The whole site is reachable from here and from Start. */
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

type Props = {
  /** Whether public/resume.pdf exists, plus every href a window could need. */
  resume: Resume;
};

const App = ({ resume }: Props) => {
  const narrow = useNarrow();
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = useState<Mode>(
    () => (document.documentElement.dataset.mode as Mode) ?? 'light',
  );
  /*
   * The BIOS post is the opening joke, so it plays on every visit rather than
   * once per session. Skippable with any key, click or tap.
   */
  const [booting, setBooting] = useState(true);
  const [crashed, setCrashed] = useState(false);
  const [assistant, setAssistant] = useState(false);
  const [dialog, setDialog] = useState<DialogSpec | null>(null);
  const wm = useWindowManager();

  /** The screensaver only exists when motion is welcome, and never mid-boot. */
  const { idle, wake } = useIdle(70_000, !reducedMotion && !booting && !crashed && !narrow);

  const toggleMode = useCallback(() => {
    setMode((current) => {
      const next: Mode = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.mode = next;
      document.documentElement.style.colorScheme = next;
      persistMode(next);
      return next;
    });
  }, []);

  /** DYLAN CE is a document and scrolls; the desktop is a screen and must not. */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('y2k-mobile', narrow);
    return () => root.classList.remove('y2k-mobile');
  }, [narrow]);

  /**
   * Open Welcome.htm on arrival so nobody lands on a bare desktop. Reopening an
   * already-open window only focuses it, so this cannot pile up duplicates.
   */
  const { open } = wm;
  const greeted = useRef(false);
  useEffect(() => {
    if (narrow || greeted.current) return;
    greeted.current = true;
    open({ kind: 'welcome' });
  }, [narrow, open]);

  /** The paperclip introduces himself once the boot is out of the way. */
  useEffect(() => {
    if (booting || narrow) return;
    const timer = window.setTimeout(() => setAssistant(true), 1200);
    return () => window.clearTimeout(timer);
  }, [booting, narrow]);

  if (narrow) {
    return <MobileApp onToggleMode={toggleMode} mode={mode} resume={resume} />;
  }

  const openKind = (kind: WindowKind, arg?: string) => open({ kind, arg: arg ?? null });

  const renderContent = (win: WindowState) => {
    switch (win.kind) {
      case 'welcome':
        return <WelcomeWindow resume={resume} onOpen={(kind) => openKind(kind)} />;
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
        return <GuestbookWindow onSign={() => setDialog(GUESTBOOK_FULL)} />;
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
        return <HelpWindow />;
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
          {/*
           * The résumé icon exists only when the file does. Labelled with the
           * document half of the window title, not the reader application.
           */}
          {resume.available ? (
            <button type="button" className="y2k-icon" onClick={() => openKind('resume')}>
              <Icon name="floppy" />
              <span>Résumé.pdf</span>
            </button>
          ) : null}
        </div>

        {/* The availability line is readable without opening anything: this
            banner is the one piece of the desktop that no window covers. */}
        <div className="y2k-banner" data-decorative>
          <h1>
            ★ {IDENTITY.name.toUpperCase()} ★
            <span className="y2k-banner-head">{IDENTITY.headline}</span>
          </h1>
          <span className="y2k-avail">{IDENTITY.availability.toUpperCase()}</span>
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
            menu={WINDOW_MENUS[win.kind]}
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
        onToggleMode={toggleMode}
        mode={mode}
        onShutDown={() => setCrashed(true)}
        onAssistant={() => setAssistant(true)}
        resumeAvailable={resume.available}
      />

      {/* Trail and screensaver are motion-only, so reduced motion removes them. */}
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
            wm.closeAll();
            /*
             * Replay the real boot console instead of cutting straight back to
             * the desktop, and reopen Welcome.htm behind it.
             */
            setBooting(true);
            open({ kind: 'welcome' });
          }}
        />
      ) : null}
    </div>
  );
};

export default App;
