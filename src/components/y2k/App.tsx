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
import { useShell } from './mobile/shell';
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
  /* null until measured — see useNarrow. `narrow` is the branch; `measured` is
     what tells a resize apart from the first paint. */
  const measured = useNarrow();
  const narrow = measured === true;
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = useState<Mode>(
    () => (document.documentElement.dataset.mode as Mode) ?? 'light',
  );
  /*
   * The BIOS post is the opening joke, so it plays on every visit rather than
   * once per session. Skippable with any key, click or tap.
   *
   * It lives here rather than in either shell because a resize across the
   * breakpoint swaps machines, and a swap must not read as a reboot: DYLAN CE
   * mounting fresh would replay its own POST every time the window narrowed. The
   * assistant is here for the same reason — dismissing him once should stick.
   */
  const [booting, setBooting] = useState(true);
  const [crashed, setCrashed] = useState(false);
  const [assistant, setAssistant] = useState(false);
  const [dialog, setDialog] = useState<DialogSpec | null>(null);
  const wm = useWindowManager();
  /* Held here, not in MobileApp, so the handheld's running programs survive a
     trip through the desktop and back. */
  const shell = useShell();

  /*
   * Both shells' live state, readable from an effect that must not re-run every
   * time a window moves. Its own effect, declared ahead of the consumers below,
   * so they read the render they fired on.
   */
  const latest = useRef({ wm, shell });
  useEffect(() => {
    latest.current = { wm, shell };
  });

  /** The screensaver only exists when motion is welcome, and never mid-boot. */
  const { idle, wake } = useIdle(70_000, !reducedMotion && !booting && !crashed && !narrow);

  const endBoot = useCallback(() => setBooting(false), []);
  const restartBoot = useCallback(() => setBooting(true), []);
  const summonAssistant = useCallback(() => setAssistant(true), []);
  const dismissAssistant = useCallback(() => setAssistant(false), []);

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
    if (measured === null || narrow || greeted.current) return;
    greeted.current = true;
    /* Arriving from the handheld is not an arrival: the handover below has
       already carried whatever was running over, and Welcome.htm landing on top
       of it is the pop-up this site promises not to do. */
    if (latest.current.shell.running.length) return;
    open({ kind: 'welcome' });
  }, [measured, narrow, open]);

  /**
   * The paperclip introduces himself once the boot is out of the way — on the
   * desktop only. On the handheld he is strictly opt-in (the tray ☻, Start, or
   * the Menu soft key): there he is a sheet across the bottom of the screen, and
   * one of those arriving unasked on a phone is a pop-up, which is the one thing
   * the marquee promises this site does not do.
   *
   * Latched to once per boot, so dismissing him and then resizing the window does
   * not summon him again. A reboot clears the latch — that is a fresh machine.
   */
  const introduced = useRef(false);
  useEffect(() => {
    if (booting || narrow || introduced.current) return;
    const timer = window.setTimeout(() => {
      introduced.current = true;
      setAssistant(true);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [booting, narrow]);

  /*
   * Crossing the breakpoint swaps machines, so carry the view across. Without
   * this you land back on Today (or on a bare desktop) every time the window
   * changes width, which reads as the site having reloaded itself.
   *
   * The two id schemes are deliberately identical — `kind`, or `kind:arg` — so a
   * window and a program refer to each other without a translation table.
   */
  const wasNarrow = useRef<boolean | null>(null);
  useEffect(() => {
    if (measured === null) return;
    const previous = wasNarrow.current;
    wasNarrow.current = narrow;
    if (previous === null || previous === narrow) return;

    const { wm: windows, shell: ce } = latest.current;
    if (narrow) {
      /* He is opt-in on the handheld, and a resize is not opting in: a paperclip
         that was a small aside in a desktop corner becomes a sheet across the
         bottom of the screen here, so carrying him over would drop one over the
         content unasked. */
      setAssistant(false);
      /*
       * Welcome.htm never crosses over. It is the *desktop's* arrival window — it
       * exists only so nobody lands on a bare desktop, and the greeting below
       * opens it before the boot console has even finished — whereas the
       * handheld's arrival is Today, which renders a superset of it: the same
       * hero, CTAs, résumé buttons and links, plus the glance panel and the
       * launcher. Carrying it over meant booting wide, going narrow mid-boot and
       * landing on a cut-down copy of the home screen with the real one a soft key
       * away. The Welcome.htm tile is still there for anyone who wants the window.
       */
      const carried = windows.windows.filter((win) => win.kind !== 'welcome');
      /* Windows become running programs in z-order, so the focused one ends up on
         screen and the rest land in Start → Running Programs. */
      for (const win of [...carried].sort((a, b) => a.z - b.z)) {
        ce.open(win.kind, win.arg);
      }
      const active = carried.find((win) => win.id === windows.activeId);
      if (active) {
        ce.open(active.kind, active.arg);
      } else {
        /* Nothing carried is focused — every window is minimised, or the only one
           on screen was Welcome.htm. Either way the handheld's equivalent is
           Today, with anything else that came over left running behind it. */
        ce.home();
      }
    } else {
      for (const app of ce.running) windows.open({ kind: app.kind, arg: app.arg });
      if (ce.current) {
        windows.focus(ce.current.id);
      } else {
        /* Today owns no window, so it maps to a desktop with everything
           minimised rather than to programs the visitor had already put away. */
        for (const app of ce.running) windows.minimize(app.id);
      }
    }
  }, [measured, narrow]);

  if (narrow) {
    return (
      <MobileApp
        onToggleMode={toggleMode}
        mode={mode}
        resume={resume}
        shell={shell}
        booting={booting}
        onBooted={endBoot}
        onReboot={restartBoot}
        assistant={assistant}
        onSummonAssistant={summonAssistant}
        onDismissAssistant={dismissAssistant}
      />
    );
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
            /* A reboot is a fresh machine, so the paperclip gets to introduce
               himself again. */
            introduced.current = false;
            open({ kind: 'welcome' });
          }}
        />
      ) : null}
    </div>
  );
};

export default App;
