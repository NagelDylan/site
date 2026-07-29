/**
 * Motion decoration: the flying-toaster screensaver, zoom rects, and Balloon Help.
 *
 * The Mac counterpart to y2k/effects.tsx (spec §4.9). Same three jobs, none of
 * the same behaviour — Windows 98 got a starfield and a sparkle cursor, so this
 * tree gets the two things a Mac of the same year is actually remembered for.
 *
 * ─── REDUCED MOTION (G17) ────────────────────────────────────────────────────
 * The screensaver and the zoom rects are motion-only, so App.tsx does not render
 * them at all under prefers-reduced-motion. Not frozen, not slowed: absent. That
 * is deliberate — a frozen screensaver is a black rectangle over the site, which
 * is worse than no screensaver. `zoomFrom` is safe to call regardless: with no
 * `ZoomRects` mounted the event has no listener and nothing happens.
 *
 * ─── BALLOON HELP IS A GAG, NOT AN ACCESSIBILITY MECHANISM ───────────────────
 * `BalloonLayer` is `aria-hidden` and `data-decorative`, and it must stay that
 * way. Every `data-balloon` string in this tree paraphrases a control whose real
 * accessible name is already on the control itself, so the balloon adds nothing
 * for a screen reader and would only make it read everything twice. It is a
 * visual joke about 1997 documentation. If a control needs a balloon in order to
 * be understandable, the control is wrong — fix the control.
 *
 * Nothing in this file reads the fact layer. Every sprite is drawn from
 * rectangles by hand: no image assets (assets-src/ is frozen), and no logos or
 * trademarked silhouettes anywhere near it.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/* ══════════════════════════════════════════════════════════════════════════════
   SCREENSAVER — flying toasters
   ══════════════════════════════════════════════════════════════════════════════ */

/** Enough to read as a flock, few enough that a per-frame depth sort is free. */
const SPRITE_COUNT = 14;
/** Frames a wing holds before it swaps. Eight is the era's cadence: slow and silly. */
const WING_FRAMES = 8;

type Sprite = {
  kind: 'toaster' | 'toast';
  /** Top-left of the sprite, in CSS pixels. */
  x: number;
  y: number;
  /** 0.6…1.4. Drives pixel size AND drift speed — this is the parallax. */
  depth: number;
  /** Per-sprite flap offset, so the flock does not beat in lockstep. */
  phase: number;
};

/**
 * One chunky "pixel" for a sprite at this depth. Rounded and floored at 2 so a
 * distant toaster stays a crisp grid of squares instead of turning into mush.
 */
const unitFor = (depth: number) => Math.max(2, Math.round(depth * 3));

const drawWing = (
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  u: number,
  up: boolean,
  colour: string,
) => {
  // Three stepped feathers, each drawn as a black block with a lighter block
  // inside it — that inset is what gives the 1-bit outline the era relies on.
  for (let i = 0; i < 3; i += 1) {
    const w = 4 - i;
    const dx = i * 3;
    const dy = up ? -(i + 1) * 2 : (i + 1) * 2;
    ctx.fillStyle = '#000';
    ctx.fillRect(ox + (dx - 1) * u, oy + (dy - 1) * u, (w + 2) * u, 4 * u);
    ctx.fillStyle = colour;
    ctx.fillRect(ox + dx * u, oy + dy * u, w * u, 2 * u);
  }
};

const drawToaster = (
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  u: number,
  up: boolean,
) => {
  const px = (x: number, y: number, w: number, h: number, colour: string) => {
    ctx.fillStyle = colour;
    ctx.fillRect(sx + x * u, sy + y * u, w * u, h * u);
  };
  const bw = 12;
  const bh = 8;

  /*
   * Two wings, and they ALTERNATE rather than beating together: the far one is
   * drawn in the opposite position to the near one and shaded darker. Beating
   * them in unison reads as one wing seen edge-on; alternating them reads as two.
   */
  drawWing(ctx, sx + (bw + 3) * u, sy + 3 * u, u, !up, '#a8a8a8');

  // Toast poking out of the slot.
  px(4, -3, 5, 3, '#000');
  px(5, -2, 3, 2, '#e8a94e');

  // Body: black silhouette, silver face, bevel top and bottom.
  px(0, 0, bw + 2, bh + 2, '#000');
  px(1, 1, bw, bh, '#c8c8c8');
  px(1, 1, bw, 1, '#f2f2f2');
  px(1, bh, bw, 1, '#8a8a8a');
  // Slot line, front panel, and the lever on the trailing edge.
  px(3, 1, 7, 1, '#3a3a3a');
  px(3, 4, 7, 3, '#b0b0b0');
  px(3, 6, 7, 1, '#eeeeee');
  px(bw + 2, 3, 2, 2, '#000');
  px(bw + 2, 3, 2, 1, '#9a9a9a');

  drawWing(ctx, sx + (bw + 2) * u, sy + 2 * u, u, up, '#ffffff');
};

