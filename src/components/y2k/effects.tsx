/**
 * Starfield screensaver, and the sparkle cursor trail.
 *
 * The trail is motion-only decoration, so its callers skip rendering it entirely
 * under prefers-reduced-motion rather than rendering it frozen. The screensaver
 * cannot take that way out on the handheld, where it is a Start menu item rather
 * than an idle timer, so it draws a still field instead — see below.
 *
 * The trail is JS-tracked because CSS caps cursor images at about 32px and a
 * cursor image cannot leave a wake behind it. Every sparkle is a fixed-position
 * node moved with `transform` only, so nothing here triggers layout.
 */
import { useEffect, useRef } from 'react';

type Star = { x: number; y: number; z: number };

export const Screensaver = ({ onWake }: { onWake: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    /*
     * The desktop only ever reaches this component from an idle timer that is
     * switched off under reduced motion. DYLAN CE reaches it from Start → Suspend,
     * which a visitor who asked for less movement can press deliberately — and the
     * honest answer to that press is a dark screen with a still field on it, not a
     * flying one and not nothing at all.
     */
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const stars: Star[] = Array.from({ length: 220 }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random(),
    }));

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      // Resizing a canvas clears it, and a still field has no next frame to redraw it.
      if (still) draw();
    };

    let frame = 0;
    const draw = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      for (const star of stars) {
        if (!still) {
          star.z -= 0.006;
          if (star.z <= 0.02) {
            star.x = Math.random() * 2 - 1;
            star.y = Math.random() * 2 - 1;
            star.z = 1;
          }
        }
        const k = 0.55 / star.z;
        const sx = cx + star.x * k * cx;
        const sy = cy + star.y * k * cy;
        if (sx < 0 || sx > width || sy < 0 || sy > height) continue;
        const size = Math.max(0.6, (1 - star.z) * 3.2);
        const shade = Math.floor(140 + (1 - star.z) * 115);
        ctx.fillStyle = `rgb(${shade},${shade},${Math.min(255, shade + 20)})`;
        ctx.fillRect(sx, sy, size, size);
      }
      if (!still) frame = window.requestAnimationFrame(draw);
    };

    window.addEventListener('resize', onResize);
    draw();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      className="y2k-screensaver"
      role="button"
      tabIndex={0}
      /* Both shells render this, and only one of them has a desktop or a mouse. */
      aria-label="Screensaver — press any key, click or tap to wake the screen"
      onPointerDown={onWake}
      onKeyDown={onWake}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

const SPARKLE_COLOURS = ['#ff00a0', '#b6ff00', '#00f0ff', '#ffff00', '#ffffff'];

export const SparkleTrail = () => {
  useEffect(() => {
    let last = 0;
    let hue = 0;

    const onMove = (event: PointerEvent) => {
      const now = performance.now();
      if (now - last < 42) return;
      last = now;

      const node = document.createElement('span');
      node.className = 'y2k-sparkle';
      node.setAttribute('data-decorative', '');
      const colour = SPARKLE_COLOURS[hue++ % SPARKLE_COLOURS.length] ?? '#fff';
      node.style.background = 'transparent';
      node.style.boxShadow = `0 0 6px 2px ${colour}`;
      node.style.borderRadius = '50%';
      node.style.transform = `translate3d(${event.clientX - 4}px, ${event.clientY - 4}px, 0) scale(1)`;
      document.body.appendChild(node);

      const drift = (Math.random() - 0.5) * 26;
      const animation = node.animate(
        [
          { transform: node.style.transform, opacity: 1 },
          {
            transform: `translate3d(${event.clientX - 4 + drift}px, ${event.clientY + 22}px, 0) scale(0.2)`,
            opacity: 0,
          },
        ],
        { duration: 620, easing: 'ease-out' },
      );
      animation.onfinish = () => node.remove();
      animation.oncancel = () => node.remove();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      for (const node of document.querySelectorAll('.y2k-sparkle')) node.remove();
    };
  }, []);

  return null;
};
