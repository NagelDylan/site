/**
 * DYLAN CE's navigation: a stack, not a window manager.
 *
 * wm.ts exists because a desktop lets windows overlap, and overlap needs
 * geometry, z-order and drag. A Pocket PC has none of that: one program owns the
 * screen, Start switches between the ones already running, and the soft-key Back
 * walks the trail you came in on. So the model here is three fields — what is
 * running, what is on screen, and how you got there — and the affordances the
 * desktop needs (x/y/w/h, minimise, maximise, focus) simply do not exist.
 *
 * The distinction that earns the extra state: `home` leaves programs running
 * while `close` stops them, exactly as Pocket PC's X and its task list differed.
 * Without it, "Running Programs" in the Start menu would always be a list of one.
 */
import { useCallback, useMemo, useReducer } from 'react';
import type { IconName } from '../Icon';
import { WINDOW_DEFS, type WindowKind } from '../wm';

export type RunningApp = {
  /** `kind`, or `kind:arg` so each project is its own program. */
  id: string;
  kind: WindowKind;
  arg: string | null;
  /** Short enough for a 360px title bar — see MOBILE_TITLES. */
  title: string;
  icon: IconName;
};

export type Shell = {
  /** Insertion order, which is the order Start → Running Programs lists them. */
  running: RunningApp[];
  /** null means the Today screen. */
  current: RunningApp | null;
  canGoBack: boolean;
  open: (kind: WindowKind, arg?: string | null, title?: string) => void;
  /** Quit the program, not just leave it. */
  close: (id: string) => void;
  back: () => void;
  /** To Today, program keeps running. */
  home: () => void;
  switchTo: (id: string) => void;
  quitAll: () => void;
};

/**
 * The desktop's window titles are microcopy written for a 620px title bar
 * ("Résumé.pdf — Adobe Acrobat Reader 4.0"). On a handheld they truncate to
 * nonsense, so CE gets its own set: the filename-ish half, still loud where the
 * desktop is loud, and under about sixteen characters.
 */
export const MOBILE_TITLES: Record<WindowKind, string> = {
  /* Welcome.htm, not Today.htm: Today is the home screen the soft key goes to, and
     two things under that name is one thing too many. */
  welcome: 'Welcome.htm',
  experience: 'JOBS.DOC',
  projects: 'Projects',
  project: 'Project',
  about: 'ABOUT ME!!',
  skills: 'MY SKILLZ',
  education: 'SCHOOL',
  contact: 'Messenger',
  guestbook: 'guestbook.cgi',
  recycle: 'Recycle Bin',
  winamp: 'Winamp',
  resume: 'Résumé.pdf',
  help: 'Help',
};

/**
 * Every program except 'project', which has no launcher entry: individual
 * projects open from the explorer and from the Start menu, keyed by slug.
 *
 * Complete on purpose — 'resume' is here even though the PDF may not exist.
 * Callers filter on `resume.available` (MobileApp does), because this list has no
 * way to know and a build-time fact has no business being baked into a constant.
 *
 * Icons are read from WINDOW_DEFS so a program cannot wear one icon on the
 * desktop and a different one here.
 */
const PROGRAM_LABELS: { kind: WindowKind; label: string }[] = [
  { kind: 'welcome', label: 'Welcome.htm' },
  { kind: 'projects', label: 'C:\\Projects\\' },
  { kind: 'experience', label: 'JOBS I HAVE HAD' },
  { kind: 'about', label: 'ABOUT ME!!' },
  { kind: 'skills', label: 'MY SKILLZ' },
  { kind: 'education', label: 'SCHOOL' },
  { kind: 'contact', label: 'CONTACT ME' },
  { kind: 'guestbook', label: 'guestbook.cgi' },
  { kind: 'winamp', label: 'Winamp 2.9' },
  { kind: 'resume', label: 'Résumé.pdf' },
  { kind: 'recycle', label: 'Recycle Bin' },
  { kind: 'help', label: 'Help' },
];

export const PROGRAMS: { kind: WindowKind; label: string; icon: IconName }[] = PROGRAM_LABELS.map(
  (entry) => ({ ...entry, icon: WINDOW_DEFS[entry.kind].icon }),
);

