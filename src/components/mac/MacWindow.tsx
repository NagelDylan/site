/**
 * Window chrome for the Classic Mac theme (spec §4.3): title bar, close box on the
 * left, zoom and collapse boxes on the right, drag, resize, window shade.
 *
 * WHAT IT READS: nothing from the fact layer. It renders a `WindowState` from
 * `wm.ts` and whatever content the caller passes as children, so no hard rule
 * about copy can be broken here — the one piece of text it owns is the window
 * title, which comes from `WINDOW_DEFS` (R5: asserts nothing).
 *
 * WHY THE CHROME LOOKS LIKE THIS: the close box on the *left* is the single most
 * recognisable difference between a Macintosh window and a Windows 98 one, so it
 * carries most of the theme's identity by itself. The active title bar is
 * pinstriped with the title sitting in a plaque that interrupts the stripes;
 * inactive windows are flat grey with no visible boxes at all. That is authentic
 * *and* it is a better focus cue than the Y2K theme's colour change.
 *
 * Dragging is transform-only and bypasses React entirely while the pointer is down
 * (see the note at the top of `wm.ts`): pointermove writes a translate to the
 * node, pointerup commits the new x/y once. Pointer capture means a fast drag that
 * outruns the cursor does not drop the window.
 *
 * Chrome is marked `data-chrome` so print.css can strip it (G15) — a printed page
 * should read as a document, not a screenshot of somebody's desk.
 */
import { useCallback, useEffect, useRef } from 'react';
import { MENU_BAR_HEIGHT, MIN_H, MIN_W, type WindowState } from './wm';

type Props = {
  win: WindowState;
  active: boolean;
  children: React.ReactNode;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onCollapse: (id: string) => void;
  onZoom: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, w: number, h: number) => void;
  /** Optional Finder-style status strip along the bottom. */
  status?: React.ReactNode[];
};

/** Keep the Control Strip's lane clear when a drag ends near the bottom edge. */
const STRIP_LANE = 28;

