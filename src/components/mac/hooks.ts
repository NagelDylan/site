/**
 * Small hooks shared across the Macintosh desktop.
 *
 * Kept in one file because each is a handful of lines and they are all about the
 * same thing: reacting to the environment (viewport, motion preference, time,
 * idleness, a menu that should close) rather than to the fact layer.
 *
 * These are behavioural twins of `y2k/hooks.ts` and are duplicated on purpose.
 * G9 keeps the theme trees structurally independent — one tree must never be able
 * to break another by editing a shared hook — and four small hooks is the
 * intended cost of that guarantee. Do not import across trees.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

/** G17. Live, not read-once: a visitor can flip the OS setting mid-visit. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * Narrow viewports get the simplified Mac document instead of the window manager:
 * dragging a title bar with a thumb is a bad joke told slowly, and the classic
 * Mac's close box is 11 pixels square, which is not a touch target.
 *
 * Coarse pointers count as narrow up to a larger width — a tablet in portrait has
 * the pixels for windows but not the input for them.
 */
export function useNarrow(breakpoint = 860): boolean {
  const [narrow, setNarrow] = useState<boolean | null>(null);
  useEffect(() => {
    const query = window.matchMedia(
      `(max-width: ${breakpoint - 1}px), (pointer: coarse) and (max-width: 1024px)`,
    );
    setNarrow(query.matches);
    const onChange = (e: MediaQueryListEvent) => setNarrow(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [breakpoint]);
  return narrow ?? false;
}

/**
 * The menu-bar clock, right-hand side.
 *
 * Reads `Mon 10:04 AM`: the classic Mac clock showed the weekday, which is the
 * detail that tells it apart from the Windows tray clock at a glance.
 *
 * Ticks on the minute boundary rather than every second — a once-per-second
 * setState on a component that renders the whole menu bar is pure waste, and the
 * display has no seconds field to justify it.
 */
export function useClock(): string {
  const [label, setLabel] = useState(() => formatClock(new Date()));
  useEffect(() => {
    let timer = 0;
    const tick = () => {
      const now = new Date();
      setLabel(formatClock(now));
      timer = window.setTimeout(tick, (60 - now.getSeconds()) * 1000 + 50);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, []);
  return label;
}

/**
 * Weekday names are a fixed table rather than `toLocaleDateString`, so the label
 * is the same width and the same era in every locale the site is read in. The
 * chrome is a period costume; it is not trying to be internationalised.
 */
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function formatClock(date: Date): string {
  const hours = date.getHours() % 12 || 12;
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${DAYS[date.getDay()]} ${hours}:${minutes} ${date.getHours() < 12 ? 'AM' : 'PM'}`;
}

/**
 * Fires when nobody has touched anything for `ms`. Disabled entirely when the
 * caller passes enabled=false, which is how reduced motion switches the
 * screensaver off rather than merely making it still.
 */
export function useIdle(ms: number, enabled: boolean): { idle: boolean; wake: () => void } {
  const [idle, setIdle] = useState(false);
  const timer = useRef(0);

  const wake = useCallback(() => setIdle(false), []);

  useEffect(() => {
    if (!enabled) {
      setIdle(false);
      return;
    }
    const reset = () => {
      setIdle(false);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setIdle(true), ms);
    };
    const events = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'] as const;
    for (const name of events) window.addEventListener(name, reset, { passive: true });
    reset();
    return () => {
      for (const name of events) window.removeEventListener(name, reset);
      window.clearTimeout(timer.current);
    };
  }, [ms, enabled]);

  return { idle, wake };
}

/**
 * Dismissal for an open menu: outside pointerdown, or Escape.
 *
 * Returns a ref to put on the element that counts as "inside". Pass `null` when
 * nothing is open — that is the switch that keeps the two document-level
 * listeners off the page for the 99% of the visit when no menu is showing, and it
 * also means the hook cannot fire a stale `onDismiss` from a previous render.
 *
 * `pointerdown` rather than `click`: a click that lands on a *different* menu
 * title has to be able to close this menu and open that one in one gesture, and
 * waiting for click ordering makes that flicker.
 */
export function useMenuDismiss<T extends HTMLElement>(
  onDismiss: (() => void) | null,
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!onDismiss) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onDismiss();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onDismiss]);

  return ref;
}
