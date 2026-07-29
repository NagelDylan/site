/**
 * MAC THEME — a Mac OS 8/9 "Platinum" desktop, mounted on the client (§10, spec §4.12).
 *
 * This is not a document with grey paint on it: it is a shell. The desktop is the
 * page, the screen-top menu bar is the navigation, and the windows really do drag.
 * See wm.ts for why the drag path deliberately bypasses React, and theme-mount.ts
 * for why this theme mounts on the client while paper is server-rendered.
 *
 * The Y2K tree is the same era on the other side of the aisle, and the two are
 * deliberately not siblings in behaviour: Windows 98 shouts, the Macintosh
 * politely explains. So the differences here are structural rather than cosmetic —
 * navigation lives in a fixed menu bar instead of a Start button, windows collapse
 * (window-shade) instead of minimising to a taskbar, help is opt-in Balloon Help
 * instead of a character who interrupts, the icon column is on the RIGHT, and a
 * single click on an icon selects rather than opens.
 *
 * ─── WHAT THIS FILE OWNS ─────────────────────────────────────────────────────
 *   • the boot sequence, the system-error/reboot cycle, and the idle screensaver
 *   • the desktop: the Stickies note, the right-hand icon column with its
 *     selection state, the zoom-rect layer, Balloon Help, dialogs
 *   • routing a deep link to the window it should open (G7)
 *   • the always-visible theme switcher and the light/dark toggle (G4, G8)
 *   • narrow viewports, which get the simplified document instead (§4.13)
 *
 * ─── THE HARD RULES, AS THEY APPLY TO THIS THEME ─────────────────────────────
 * R1  No performance metrics anywhere, including in microcopy. Counts of things
 *     that exist on the page (list rows, groups) are structure, not achievement,
 *     and are the only numbers allowed to appear in chrome.
 * R2  FlowSense won nothing. There is no award slot, badge, ribbon or placement
 *     anywhere in this tree. A quietly-worded false claim is still a false claim.
 * R3  Apple gets APPLE_DESCRIPTION verbatim and no Mac-manual embellishment — see
 *     the plain treatment in content/WorkWindow.tsx. Text only, never the logo.
 *     There is no apple silhouette anywhere in this tree, by design: the menu-bar
 *     mark is an abstract six-stripe rainbow lozenge (spec §2, trademark).
 * R4  Graduation is 2028. The only 2027 on this desktop is the Summer 2027 co-op
 *     *term* availability line, which is a work term and not a degree date.
 * R5  Every claim traces to src/data. Microcopy is allowed to be calm flavour; it
 *     is not allowed to be new information.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ThemeAppProps } from '../../lib/theme-mount';
import type { ThemeId } from '../../data/voice';
import { persistMode, returnToChooser, type Mode } from '../../lib/theme';
import { RECYCLE_BIN, projectBySlug } from '../../data';
/*
 * ─── WHY THIS THEME IMPORTS TEN STYLESHEETS AND THE OTHERS IMPORT ONE ────────
 *
 * Paper, Y2K and chat each import a single theme-<id>.css. This one is split
 * into partials under src/styles/mac/, along the seams that actually exist in
 * the markup, because it was written by a fleet of agents in parallel and ten
 * bounded files could be authored at once where one 3,000-line file could not.
 * The split also keeps "is this chrome or content?" answerable by looking at
 * which file a rule lives in.
 *
 * THE ORDER IS LOAD-BEARING. _foundation.css must come first: it declares every
 * --mac-* token the others consume and establishes the desktop's structural
 * layout (the fixed shell, the non-scrolling desk, absolutely positioned
 * windows). Everything after it is a skin that assumes those exist.
 *
 * These are imported HERE rather than via `@import` from a thin manifest
 * stylesheet, which is what this theme did first. Vite resolved that fine for a
 * production build, but the dev server failed on it with
 * `ENOENT: open './mac/desktop.css'` — a CSS `@import` whose relative path gets
 * resolved against the process's working directory instead of the importing
 * file's. Importing from the module graph is how every other theme in this repo
 * loads its CSS, it resolves identically in dev and in build, and it gives each
 * partial real HMR. Do not reintroduce the manifest.
 */
