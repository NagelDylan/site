/**
 * The window manager: per-window geometry, focus and z-order,
 * minimise/restore/maximise/close, pointer drag and resize.
 *
 * Two performance decisions worth knowing about:
 *   1. Committed geometry lives in this reducer, but a drag in progress never
 *      touches React. Y2kWindow writes `transform: translate()` straight to the
 *      node on pointermove and dispatches MOVE once on pointerup; re-rendering a
 *      window body at pointermove rate is visibly laggy on a laptop.
 *   2. z-order is a plain counter rather than an array reorder, so focusing a
 *      window re-renders one window rather than resorting the desktop.
 */
import { useCallback, useMemo, useReducer } from 'react';
import type { IconName } from './Icon';

export type WindowKind =
  | 'welcome'
  | 'experience'
  | 'projects'
  | 'project'
  | 'about'
  | 'skills'
  | 'education'
  | 'contact'
  | 'guestbook'
  | 'recycle'
  | 'winamp'
  | 'resume'
  | 'help';

/**
 * The résumé, resolved at build time and handed down as a prop.
 *
 * Declared here because four surfaces need it (the Acrobat window, Welcome.htm,
 * DYLAN CE's Today screen and its Start menu) and hand-copying the fields is how
 * one of them ends up reading `undefined` into an <object data>. `viewHref`
 * carries the PDF open parameters; `href` stays clean for the download. Every
 * surface gates on `available` so nothing links to a PDF that 404s.
 */
export type Resume = {
  available: boolean;
  href: string;
  viewHref: string;
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
  minimized: boolean;
  maximized: boolean;
  resizable: boolean;
};

type Def = {
  title: string;
  icon: IconName;
  w: number;
  h: number;
  resizable?: boolean;
};

/** Window titles are microcopy, so they may be loud. */
export const WINDOW_DEFS: Record<WindowKind, Def> = {
  welcome: { title: 'Welcome.htm — Netscape Navigator', icon: 'globe', w: 560, h: 420 },
  experience: { title: 'JOBS I HAVE HAD — WordPad', icon: 'briefcase', w: 620, h: 470 },
  projects: { title: 'Exploring — C:\\Projects\\', icon: 'folderOpen', w: 640, h: 440 },
  project: { title: 'Project', icon: 'file', w: 520, h: 470 },
  about: { title: 'ABOUT ME!! — Notepad', icon: 'person', w: 540, h: 440 },
  skills: { title: 'Control Panel — My Skillz', icon: 'gear', w: 500, h: 400 },
  education: { title: 'System Properties', icon: 'grad', w: 460, h: 400 },
  contact: { title: 'Dylan — Conversation', icon: 'mail', w: 460, h: 520 },
  guestbook: { title: 'guestbook.cgi — SIGN IT!!', icon: 'book', w: 480, h: 420 },
  recycle: { title: 'Recycle Bin', icon: 'trash', w: 440, h: 320 },
  /* Taller and resizable because it holds a twelve-track playlist editor
   * (content/WinampWindow.tsx), not a single generated track. */
  winamp: { title: 'WINAMP 2.9', icon: 'cd', w: 400, h: 440 },
  /*
   * Dressed as Acrobat 4.0 for the joke: a 1999 machine has no idea what a PDF
   * is, so the window pretends to install a plug-in before it shows one
   * (content/ResumeWindow.tsx). Big and resizable unlike the other document
   * windows — a page of A4 at 400×240 is a grey smudge.
   */
  resume: { title: 'Résumé.pdf — Adobe Acrobat Reader 4.0', icon: 'floppy', w: 720, h: 560 },
  help: { title: 'Help — How this desktop works', icon: 'help', w: 460, h: 380 },
};

/**
 * The menu strip each window wears, per kind. Purely era dressing — none of these
 * menus drop down, which is why they are a list of labels and not a structure.
 * A kind that is missing here gets no strip: Winamp, the Recycle Bin, the Acrobat
 * window and the control panels never had a File menu worth faking.
 *
 * Lives here rather than in App.tsx because DYLAN CE renders the same labels in
 * its command-bar Menu popup, and two copies of this map would drift.
 */