type Action =
  | { type: 'open'; kind: WindowKind; arg: string | null; title?: string }
  | { type: 'close'; id: string }
  | { type: 'back' }
  | { type: 'home' }
  | { type: 'switchTo'; id: string }
  | { type: 'quitAll' };

type State = {
  running: RunningApp[];
  /** Ids of views left behind, oldest first. Today is the empty stack, not an entry. */
  history: string[];
  currentId: string | null;
};

const initialState: State = { running: [], history: [], currentId: null };

const idFor = (kind: WindowKind, arg: string | null) => (arg ? `${kind}:${arg}` : kind);

/** Pushing the view being left. Today (null) needs no entry: an empty stack is Today. */
const pushed = (history: string[], leaving: string | null) =>
  leaving === null ? history : [...history, leaving];

/**
 * The most recent history entry that is still running, with everything walked
 * past discarded. Entries go stale because `close` can retire a program that Back
 * would otherwise return to.
 */
function popToLive(history: string[], running: RunningApp[], skip: string | null) {
  const rest = [...history];
  while (rest.length) {
    const candidate = rest.pop();
    if (candidate === undefined) break;
    if (candidate === skip) continue;
    if (running.some((app) => app.id === candidate)) return { id: candidate, history: rest };
  }
  return { id: null, history: [] };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'open': {
      const id = idFor(action.kind, action.arg);
      // Reopening what is already on screen is not navigation, so it records nothing.
      if (state.currentId === id) return state;
      const already = state.running.some((app) => app.id === id);
      const running = already
        ? state.running
        : [
            ...state.running,
            {
              id,
              kind: action.kind,
              arg: action.arg,
              title: action.title ?? MOBILE_TITLES[action.kind],
              icon: WINDOW_DEFS[action.kind].icon,
            },
          ];
      return { running, history: pushed(state.history, state.currentId), currentId: id };
    }
    case 'switchTo': {
      if (state.currentId === action.id) return state;
      if (!state.running.some((app) => app.id === action.id)) return state;
      return { ...state, history: pushed(state.history, state.currentId), currentId: action.id };
    }
    case 'close': {
      const running = state.running.filter((app) => app.id !== action.id);
      const history = state.history.filter((id) => id !== action.id);
      if (state.currentId !== action.id) return { running, history, currentId: state.currentId };
      /*
       * Quitting drops you where you came from if that program is still running,
       * and on Today otherwise — never onto some unrelated program that happens to
       * be alive, which is the behaviour that makes a Back button feel random.
       */
      const previous = popToLive(history, running, null);
      return { running, history: previous.history, currentId: previous.id };
    }
    case 'back': {
      if (state.currentId === null) return state;
      const previous = popToLive(state.history, state.running, state.currentId);
      return { ...state, history: previous.history, currentId: previous.id };
    }
    /*
     * Today is the root of the trail, so arriving there empties it. Keeping the
     * trail would leave Back pointing into the program the visitor just left,
     * which is the one place they have said they do not want to be.
     */
    case 'home':
      return { ...state, history: [], currentId: null };
    case 'quitAll':
      return initialState;
    default:
      return state;
  }
}

export function useShell(): Shell {
  const [state, dispatch] = useReducer(reducer, initialState);

  const current = useMemo(
    () => state.running.find((app) => app.id === state.currentId) ?? null,
    [state.running, state.currentId],
  );

  return {
    running: state.running,
    current,
    /* From any program Back leads somewhere — the previous one, or Today. From
       Today it leads nowhere, and the soft key says so. */
    canGoBack: current !== null,
    open: useCallback(
      (kind: WindowKind, arg?: string | null, title?: string) =>
        dispatch({ type: 'open', kind, arg: arg ?? null, title }),
      [],
    ),
    close: useCallback((id: string) => dispatch({ type: 'close', id }), []),
    back: useCallback(() => dispatch({ type: 'back' }), []),
    home: useCallback(() => dispatch({ type: 'home' }), []),
    switchTo: useCallback((id: string) => dispatch({ type: 'switchTo', id }), []),
    quitAll: useCallback(() => dispatch({ type: 'quitAll' }), []),
  };
}