import '../../styles/mac/_foundation.css';
import '../../styles/mac/desktop.css';
import '../../styles/mac/menubar.css';
import '../../styles/mac/window-chrome.css';
import '../../styles/mac/controls.css';
import '../../styles/mac/system.css';
import '../../styles/mac/content-base.css';
import '../../styles/mac/content-finder.css';
import '../../styles/mac/content-apps.css';
import '../../styles/mac/mobile.css';

import Icon, { type IconName } from './Icon';
import MenuBar from './MenuBar';
import ControlStrip from './ControlStrip';
import MacWindow from './MacWindow';
import Boot from './Boot';
import { Dialog, SystemError, type DialogSpec } from './Dialog';
import { BalloonLayer, Screensaver, ZoomRects, zoomFrom } from './effects';
import { DeskNote } from './deco';
import MacMobile from './Mobile';
import { useIdle, useNarrow, useReducedMotion } from './hooks';
import {
  WINDOW_DEFS,
  useWindowManager,
  windowsForRoute,
  type OpenRequest,
  type WindowKind,
  type WindowState,
} from './wm';

import ReadMeWindow from './content/ReadMeWindow';
import WorkWindow from './content/WorkWindow';
import AboutWindow from './content/AboutWindow';
import SystemWindow from './content/SystemWindow';
import FinderWindow, { TrashList } from './content/FinderWindow';
import GetInfoWindow from './content/GetInfoWindow';
import ExtensionsWindow from './content/ExtensionsWindow';
import MailWindow from './content/MailWindow';
import ScrapbookWindow from './content/ScrapbookWindow';
import QuickTimeWindow from './content/QuickTimeWindow';
import { ChooserWindow, GuideWindow, ResumeWindow } from './content/panels';

type DesktopIcon = {
  kind: WindowKind;
  label: string;
  icon: IconName;
  /** Balloon Help text, in the calm Mac-manual voice (spec §4.9). */
  balloon: string;
  /** Pinned to the bottom of the column by CSS rather than by document order. */
  pinned?: true;
};

/**
 * The right-hand icon column, top to bottom (spec §4.12).
 *
 * Macintosh HD leads because that is where the boot volume sat on every Mac of
 * the era, and Trash is pinned to the bottom corner for the same reason. Both are
 * the single most recognisable difference from the Y2K desktop's left-hand column,
 * so the order is not negotiable.
 *
 * The label and the window title are allowed to differ in exactly one place: the
 * volume is "Macintosh HD" but the window it opens is "About This Macintosh",
 * because that is what a Mac did. Everywhere else the label matches the title in
 * WINDOW_DEFS, and if you change one you must change the other.
 */
const DESKTOP_ICONS: DesktopIcon[] = [
  {
    kind: 'system',
    label: 'Macintosh HD',
    icon: 'hd',
    balloon: 'Double-click to open About This Macintosh, where the school information is kept.',
  },
  {
    kind: 'projects',
    label: 'Projects',
    icon: 'folder',
    balloon:
      'Double-click to open the Projects folder. The featured work sits at the top level; the older work is filed in Archive.',
  },
  {
    kind: 'readme',
    label: 'Read Me',
    icon: 'doc',
    balloon: 'Double-click to open the Read Me. It explains what is installed on this desktop.',
  },
  {
    kind: 'work',
    label: 'Work History',
    icon: 'doc',
    balloon:
      'Double-click for the work history. Those dates and descriptions read the same on every version of this site.',
  },
  {
    kind: 'about',
    label: 'About Dylan Nagel',
    icon: 'simpletext',
    balloon: 'Double-click for the longer introduction, and a picture.',
  },
  {
    kind: 'extensions',
    label: 'Extensions Manager',
    icon: 'extension',
    balloon:
      'Double-click to see the languages and tools, listed the way Extensions Manager lists extensions.',
  },
  {
    kind: 'mail',
    label: 'New Message',
    icon: 'mail',
    balloon:
      'Double-click to open a message form. It sends to Dylan, and tells you honestly whether it arrived; the address printed beside it reaches him directly.',
  },
  {
    kind: 'scrapbook',
    label: 'Scrapbook',
    icon: 'scrapbook',
    balloon: 'Double-click to page through the Scrapbook. Nothing in it can be edited.',
  },
  {
    kind: 'quicktime',
    label: 'QuickTime Player',
    icon: 'quicktime',
    balloon:
      'Double-click to open QuickTime Player. It holds a netlabel collection.',
  },
  {
    kind: 'guide',
    label: 'Macintosh Guide',
    icon: 'guide',
    balloon: 'Double-click for Macintosh Guide, which explains how this desktop works.',
  },
];