const MacWindow = ({
  win,
  active,
  children,
  onClose,
  onFocus,
  onCollapse,
  onZoom,
  onMove,
  onResize,
  status,
}: Props) => {
  const ref = useRef<HTMLElement | null>(null);
  const drag = useRef<{ id: number; startX: number; startY: number; mode: 'move' | 'size' } | null>(
    null,
  );

  // Keep the window on-screen when the viewport shrinks under it. The top clamp is
  // the menu bar rather than 0: the menu bar is fixed and always on top, so a
  // window parked under it would have an unreachable title bar.
  useEffect(() => {
    const onWindowResize = () => {
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - STRIP_LANE - 30;
      if (win.x > maxX || win.y > maxY) {
        onMove(
          win.id,
          Math.min(win.x, Math.max(8, maxX)),
          Math.min(win.y, Math.max(MENU_BAR_HEIGHT + 2, maxY)),
        );
      }
    };
    window.addEventListener('resize', onWindowResize);
    return () => window.removeEventListener('resize', onWindowResize);
  }, [win.id, win.x, win.y, onMove]);

  const beginDrag = useCallback(
    (event: React.PointerEvent, mode: 'move' | 'size') => {
      if (event.button !== 0 || win.zoomed) return;
      /**
       * Never start a drag from a control inside the title bar.
       *
       * This handler sits on the whole header, and beginDrag calls
       * setPointerCapture on it. Capture retargets every later pointer event —
       * including pointerup — to the header, so a button under the cursor never
       * receives its pointerup and therefore never fires a click. In the Y2K tree
       * that made minimise/maximise/close dead: the only way to reach them was to
       * maximise first (via double-click), because beginDrag bails early when
       * maximised and so never captured.
       *
       * It is worse here, because the close box is 11 pixels square and sits *on*
       * the drag surface: without this bail the close, zoom and collapse boxes are
       * all silently non-functional and it looks like a CSS problem. Do not remove
       * it.
       *
       * Move-drags only: the grow box IS a button and must still start a drag.
       */
      if ((event.target as HTMLElement).closest('button') && mode === 'move') return;
      const node = ref.current;
      if (!node) return;
      onFocus(win.id);
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, mode };
      node.dataset.dragging = 'true';
      event.preventDefault();
    },
    [onFocus, win.id, win.zoomed],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      const state = drag.current;
      const node = ref.current;
      if (!state || !node || state.id !== event.pointerId) return;
      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;
      if (state.mode === 'move') {
        node.style.transform = `translate(${dx}px, ${dy}px)`;
      } else {
        node.style.width = `${Math.max(MIN_W, win.w + dx)}px`;
        node.style.height = `${Math.max(MIN_H, win.h + dy)}px`;
      }
    },
    [win.w, win.h],
  );

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
        const maxY = window.innerHeight - STRIP_LANE - 24;
        onMove(
          win.id,
          Math.min(Math.max(-win.w + 90, win.x + dx), maxX),
          // Never above the menu bar: its title bar has to stay grabbable.
          Math.min(Math.max(MENU_BAR_HEIGHT + 2, win.y + dy), maxY),
        );
      } else {
        node.style.width = '';
        node.style.height = '';
        onResize(win.id, Math.max(MIN_W, win.w + dx), Math.max(MIN_H, win.h + dy));
      }
    },
    [onMove, onResize, win.id, win.w, win.h, win.x, win.y],
  );

  /** Keyboard nudge, so a window is movable without a pointer (G12). */
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
    onMove(
      win.id,
      Math.max(0, win.x + delta[0]),
      Math.max(MENU_BAR_HEIGHT + 2, win.y + delta[1]),
    );
  };

  /**
   * The three title-bar boxes stay mounted when the window is inactive so the tab
   * order does not shift under someone's fingers every time focus moves between
   * windows; they are hidden from assistive tech and taken out of the tab sequence
   * instead, and CSS makes them invisible and non-interactive.
   *
   * The handlers also bail on !active. That is belt-and-braces on purpose: if the
   * `pointer-events: none` rule for inactive windows ever goes missing, a click on
   * empty grey title bar must not silently close a window.
   */
  const boxProps = (label: string, balloon: string) => ({
    type: 'button' as const,
    className: 'mac-box',
    tabIndex: active ? 0 : -1,
    'aria-hidden': active ? undefined : true,
    'aria-label': label,
    'data-balloon': balloon,
  });

  return (
    <section
      ref={ref}
      className="mac-window"
      role="dialog"
      aria-label={win.title}
      data-active={active}
      data-zoomed={win.zoomed || undefined}
      data-collapsed={win.collapsed || undefined}
      style={{
        left: win.x,
        top: win.y,
        width: win.w,
        // Collapsed windows are the title bar and nothing else, so the frame has
        // to shrink to it rather than keep a body-sized box of empty grey.
        height: win.collapsed ? 'auto' : win.h,
        zIndex: win.z,
      }}
      onPointerDownCapture={() => onFocus(win.id)}
    >
      <header
        className="mac-titlebar"
        data-chrome
        data-balloon="Drag this bar to move the window. Double-click it to roll the window up like a shade."
        onPointerDown={(e) => beginDrag(e, 'move')}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        // Double-clicking a Mac title bar rolls the shade, where double-clicking a
        // Windows one maximises. Small difference, and it is the right one.
        onDoubleClick={() => onCollapse(win.id)}
      >
        <button
          {...boxProps(
            `Close ${win.title}`,
            'Click here to close this window. Nothing is saved, because nothing here can be edited.',
          )}
          data-box="close"
          onClick={() => {
            if (!active) return;
            onClose(win.id);
          }}
        />

        <span className="mac-titlebar-fill" aria-hidden="true" data-decorative />

        <span className="mac-titlebar-plaque">
          <span
            className="mac-titlebar-text"
            tabIndex={0}
            role="button"
            aria-label={`${win.title} — move this window with the arrow keys`}
            data-balloon="This is the window title. With it selected, the arrow keys move the window."
            onKeyDown={onTitleKeyDown}
          >
            {win.title}
          </span>
        </span>

        <span className="mac-titlebar-fill" aria-hidden="true" data-decorative />

        <span className="mac-titlebar-controls">
          {win.resizable ? (
            <button
              {...boxProps(
                `${win.zoomed ? 'Return' : 'Zoom'} ${win.title}`,
                'The zoom box grows the window to fill the desk, and puts it back again.',
              )}
              data-box="zoom"
              aria-pressed={win.zoomed}
              onClick={() => {
                if (!active) return;
                onZoom(win.id);
              }}
            />
          ) : null}
          <button
            {...boxProps(
              `${win.collapsed ? 'Expand' : 'Collapse'} ${win.title}`,
              'The collapse box rolls the window up into its title bar. Nothing closes, and nothing is lost.',
            )}
            data-box="collapse"
            aria-pressed={win.collapsed}
            onClick={() => {
              if (!active) return;
              onCollapse(win.id);
            }}
          />
        </span>
      </header>

      {/*
        Collapsed content stays mounted: rolling the shade down and back up must not
        reset a Scrapbook page or a half-typed message. `hidden` takes it out of the
        accessibility tree; the inline display mirrors what the Y2K tree does for a
        minimised window and means a stray `.mac-window-body { display: flex }` rule
        cannot resurrect it.
      */}
      <div
        className="mac-window-body"
        hidden={win.collapsed}
        style={{ display: win.collapsed ? 'none' : undefined }}
      >
        {children}

        {status ? (
          <div className="mac-statusbar" data-chrome>
            {status.map((cell, i) => (
              <div className="mac-status-cell" key={i}>
                {cell}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {win.resizable && !win.zoomed && !win.collapsed ? (
        <button
          type="button"
          className="mac-grow"
          data-chrome
          aria-label={`Resize ${win.title}`}
          data-balloon="Drag the grow box to change the size of this window."
          onPointerDown={(e) => beginDrag(e, 'size')}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
      ) : null}
    </section>
  );
};

export default MacWindow;
