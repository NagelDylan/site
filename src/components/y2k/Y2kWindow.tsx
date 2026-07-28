/**
 * Window chrome: title bar, minimise/maximise/close, drag, resize.
 *
 * Dragging is transform-only and bypasses React entirely while the pointer is
 * down (see the note at the top of wm.ts): pointermove writes a translate to the
 * node, pointerup commits the new x/y once. Pointer capture means a fast drag
 * that outruns the cursor does not drop the window.
 *
 * Chrome is marked data-chrome so print.css can strip it (G15) — a printed page
 * should read as a document, not a screenshot of a desktop.
 */
import { useCallback, useEffect, useRef } from 'react';
import Icon from './Icon';
import type { WindowState } from './wm';

type Props = {
  win: WindowState;
  active: boolean;
  children: React.ReactNode;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, w: number, h: number) => void;
  /** Rendered under the title bar, e.g. a File/Edit/View menu strip. */
  menu?: string[];
  /** Status bar cells along the bottom. */
  status?: React.ReactNode[];
};

const TASKBAR = 30;

const Y2kWindow = ({
  win,
  active,
  children,
  onClose,
  onFocus,
  onMinimize,
  onMaximize,
  onMove,
  onResize,
  menu,
  status,
}: Props) => {
  const ref = useRef<HTMLElement | null>(null);
  const drag = useRef<{ id: number; startX: number; startY: number; mode: 'move' | 'size' } | null>(null);

  // Keep the window on-screen when the viewport shrinks under it.
  useEffect(() => {
    const onWindowResize = () => {
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - TASKBAR - 30;
      if (win.x > maxX || win.y > maxY) {
        onMove(win.id, Math.min(win.x, Math.max(8, maxX)), Math.min(win.y, Math.max(8, maxY)));
      }
    };
    window.addEventListener('resize', onWindowResize);
    return () => window.removeEventListener('resize', onWindowResize);
  }, [win.id, win.x, win.y, onMove]);

  const beginDrag = useCallback(
    (event: React.PointerEvent, mode: 'move' | 'size') => {
      if (event.button !== 0 || win.maximized) return;
      const node = ref.current;
      if (!node) return;
      onFocus(win.id);
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, mode };
      node.dataset.dragging = 'true';
      event.preventDefault();
    },
    [onFocus, win.id, win.maximized],
  );

  const onPointerMove = useCallback((event: React.PointerEvent) => {
    const state = drag.current;
    const node = ref.current;
    if (!state || !node || state.id !== event.pointerId) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (state.mode === 'move') {
      node.style.transform = `translate(${dx}px, ${dy}px)`;
    } else {
      node.style.width = `${Math.max(240, win.w + dx)}px`;
      node.style.height = `${Math.max(150, win.h + dy)}px`;
    }
  }, [win.w, win.h]);

  const endDrag = useCallback(
    (event: React.PointerEvent) => {
      const state = drag.current;
      const node = ref.current;
      if (!state || !node || state.id !== event.pointerId) return;
      drag.current = null;
      delete node.dataset.dragging;
      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;
      if (state.mode === 'move') {
        node.style.transform = '';
        const maxX = window.innerWidth - 80;
        const maxY = window.innerHeight - TASKBAR - 24;
        onMove(
          win.id,
          Math.min(Math.max(-win.w + 90, win.x + dx), maxX),
          Math.min(Math.max(0, win.y + dy), maxY),
        );
      } else {
        node.style.width = '';
        node.style.height = '';
        onResize(win.id, Math.max(240, win.w + dx), Math.max(150, win.h + dy));
      }
    },
    [onMove, onResize, win.id, win.w, win.h, win.x, win.y],
  );

  /** Keyboard nudge, so a window is movable without a pointer. */
  const onTitleKeyDown = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 40 : 12;
    const map: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const delta = map[event.key];
    if (!delta) return;
    event.preventDefault();
    onMove(win.id, Math.max(0, win.x + delta[0]), Math.max(0, win.y + delta[1]));
  };

  return (
    <section
      ref={ref}
      className="y2k-window"
      role="dialog"
      aria-label={win.title}
      data-active={active}
      data-maximized={win.maximized || undefined}
      style={{
        left: win.x,
        top: win.y,
        width: win.w,
        height: win.h,
        zIndex: win.z,
        display: win.minimized ? 'none' : undefined,
      }}
      onPointerDownCapture={() => onFocus(win.id)}
    >
      <header
        className="y2k-titlebar"
        data-chrome
        onPointerDown={(e) => beginDrag(e, 'move')}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => onMaximize(win.id)}
      >
        <span className="y2k-titlebar-icon">
          <Icon name={win.icon} />
        </span>
        <span
          className="y2k-titlebar-text"
          tabIndex={0}
          role="button"
          aria-label={`${win.title} — move with the arrow keys`}
          onKeyDown={onTitleKeyDown}
        >
          {win.title}
        </span>
        <button type="button" className="y2k-tb-btn" onClick={() => onMinimize(win.id)} aria-label={`Minimize ${win.title}`}>
          _
        </button>
        <button
          type="button"
          className="y2k-tb-btn"
          onClick={() => onMaximize(win.id)}
          aria-label={`${win.maximized ? 'Restore' : 'Maximize'} ${win.title}`}
          aria-pressed={win.maximized}
        >
          ▢
        </button>
        <button type="button" className="y2k-tb-btn" onClick={() => onClose(win.id)} aria-label={`Close ${win.title}`}>
          ✕
        </button>
      </header>

      {menu ? (
        <div className="y2k-menubar" data-chrome aria-hidden="true">
          {menu.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      ) : null}

      {children}

      {status ? (
        <div className="y2k-statusbar" data-chrome>
          {status.map((cell, i) => (
            <div key={i}>{cell}</div>
          ))}
        </div>
      ) : null}

      {win.resizable && !win.maximized ? (
        <button
          type="button"
          className="y2k-resize"
          data-chrome
          aria-label={`Resize ${win.title}`}
          onPointerDown={(e) => beginDrag(e, 'size')}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
      ) : null}
    </section>
  );
};

export default Y2kWindow;