const drawToast = (ctx: CanvasRenderingContext2D, sx: number, sy: number, u: number) => {
  const px = (x: number, y: number, w: number, h: number, colour: string) => {
    ctx.fillStyle = colour;
    ctx.fillRect(sx + x * u, sy + y * u, w * u, h * u);
  };
  px(1, 0, 6, 1, '#000');
  px(0, 1, 8, 6, '#000');
  px(1, 2, 6, 4, '#d69a4a');
  px(2, 1, 4, 1, '#b8823a');
  px(2, 3, 1, 1, '#a06f2e');
  px(4, 4, 1, 1, '#a06f2e');
};

export const Screensaver = ({ onWake }: { onWake: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    /**
     * Everything enters from the top-right, because that is the direction the
     * flock flies. Half come over the top edge and half in from the right side,
     * which keeps the corner from looking like a spawn point.
     */
    const respawn = (sprite: Sprite) => {
      sprite.depth = 0.6 + Math.random() * 0.8;
      sprite.phase = Math.floor(Math.random() * WING_FRAMES * 2);
      if (Math.random() < 0.5) {
        sprite.x = width * 0.15 + Math.random() * width;
        sprite.y = -80;
      } else {
        sprite.x = width + 40;
        sprite.y = -80 + Math.random() * height * 0.85;
      }
    };

    const sprites: Sprite[] = Array.from({ length: SPRITE_COUNT }, (_, i) => ({
      // Roughly two toasters per slice of toast, which is the ratio that reads
      // as "toasters, with crumbs" rather than "a breakfast".
      kind: i % 3 === 2 ? 'toast' : 'toaster',
      // Seeded across the whole field so the first frame is already populated.
      x: Math.random() * (width + 200) - 100,
      y: Math.random() * (height + 200) - 100,
      depth: 0.6 + Math.random() * 0.8,
      phase: Math.floor(Math.random() * WING_FRAMES * 2),
    }));

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    let frame = 0;
    let tick = 0;
    const draw = () => {
      tick += 1;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // Far sprites first. Fourteen items, so sorting every frame costs less
      // than the bookkeeping it would take to avoid sorting every frame.
      sprites.sort((a, b) => a.depth - b.depth);

      for (const sprite of sprites) {
        const u = unitFor(sprite.depth);
        const speed = 0.55 + sprite.depth * 0.85;
        sprite.x -= speed * 1.6;
        sprite.y += speed;

        const span = 26 * u;
        // Off the left edge, or below the bottom. Both allow for the wings and
        // the toast, which stick out past the body's own box.
        if (sprite.x + span < 0 || sprite.y - 4 * u > height) {
          respawn(sprite);
          continue;
        }

        const up = Math.floor((tick + sprite.phase) / WING_FRAMES) % 2 === 0;
        if (sprite.kind === 'toaster') drawToaster(ctx, sprite.x, sprite.y, u, up);
        else drawToast(ctx, sprite.x, sprite.y, u);
      }

      frame = window.requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      className="mac-screensaver"
      role="button"
      tabIndex={0}
      aria-label="Screensaver — press any key or click to return to the desktop"
      data-chrome
      onPointerDown={onWake}
      onKeyDown={onWake}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   ZOOM RECTS — the Mac's answer to the sparkle trail
   ══════════════════════════════════════════════════════════════════════════════ */

const ZOOM_EVENT = 'mac:zoom';
/** ~180ms, per §4.9. Long enough to read as a flight, short enough to ignore. */
const ZOOM_MS = 180;

type ZoomDetail = { x: number; y: number; w: number; h: number };

/**
 * Fire-and-forget: ask for a zoom rect from `rect` to the middle of the desktop.
 *
 * Decoupled through a DOM event rather than a callback prop on purpose. The
 * callers are scattered — desktop icons, menu items — and threading a ref down to
 * every one of them to animate a rectangle nobody depends on would be a lot of
 * plumbing for a 180ms flourish. If `ZoomRects` is not mounted (reduced motion),
 * this is a no-op.
 */
export const zoomFrom = (rect: DOMRect): void => {
  window.dispatchEvent(
    new CustomEvent<ZoomDetail>(ZOOM_EVENT, {
      detail: { x: rect.left, y: rect.top, w: rect.width, h: rect.height },
    }),
  );
};

export const ZoomRects = () => {
  useEffect(() => {
    const onZoom = (event: Event) => {
      const detail = (event as CustomEvent<ZoomDetail>).detail;
      if (!detail || detail.w <= 0 || detail.h <= 0) return;

      const node = document.createElement('div');
      node.className = 'mac-zoomrect';
      node.setAttribute('data-decorative', '');
      // Per-instance geometry, so it belongs inline. Everything about how the
      // rectangle LOOKS — the 1px dotted edge, the colour, position: fixed,
      // transform-origin: 50% 50% — lives in mac/system.css.
      node.style.left = `${detail.x}px`;
      node.style.top = `${detail.y}px`;
      node.style.width = `${detail.w}px`;
      node.style.height = `${detail.h}px`;
      document.body.appendChild(node);

      const targetW = Math.min(520, window.innerWidth * 0.55);
      const targetH = Math.min(400, window.innerHeight * 0.55);
      const dx = window.innerWidth / 2 - (detail.x + detail.w / 2);
      const dy = window.innerHeight / 2 - (detail.y + detail.h / 2);

      /*
       * Transform and opacity only, so this never touches layout. The honest
       * trade-off: scaling an element scales its border too, so the dotted edge
       * thickens on the way out. That is exactly why the opacity falls away as it
       * grows — by the time the rectangle is big enough for the fat border to be
       * noticeable, it is almost gone.
       */
      const animation = node.animate(
        [
          { transform: 'translate3d(0, 0, 0) scale(1, 1)', opacity: 1 },
          {
            transform: `translate3d(${dx}px, ${dy}px, 0) scale(${targetW / detail.w}, ${targetH / detail.h})`,
            opacity: 0.15,
          },
        ],
        { duration: ZOOM_MS, easing: 'ease-out' },
      );
      animation.onfinish = () => node.remove();
      animation.oncancel = () => node.remove();
    };

    window.addEventListener(ZOOM_EVENT, onZoom);
    return () => {
      window.removeEventListener(ZOOM_EVENT, onZoom);
      // A rect mid-flight when the theme unmounts would otherwise outlive it.
      for (const stray of document.querySelectorAll('.mac-zoomrect')) stray.remove();
    };
  }, []);

  return null;
};

/* ══════════════════════════════════════════════════════════════════════════════
   BALLOON HELP
   ══════════════════════════════════════════════════════════════════════════════ */

/** Gap between the anchor and the balloon, and the viewport keep-out margin. */
const BALLOON_GAP = 10;
const BALLOON_MARGIN = 8;

type BalloonTarget = { text: string; rect: DOMRect };
type BalloonPos = { x: number; y: number; flip: string };

export const BalloonLayer = ({ active }: { active: boolean }) => {
  const [target, setTarget] = useState<BalloonTarget | null>(null);
  const [pos, setPos] = useState<BalloonPos>({ x: -9999, y: -9999, flip: '' });
  const nodeRef = useRef<HTMLDivElement | null>(null);
  /** The last element we resolved, so a stream of pointermoves is nearly free. */
  const lastHost = useRef<Element | null>(null);

  useEffect(() => {
    if (!active) {
      lastHost.current = null;
      setTarget(null);
      return;
    }

    const clear = () => {
      lastHost.current = null;
      setTarget(null);
    };

    const onMove = (event: PointerEvent) => {
      const from = event.target;
      const host = from instanceof Element ? from.closest('[data-balloon]') : null;
      // pointermove fires dozens of times per second; only the transitions
      // between annotated elements are interesting.
      if (host === lastHost.current) return;
      lastHost.current = host;
      const text = host?.getAttribute('data-balloon');
      setTarget(host && text ? { text, rect: host.getBoundingClientRect() } : null);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    // Clicking dismisses: the thing under the balloon is about to change.
    window.addEventListener('pointerdown', clear);
    /*
     * A balloon anchored to a rect measured before a scroll is a balloon in the
     * wrong place. Dismissing is both cheaper and less distracting than having
     * it chase the element, and the visitor only has to move the pointer to get
     * it back.
     */
    window.addEventListener('scroll', clear, true);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', clear);
      window.removeEventListener('scroll', clear, true);
    };
  }, [active]);

  /**
   * Measure-then-place, before paint. The balloon renders off-screen on its first
   * pass, this effect measures it and commits a position synchronously, so the
   * browser never paints the intermediate frame. Positioning is `transform` only
   * — no `left`/`top` churn, so hovering across a menu never triggers layout.
   */
  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node || !target) return;
    const { width: bw, height: bh } = node.getBoundingClientRect();
    const flip: string[] = [];

    let x = target.rect.left + 14;
    let y = target.rect.bottom + BALLOON_GAP;
    if (x + bw > window.innerWidth - BALLOON_MARGIN) {
      x = target.rect.right - 14 - bw;
      flip.push('x');
    }
    if (x < BALLOON_MARGIN) x = BALLOON_MARGIN;
    if (y + bh > window.innerHeight - BALLOON_MARGIN) {
      y = target.rect.top - BALLOON_GAP - bh;
      flip.push('y');
    }
    if (y < BALLOON_MARGIN) y = BALLOON_MARGIN;

    const next: BalloonPos = { x: Math.round(x), y: Math.round(y), flip: flip.join(' ') };
    setPos((prev) =>
      prev.x === next.x && prev.y === next.y && prev.flip === next.flip ? prev : next,
    );
  }, [target]);

  if (!active || !target) return null;

  return (
    <div
      ref={nodeRef}
      className="mac-balloon"
      data-decorative
      data-flip={pos.flip}
      aria-hidden="true"
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
    >
      <span className="mac-balloon-text">{target.text}</span>
      {/* The tail. CSS aims it using [data-flip~='x'] / [data-flip~='y']. */}
      <span className="mac-balloon-tail" />
    </div>
  );
};
