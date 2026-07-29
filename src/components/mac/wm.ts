/**
 * The window manager for the Classic Mac theme (spec §4.2).
 *
 * A static frame would read as a screenshot and kill the joke, so this is a real
 * manager: independent geometry per window, focus with correct z-order, the
 * window-shade **collapse**, **zoom**, close, and pointer-driven drag and resize.
 *
 * Two deliberate performance decisions, carried over from the Y2K tree because
 * they are the two that actually matter:
 *   1. Committed geometry lives in this reducer, but a *drag in progress* never
 *      touches React. MacWindow.tsx writes `transform: translate()` straight to
 *      the node on pointermove and dispatches MOVE once on pointerup. A 60 Hz
 *      pointermove that re-rendered a window body full of copy would be visibly
 *      laggy on a laptop, and the whole gag depends on the windows feeling real.
 *   2. z-order is a plain counter rather than an array reorder, so focusing a
 *      window re-renders one window rather than resorting the desktop.
 *
 * Differences from the Y2K manager that are not cosmetic:
 *   • `minimized` is gone. The Mac has no taskbar to minimise into; it has the
 *     window shade, so a window **collapses** to its title bar and stays on the
 *     desktop, visible and still focusable. That is why `focus` does not
 *     un-collapse anything and `activeId` does not skip collapsed windows — a
 *     collapsed window can legitimately be the frontmost one.
 *   • `select` is the Application-menu pick: un-collapse *and* bring to front.
 *
 * R5: window titles below are microcopy and assert no fact — no company, no date,
 * no placement (R2), no percentage (R1). "About This Macintosh" is an era product
 * screen, not a claim about a computer.
 */
import { useCallback, useMemo, useReducer } from 'react';
import { RESUME } from '../../config';
import type { IconName } from './Icon';

export type WindowKind =
  | 'readme' // welcome
  | 'work' // experience
  | 'projects' // Finder folder, list view
  | 'project' // Get Info window, arg = slug
  | 'about' // Read Me / SimpleText
  | 'extensions' // skills
  | 'system' // education, About This Macintosh
  | 'mail' // contact
  | 'scrapbook' // guestbook
  | 'trash'
  | 'quicktime'
  | 'resume'
  | 'guide' // help
  | 'chooser'; // theme switcher

/**
 * Whether `public/resume.pdf` actually exists, resolved server-side and handed
 * down through `ThemeAppProps`.
 *
 * Declared here rather than in a content file because both content owners and the
 * chrome need it, and §13 is strict: the résumé is only ever offered when the file
 * is really there. Nothing in this tree may link to a PDF that 404s.
 *
 * G9 keeps this a separate declaration from the y2k and chat copies on purpose —
 * do not hoist it into a shared module. `viewHref` already carries the open
 * parameters, so the Résumé window embeds it verbatim and never builds a fragment
 * of its own; `href` stays clean for the download.
 */
export type Resume = {
  available: boolean;
  href: string;
  viewHref: string;
  page: string;
  filename: string;
};

export type WindowState = {
  /** Unique per open window. `project:tanks` keeps one window per project. */
  id: string;
  kind: WindowKind;
  /** Free-form argument, e.g. a project slug. */
  arg: string | null;
  title: string;
  icon: IconName;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  /** Window shade: the frame renders its title bar only, body hidden. */
  collapsed: boolean;
  /** The Mac's zoom box: grow to fill the desk, or go back to the old size. */
  zoomed: boolean;
  resizable: boolean;
};

type Def = {
  title: string;
  icon: IconName;
  w: number;
  h: number;
  resizable?: boolean;
};

/** The menu bar is fixed to the top of the viewport; nothing may sit under it. */
export const MENU_BAR_HEIGHT = 22;

/**
 * Window titles, in the Mac register: sentence-and-Title-Case document names, no
 * exclamation marks, no ALL CAPS. Compare the Y2K table, which shouts. Same
 * completeness, opposite temperament (spec §0).
 */