/** §13: the résumé icon exists only when the file does. */
const RESUME_ICON: DesktopIcon = {
  kind: 'resume',
  label: 'Résumé.pdf',
  icon: 'pdf',
  /*
   * This balloon used to say "double-click to download", which stopped being true
   * the moment the window learned to display the PDF instead of merely offering it.
   * A balloon that describes the wrong outcome is worse than none — it is the only
   * warning a visitor gets before they double-click, and the whole point of the
   * Macintosh register is that it tells you what is about to happen.
   */
  balloon:
    'Double-click to open the résumé and read it here. There is a button inside for saving the file.',
};

/**
 * Trash, last in the DOM and pinned to the bottom-right by CSS.
 *
 * It is drawn bulging rather than empty, and that is read from the fact layer
 * rather than decided here: RECYCLE_BIN has entries in it, and Special → Empty
 * Trash refuses to remove them. An empty-looking Trash with contents inside would
 * be the one dishonest icon on the desktop.
 */
const TRASH_ICON: DesktopIcon = {
  kind: 'trash',
  label: 'Trash',
  icon: RECYCLE_BIN.length ? 'trashFull' : 'trash',
  balloon:
    'Double-click to see what did not make the cut. Nothing here is deleted, and the Trash is never emptied.',
  pinned: true,
};

/**
 * Fills in the per-open title for a Get Info window.
 *
 * WINDOW_DEFS.project deliberately has no fixed title (spec §4.2) because a Get
 * Info window is named after its file — "Tanks Info", not "Project". Every path
 * that opens one goes through here, including deep links, so a hand-typed
 * /projects/nonsense URL gets the generic def title and GetInfoWindow's calm
 * "file not found" body instead of the string "undefined Info" in a title bar.
 */
const withTitle = (req: OpenRequest): OpenRequest => {
  if (req.kind !== 'project' || !req.arg || req.title) return req;
  const project = projectBySlug(req.arg);
  return { ...req, title: project ? `${project.name} Info` : WINDOW_DEFS.project.title };
};

/**
 * Zoom rects for a window opened from a menu, flying from the item that was
 * picked (spec §4.9).
 *
 * The rect is read from the focused element rather than passed in, because
 * MenuBar's contract is `(req: OpenRequest) => void` and widening it to carry a
 * DOM node would push chrome geometry into the window manager's API for the sake
 * of an animation. The `[role="menuitem"]` guard is what makes that safe: Safari
 * does not focus a button on click, so activeElement is often <body>, and zooming
 * from the whole viewport looks like a bug rather than a flourish. No menu item
 * focused, no zoom.
 */
const zoomFromFocusedMenuItem = (): void => {
  const active = document.activeElement;
  const item = active instanceof HTMLElement ? active.closest('[role="menuitem"]') : null;
  if (item) zoomFrom(item.getBoundingClientRect());
};

/**
 * The Scrapbook's "Sign" button lands here rather than in the window, because the
 * dialog is a desktop-level alert and the honesty it carries is site-wide: there is
 * still no database anywhere behind this site, so nothing typed on it is filed.
 *
 * Careful with the wording here. The New Message window *does* now deliver mail
 * (through the Web3Forms relay — see src/lib/contact.ts), so "nothing you type goes
 * anywhere" stopped being true and had to go. What remains true, and is what this
 * dialog is actually about, is that the site stores nothing itself.
 */