export const WINDOW_MENUS: Partial<Record<WindowKind, string[]>> = {
  welcome: ['File', 'Edit', 'View', 'Go', 'Bookmarks'],
  experience: ['File', 'Edit', 'View', 'Insert', 'Help'],
  projects: ['File', 'Edit', 'View', 'Tools', 'Help'],
  about: ['File', 'Edit', 'Search', 'Help'],
  guestbook: ['File', 'Edit', 'View', 'Help'],
  project: ['File', 'Edit', 'View'],
};

export type OpenRequest = { kind: WindowKind; arg?: string | null; title?: string };

type Action =
  | { type: 'open'; req: OpenRequest; bounds: { w: number; h: number } }
  | { type: 'close'; id: string }
  | { type: 'focus'; id: string }
  | { type: 'minimize'; id: string }
  | { type: 'toggleTask'; id: string }
  | { type: 'maximize'; id: string }
  | { type: 'move'; id: string; x: number; y: number }
  | { type: 'resize'; id: string; w: number; h: number }
  | { type: 'closeAll' };

type State = { windows: WindowState[]; z: number; opened: number };

export const initialState: State = { windows: [], z: 10, opened: 0 };

const idFor = (req: OpenRequest) => (req.arg ? `${req.kind}:${req.arg}` : req.kind);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'open': {
      const id = idFor(action.req);
      const existing = state.windows.find((w) => w.id === id);
      const z = state.z + 1;
      if (existing) {
        return {
          ...state,
          z,
          windows: state.windows.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)),
        };
      }
      const def = WINDOW_DEFS[action.req.kind];
      const w = Math.min(def.w, Math.max(260, action.bounds.w - 40));
      const h = Math.min(def.h, Math.max(200, action.bounds.h - 60));
      // Cascade, wrapping before it walks off the desktop. The origin clears the
      // icon columns on the left and the banner along the top.
      const step = (state.opened % 6) * 26;
      const x = Math.max(8, Math.min(action.bounds.w - w - 8, 196 + step));
      const y = Math.max(8, Math.min(action.bounds.h - h - 40, 152 + step));
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
            minimized: false,
            maximized: false,
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
      if (!target || (target.z === state.z && !target.minimized)) return state;
      const z = state.z + 1;
      return {
        ...state,
        z,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, z, minimized: false } : w)),
      };
    }
    case 'minimize':
      return {
        ...state,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, minimized: true } : w)),
      };
    /** Taskbar click: minimise the focused window, restore-and-focus anything else. */
    case 'toggleTask': {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target) return state;
      if (!target.minimized && target.z === state.z) {
        return {
          ...state,
          windows: state.windows.map((w) => (w.id === action.id ? { ...w, minimized: true } : w)),
        };
      }
      const z = state.z + 1;
      return {
        ...state,
        z,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, z, minimized: false } : w)),
      };
    }
    case 'maximize': {
      const z = state.z + 1;
      return {
        ...state,
        z,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, maximized: !w.maximized, z, minimized: false } : w,
        ),
      };
    }
    case 'move':
      return {
        ...state,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, x: action.x, y: action.y } : w)),
      };
    case 'resize':
      return {
        ...state,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, w: action.w, h: action.h } : w)),
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
  minimize: (id: string) => void;
  toggleTask: (id: string) => void;
  maximize: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  resize: (id: string, w: number, h: number) => void;
};

export function useWindowManager(): WindowApi {
  const [state, dispatch] = useReducer(reducer, initialState);

  const open = useCallback((req: OpenRequest) => {
    const bounds = {
      w: typeof window === 'undefined' ? 1024 : window.innerWidth,
      h: typeof window === 'undefined' ? 700 : window.innerHeight,
    };
    dispatch({ type: 'open', req, bounds });
  }, []);

  const activeId = useMemo(() => {
    let best: WindowState | null = null;
    for (const w of state.windows) {
      if (w.minimized) continue;
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
    minimize: useCallback((id: string) => dispatch({ type: 'minimize', id }), []),
    toggleTask: useCallback((id: string) => dispatch({ type: 'toggleTask', id }), []),
    maximize: useCallback((id: string) => dispatch({ type: 'maximize', id }), []),
    move: useCallback((id: string, x: number, y: number) => dispatch({ type: 'move', id, x, y }), []),
    resize: useCallback((id: string, w: number, h: number) => dispatch({ type: 'resize', id, w, h }), []),
  };
}