export const WINDOW_DEFS: Record<WindowKind, Def> = {
  readme: { title: 'Read Me', icon: 'doc', w: 540, h: 420 },
  work: { title: 'Work History', icon: 'doc', w: 620, h: 470 },
  projects: { title: 'Projects', icon: 'folderOpen', w: 640, h: 400 },
  /** Overridden per open with `<Name> Info`; this is only the fallback. */
  project: { title: 'Get Info', icon: 'getinfo', w: 420, h: 480 },
  about: { title: 'About Dylan Nagel', icon: 'simpletext', w: 540, h: 440 },
  extensions: { title: 'Extensions Manager', icon: 'extension', w: 520, h: 420 },
  system: { title: 'About This Macintosh', icon: 'hd', w: 500, h: 400 },
  mail: { title: 'New Message', icon: 'mail', w: 480, h: 460 },
  scrapbook: { title: 'Scrapbook', icon: 'scrapbook', w: 460, h: 400 },
  trash: { title: 'Trash', icon: 'trash', w: 480, h: 320 },
  /**
   * Was 340×230, which was the right size for a player with nothing in it. It now
   * holds cover art, a scrub bar, a time readout and the Movie popup menu
   * (content/QuickTimeWindow.tsx), so it is taller. Still fixed: QuickTime Player
   * sized itself to its movie and offered no grow box, and unlike the résumé
   * window below there is no document here that a visitor is straining to read.
   */
  quicktime: { title: 'QuickTime Player', icon: 'quicktime', w: 360, h: 400, resizable: false },
  /**
   * Sized and resizable because this window now *displays* the PDF rather than
   * offering a button for it. A page of A4 in a 400×240 box is a letterbox with two
   * lines of type in it, and a fixed size would be worse still — the one window on
   * this desktop whose contents are a document the visitor is trying to read is the
   * one that most needs a grow box. Kept as the file name, "Résumé.pdf": the
   * Macintosh names a document window after the document, and dressing this title
   * bar as an *application* would be the Windows 98 tree's move, not this one's.
   */
  resume: { title: 'Résumé.pdf', icon: 'pdf', w: 680, h: 560 },
  guide: { title: 'Macintosh Guide', icon: 'guide', w: 500, h: 420 },
  chooser: { title: 'Chooser', icon: 'chooser', w: 460, h: 320 },
};

export type OpenRequest = { kind: WindowKind; arg?: string | null; title?: string };

type Action =
  | { type: 'open'; req: OpenRequest; bounds: { w: number; h: number } }
  | { type: 'close'; id: string }
  | { type: 'closeAll' }
  | { type: 'focus'; id: string }
  | { type: 'collapse'; id: string }
  | { type: 'zoom'; id: string }
  | { type: 'select'; id: string }
  | { type: 'move'; id: string; x: number; y: number }
  | { type: 'resize'; id: string; w: number; h: number };

type State = { windows: WindowState[]; z: number; opened: number };

export const initialState: State = { windows: [], z: 10, opened: 0 };

const idFor = (req: OpenRequest) => (req.arg ? `${req.kind}:${req.arg}` : req.kind);

/**
 * Smallest a window may be sized to before the chrome stops making sense.
 * Exported because MacWindow's resize floors have to be the same two numbers as
 * this reducer's opening floors — two copies drift, and the symptom is a window
 * that snaps to a different size the moment you let go of the grow box.
 */
export const MIN_W = 240;
export const MIN_H = 140;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'open': {
      const id = idFor(action.req);
      const existing = state.windows.find((w) => w.id === id);
      const z = state.z + 1;
      if (existing) {
        // Re-opening something already on the desk is a *select*: pull the shade
        // back up and bring it forward, rather than spawning a second copy.
        return {
          ...state,
          z,
          windows: state.windows.map((w) => (w.id === id ? { ...w, z, collapsed: false } : w)),
        };
      }
      const def = WINDOW_DEFS[action.req.kind];
      const w = Math.min(def.w, Math.max(MIN_W, action.bounds.w - 40));
      const h = Math.min(def.h, Math.max(MIN_H, action.bounds.h - 80));
      /**
       * Cascade, wrapping before it walks off the desk.
       *
       * The origin and the clamps are chosen to protect two things a visitor must
       * not have buried: the Stickies note in the top-left, which carries the
       * availability line and is the G10 guarantee that the facts are readable
       * without opening anything, and the right-hand icon column with Macintosh HD
       * at the top and the Trash at the bottom. Hence x starts well clear of the
       * note and stops 96px short of the right edge.
       */
      const step = (state.opened % 6) * 22;
      const x = Math.max(8, Math.min(action.bounds.w - w - 96, 120 + step));
      const y = Math.max(
        MENU_BAR_HEIGHT + 6,
        Math.min(action.bounds.h - h - 48, MENU_BAR_HEIGHT + 42 + step),
      );
      return {
        ...state,
        z,
        opened: state.opened + 1,
        windows: [
          ...state.windows,
          {
            id,
            kind: action.req.kind,
            arg: action.req.arg ?? null,
            title: action.req.title ?? def.title,
            icon: def.icon,
            x,
            y,
            w,
            h,
            z,
            collapsed: false,
            zoomed: false,
            resizable: def.resizable !== false,
          },
        ],
      };
    }
    case 'close':
      return { ...state, windows: state.windows.filter((w) => w.id !== action.id) };
    case 'closeAll':
      return { ...state, windows: [] };
    case 'focus': {
      const target = state.windows.find((w) => w.id === action.id);
      // Already frontmost: bail before dispatching, so a pointerdown inside the
      // active window does not re-render the desktop on every click. Note this
      // deliberately does *not* un-collapse — clicking a collapsed window's title
      // bar activates it, it does not roll the shade back up.
      if (!target || target.z === state.z) return state;
      const z = state.z + 1;
      return {
        ...state,
        z,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, z } : w)),
      };
    }
    /** Window shade, toggling. Collapsing also brings the window forward. */
    case 'collapse': {
      const z = state.z + 1;
      return {
        ...state,
        z,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, collapsed: !w.collapsed, z } : w,
        ),
      };
    }
    case 'zoom': {
      const z = state.z + 1;
      return {
        ...state,
        z,
        windows: state.windows.map((w) =>
          // A zoomed window with the shade down would be a large empty title bar,
          // so zoom implies un-collapse.
          w.id === action.id ? { ...w, zoomed: !w.zoomed, collapsed: false, z } : w,
        ),
      };
    }
    /** Application-menu pick: un-collapse and bring to front, never toggle off. */
    case 'select': {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target) return state;
      const z = state.z + 1;
      return {
        ...state,
        z,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, z, collapsed: false } : w)),
      };
    }
    case 'move':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, x: action.x, y: action.y } : w,
        ),
      };
    case 'resize':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, w: action.w, h: action.h } : w,
        ),
      };
    default:
      return state;
  }
}