const SIGN_DIALOG: DialogSpec = {
  title: 'This Scrapbook cannot be signed.',
  icon: 'caution',
  body: (
    <>
      <p>
        The Scrapbook is a read-only desk accessory here. There is no database behind this site, so
        there is nowhere for a new page to be filed.
      </p>
      <p>
        Nothing typed on this site is stored by it. If you would like to leave a note, the New
        Message window sends one — and the address printed in it reaches him directly.
      </p>
    </>
  ),
  okLabel: 'OK',
};

const App = ({ route, resume, mode: initialMode }: ThemeAppProps) => {
  const narrow = useNarrow();
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = useState<Mode>(initialMode);
  /*
   * The boot sequence plays on EVERY entry into this theme, not once per session.
   *
   * Spec §10 asked for once-per-session so that clicking around the site did not
   * mean sitting through a cold boot on every deep link. Dylan overrode that for
   * Y2K: the startup is the theme's opening joke and he wants it every time
   * someone chooses the theme. The same reasoning holds here — the Happy Mac and
   * the extensions marching in are the whole opening beat — and since this
   * component only mounts when the theme is activated (ThemeBoot unmounts it on
   * the way out), a fresh mount is exactly "entered the theme again". It stays
   * skippable with any key, click or tap.
   */
  const [booting, setBooting] = useState(true);
  /** Set when the boot we are running is a reboot, which lands on the chooser. */
  const [rebooting, setRebooting] = useState(false);
  const [crashed, setCrashed] = useState(false);
  /** Balloon Help is opt-in, and off until asked for — that is the whole point of it. */
  const [balloons, setBalloons] = useState(false);
  const [dialog, setDialog] = useState<DialogSpec | null>(null);
  /**
   * The selected desktop icon, or null.
   *
   * The Mac's single-click-selects / double-click-opens model is the reason this
   * state exists at all, and it is worth the extra state: on the Y2K desktop an
   * icon is a button you press, and here it is a file you point at first. Nothing
   * follows from selection except its appearance, which is why it carries no ARIA
   * state — announcing it as a pressed toggle would promise that Enter toggles
   * the icon when Enter in fact opens it.
   */
  const [selected, setSelected] = useState<WindowKind | null>(null);
  const wm = useWindowManager();
  const { open } = wm;
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
    document.documentElement.classList.toggle('mac-mobile', narrow);
    return () => document.documentElement.classList.remove('mac-mobile');
  }, [narrow]);

  /**
   * Deep link → windows (G7). /experience opens Work History rather than dropping
   * the visitor on a bare desktop; /projects/tanks opens the Projects folder with
   * that project's Get Info window on top. Runs once — reopening on every render
   * would fight the visitor for control of their own windows.
   */
  useEffect(() => {
    if (routed.current || narrow) return;
    routed.current = true;
    for (const req of windowsForRoute(route)) open(withTitle(req));
  }, [route, narrow, open]);

  /** Menu picks and content-window buttons come through here. */
  const openRequest = useCallback(
    (req: OpenRequest) => {
      if (!reducedMotion) zoomFromFocusedMenuItem();
      open(withTitle(req));
    },
    [open, reducedMotion],
  );

  const openKind = useCallback(
    (kind: WindowKind, arg?: string) => openRequest({ kind, arg: arg ?? null }),
    [openRequest],
  );

  if (narrow) {
    return <MacMobile onTheme={setTheme} onToggleMode={toggleMode} mode={mode} resume={resume} />;
  }

  /**
   * Opening from an icon: select it, then fly a zoom rect from the icon's own
   * rectangle out to the window (spec §4.12). Under reduced motion the window
   * simply appears — the rects are not rendered frozen, they are not rendered.
   */
  const openFromIcon = (entry: DesktopIcon, element: HTMLElement) => {
    setSelected(entry.kind);
    if (!reducedMotion) zoomFrom(element.getBoundingClientRect());
    open(withTitle({ kind: entry.kind, arg: null }));
  };

  /**
   * Clicking the desk deselects, which is Finder behaviour and the reason the
   * selection reads as a property of the desktop rather than of the button. The
   * `.mac-icon` bail keeps a click on an icon from clearing the selection it is
   * about to set.
   */
  const onDesktopPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('.mac-icon')) return;
    setSelected(null);
  };

  const renderIcon = (entry: DesktopIcon) => (
    <button
      key={entry.kind}
      type="button"
      className={`mac-icon${entry.pinned ? ' mac-icon--pinned' : ''}`}
      data-selected={selected === entry.kind || undefined}
      data-balloon={entry.balloon}
      onClick={() => setSelected(entry.kind)}
      onDoubleClick={(event) => openFromIcon(entry, event.currentTarget)}
      onKeyDown={(event) => {
        if (event.key !== 'Enter') return;
        /*
         * preventDefault matters here. A <button> synthesises a click from Enter,
         * so without it the window opens and then the click handler runs and
         * re-selects — harmless today, but it makes Enter and Space behave
         * identically the moment either handler grows a side effect. Enter opens,
         * Space (which fires a real click) selects, as on the machine this is
         * pretending to be.
         */
        event.preventDefault();
        openFromIcon(entry, event.currentTarget);
      }}
    >
      <span className="mac-icon-glyph">
        <Icon name={entry.icon} />
      </span>
      <span className="mac-icon-label">{entry.label}</span>
    </button>
  );

  const renderContent = (win: WindowState) => {
    switch (win.kind) {
      case 'readme':
        return <ReadMeWindow resume={resume} onTheme={setTheme} onOpen={(kind) => openKind(kind)} />;
      case 'work':
        return <WorkWindow />;
      case 'projects':
        return (
          <FinderWindow onOpenProject={(slug: string) => openRequest({ kind: 'project', arg: slug })} />
        );
      case 'project':
        return <GetInfoWindow slug={win.arg ?? ''} />;
      case 'about':
        return <AboutWindow onContact={() => openKind('mail')} />;
      case 'extensions':
        return <ExtensionsWindow />;
      case 'system':
        return <SystemWindow />;
      case 'mail':
        return <MailWindow />;
      case 'scrapbook':
        return <ScrapbookWindow onSign={() => setDialog(SIGN_DIALOG)} />;
      case 'trash':
        return (
          <div className="mac-client mac-client--well mac-scroll">
            <TrashList />
          </div>
        );
      case 'quicktime':
        return <QuickTimeWindow />;
      case 'resume':
        return <ResumeWindow resume={resume} />;
      case 'guide':
        return <GuideWindow onTheme={setTheme} />;
      case 'chooser':
        return <ChooserWindow onTheme={setTheme} />;
      default:
        return <div className="mac-client" />;
    }
  };

  /**
   * Finder-style status strip, on the one window whose content does not draw its
   * own header row. The count is a count of rows on screen — structure, not a
   * performance claim (R1) — and the second cell is the Trash's standing promise.
   */
  const statusFor = (win: WindowState): React.ReactNode[] | undefined =>
    win.kind === 'trash'
      ? [`${RECYCLE_BIN.length} items`, 'Kept on purpose. The Trash is never emptied.']
      : undefined;

  /**
   * Special → Empty Trash…, whose punchline is that the archive is staying.
   *
   * MenuBar takes this as an optional handler because the dialog layer lives here,
   * not in the menu; without it the command falls back to simply opening the Trash
   * window. The wording refuses the action up front rather than pretending to
   * perform it — a dialog that claims to have deleted something it did not is the
   * same small dishonesty §18.5 forbids everywhere else on this site.
   */
  const askEmptyTrash = () =>
    setDialog({
      title: 'The Trash will not be emptied.',
      icon: 'caution',
      body: (
        <>
          <p>
            These are the projects that did not make the cut. They are filed here deliberately — a
            portfolio listing only the things that worked has a piece missing.
          </p>
          <p>Nothing on this desktop can be deleted, so they are staying. Have a look if you like.</p>
        </>
      ),
      okLabel: 'Open the Trash',
      cancelLabel: 'Leave it alone',
      onConfirm: () => openKind('trash'),
    });

  return (
    <div className="mac-root" data-busy={booting ? 'true' : undefined}>
      <MenuBar
        windows={wm.windows}
        activeId={wm.activeId}
        onOpen={openRequest}
        onSelectWindow={wm.select}
        onTheme={setTheme}
        onToggleMode={toggleMode}
        mode={mode}
        onShutDown={() => setCrashed(true)}
        onToggleBalloons={() => setBalloons((on) => !on)}
        balloons={balloons}
        resumeAvailable={resume.available}
        onEmptyTrash={askEmptyTrash}
      />

      <div className="mac-desktop" onPointerDown={onDesktopPointerDown}>
        {/*
         * G10: the availability line is readable without opening anything. The
         * Stickies note is the one piece of the desktop that no window covers, and
         * it carries real information, so it is NOT marked decorative — it has to
         * survive print.
         */}
        <DeskNote />

        {/*
         * G15: the icon column is navigation, so it is chrome and print.css drops
         * it. Without the attribute a printed copy of this theme opens with eleven
         * orphaned file names — "Macintosh HD", "Projects", "Trash" — above the
         * actual document, which is exactly the screenshot-of-a-desktop that the
         * print rules exist to prevent. The Stickies note above is the deliberate
         * opposite case: it carries facts, so it is not marked.
         */}
        <div className="mac-icons" role="group" aria-label="Desktop icons" data-chrome>
          <p className="sr-only">
            Click an icon once to select it. Double-click it, or press Enter, to open it.
          </p>
          {DESKTOP_ICONS.map(renderIcon)}
          {resume.available ? renderIcon(RESUME_ICON) : null}
          {renderIcon(TRASH_ICON)}
        </div>

        {wm.windows.map((win) => (
          <MacWindow
            key={win.id}
            win={win}
            active={win.id === wm.activeId}
            onClose={wm.close}
            onFocus={wm.focus}
            onCollapse={wm.collapse}
            onZoom={wm.zoom}
            onMove={wm.move}
            onResize={wm.resize}
            status={statusFor(win)}
          >
            {renderContent(win)}
          </MacWindow>
        ))}

        {/* Opt-in help, so nothing ever interrupts anyone. Off by default. */}
        <BalloonLayer active={balloons} />

        {dialog ? <Dialog spec={dialog} onClose={() => setDialog(null)} /> : null}
      </div>

      {/* G8: the always-visible switcher. Never behind a menu, never overlapping the note. */}
      <ControlStrip
        mode={mode}
        onToggleMode={toggleMode}
        onOpen={(kind: WindowKind) => openKind(kind)}
        balloons={balloons}
        onToggleBalloons={() => setBalloons((on) => !on)}
      />

      {/* Zoom rects and screensaver are motion-only, so reduced motion removes them (G17). */}
      {!reducedMotion ? <ZoomRects /> : null}
      {idle && !booting && !crashed ? <Screensaver onWake={wake} /> : null}

      {booting ? (
        <Boot
          resumeAvailable={resume.available}
          onDone={() => {
            setBooting(false);
            // A reboot shows the startup screen first and only then hands back to
            // the chooser, so the restart is something you watch rather than a
            // jump cut.
            if (rebooting) {
              setRebooting(false);
              returnToChooser();
            }
          }}
        />
      ) : null}

      {/*
       * Only ever reachable from Special → Shut Down, so it can never be mistaken
       * for a real crash, and it recovers into the boot sequence.
       */}
      {crashed ? (
        <SystemError
          onReboot={() => {
            setCrashed(false);
            wm.closeAll();
            /**
             * Reboot runs the real startup sequence, then hands back to the chooser.
             *
             * Two things had to be true at once here. The restart should actually
             * look like a restart — Happy Mac, welcome plaque, extensions marching
             * in — rather than a jump cut. And it should end at the theme chooser,
             * because being dropped straight back into the same desktop makes the
             * shut-down gag a no-op.
             *
             * So this only arms the sequence: `rebooting` tells the Boot onDone
             * handler to call returnToChooser() once the startup screen has
             * finished playing. Skipping the boot skips straight to the chooser
             * too, since the skip path is the same onDone.
             */
            setRebooting(true);
            setBooting(true);
          }}
        />
      ) : null}
    </div>
  );
};

export default App;
