/**
 * Small environment hooks: viewport, motion preference, time, idleness.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

/** Live, not read-once: a visitor can flip the OS setting mid-visit. */
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
 * Narrow viewports get DYLAN CE, the handheld shell, instead of the window
 * manager, since dragging title bars with a thumb is miserable. Coarse pointers
 * count as narrow up to a larger width: a tablet in portrait has the pixels for
 * windows but not the input for them.
 *
 * null until the query has actually been measured, which callers have to
 * distinguish from false. The two shells hand their state to each other across a
 * resize (see App.tsx), and that handover must be able to tell a first
 * measurement from a real change of width — a phone's first paint is always the
 * wide branch, and reading that as a resize hands the handheld a window nobody
 * opened.
 */
export function useNarrow(breakpoint = 860): boolean | null {
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
  return narrow;
}

/** Taskbar clock. Ticks on the minute boundary rather than every second. */
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

function formatClock(date: Date): string {
  const hours = date.getHours() % 12 || 12;
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes} ${date.getHours() < 12 ? 'AM' : 'PM'}`;
}

/**
 * Fires when nobody has touched anything for `ms`. Passing enabled=false
 * disables it outright, which is how reduced motion switches the screensaver off
 * rather than merely making it still.
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