export type WindowApi = {
  windows: WindowState[];
  activeId: string | null;
  open: (req: OpenRequest) => void;
  close: (id: string) => void;
  closeAll: () => void;
  focus: (id: string) => void;
  /** Window shade, toggling. */
  collapse: (id: string) => void;
  /** Zoom box, toggling. */
  zoom: (id: string) => void;
  /** Application-menu pick: un-collapse and bring to front. */
  select: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  resize: (id: string, w: number, h: number) => void;
};

export function useWindowManager(): WindowApi {
  const [state, dispatch] = useReducer(reducer, initialState);

  const open = useCallback((req: OpenRequest) => {
    // Read the viewport at dispatch time rather than storing it: the reducer must
    // stay a pure function of state + action so it can be reasoned about, and the
    // SSR fallback numbers keep it safe to call before hydration.
    const bounds = {
      w: typeof window === 'undefined' ? 1024 : window.innerWidth,
      h: typeof window === 'undefined' ? 700 : window.innerHeight,
    };
    dispatch({ type: 'open', req, bounds });
  }, []);

  /**
   * Frontmost window, by z. Unlike the Y2K manager this does not skip anything:
   * a collapsed window is still on the desk and can still be the active window,
   * which is why its title bar keeps the pinstripes when you roll the shade down.
   */
  const activeId = useMemo(() => {
    let best: WindowState | null = null;
    for (const w of state.windows) {
      if (!best || w.z > best.z) best = w;
    }
    return best?.id ?? null;
  }, [state.windows]);

  return {
    windows: state.windows,
    activeId,
    open,
    close: useCallback((id: string) => dispatch({ type: 'close', id }), []),
    closeAll: useCallback(() => dispatch({ type: 'closeAll' }), []),
    focus: useCallback((id: string) => dispatch({ type: 'focus', id }), []),
    collapse: useCallback((id: string) => dispatch({ type: 'collapse', id }), []),
    zoom: useCallback((id: string) => dispatch({ type: 'zoom', id }), []),
    select: useCallback((id: string) => dispatch({ type: 'select', id }), []),
    move: useCallback(
      (id: string, x: number, y: number) => dispatch({ type: 'move', id, x, y }),
      [],
    ),
    resize: useCallback(
      (id: string, w: number, h: number) => dispatch({ type: 'resize', id, w, h }),
      [],
    ),
  };
}

/**
 * Deep link → windows (G7).
 *
 * The four themes share one set of URLs, so /experience has to *open the Work
 * History window* rather than drop the visitor on a bare desktop wondering what
 * happened to the page they clicked. /projects/:slug opens the Finder folder with
 * that project's Get Info window on top, which is what the equivalent paper page
 * shows.
 *
 * /resume is the newest of them and the only one that reads its path from config
 * rather than typing it out. RESUME.page is the single source of truth for that URL
 * — the paper page that renders the embed, the paper nav link and this line all key
 * off the same string, so none of them can drift into pointing somewhere the others
 * do not. The other routes above stay literal because their paper pages are
 * permanent fixtures; this one exists only because a file might.
 *
 * No availability check here on purpose — and not because the route is conditional,
 * because it is not. /resume renders in both states (src/pages/resume.astro says so
 * at the top of the file: the paper nav only links there when the PDF exists, but
 * the page itself always answers). A bookmark, a deep link, or a visitor who
 * switched themes mid-visit can therefore land on this path with no file on the
 * server. Gating this branch would answer that arrival by opening the Read Me
 * instead, which reads as a broken link; the Résumé window's own copy is what says
 * honestly that there is nothing to hand over (§18.5). The y2k manager documents
 * the same non-gate for the same reason — G9 means these two comments are the only
 * thing keeping the two trees agreeing about one shared URL, so change both.
 */
export function windowsForRoute(route: string): OpenRequest[] {
  const path = route.replace(/\/+$/, '') || '/';
  if (path === '/experience') return [{ kind: 'work' }];
  if (path === '/projects') return [{ kind: 'projects' }];
  if (path === '/about') return [{ kind: 'about' }];
  if (path === '/contact') return [{ kind: 'mail' }];
  if (path === RESUME.page) return [{ kind: 'resume' }];
  const project = /^\/projects\/([\w-]+)$/.exec(path);
  if (project?.[1]) return [{ kind: 'projects' }, { kind: 'project', arg: project[1] }];
  return [{ kind: 'readme' }];
}
