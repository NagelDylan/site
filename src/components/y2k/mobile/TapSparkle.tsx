/**
 * Tap sparkles: the cursor trail, translated to a finger.
 *
 * The desktop's SparkleTrail hangs off pointermove, which on a touch screen only
 * fires while a finger is already down and dragging — i.e. while scrolling. Ported
 * as-is it would garnish the act of scrolling past content and leave every actual
 * tap unmarked, which is backwards. So the handheld gets the other 1999 idiom: a
 * small burst at the point of contact, on pointerdown.
 *
 * The technique is SparkleTrail's, deliberately unchanged — one fixed-position
 * span per particle, moved with `transform` only, animated by the Web Animations
 * API and removed by its own onfinish/oncancel — so a burst never triggers layout
 * on a device that has no frames to spare.
 */
import { useEffect } from 'react';

const SPARKLE_COLOURS = ['#ff00a0', '#b6ff00', '#00f0ff', '#ffff00', '#ffffff'];

/** Enough to read as a burst, few enough to stay cheap on a 2002-era GPU budget. */
const PARTICLES = 7;

const TapSparkle = () => {
  useEffect(() => {
    /*
     * MobileApp already gates this component on useReducedMotion, so this is the
     * belt to that braces: checked here too, the way effects.tsx's callers do, so
     * the component is safe to mount unconditionally. The check is read once
     * because a mid-visit change to the setting unmounts us anyway.
     */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* Our own nodes, so unmount cleanup cannot reach into another effect's. */
    const live = new Set<HTMLSpanElement>();

    const onDown = (event: PointerEvent) => {
      for (let i = 0; i < PARTICLES; i += 1) {
        const node = document.createElement('span');
        node.className = 'y2k-sparkle y2k-ce-sparkle';
        node.setAttribute('data-decorative', '');
        const colour = SPARKLE_COLOURS[i % SPARKLE_COLOURS.length] ?? '#fff';
        node.style.background = 'transparent';
        node.style.boxShadow = `0 0 6px 2px ${colour}`;
        node.style.borderRadius = '50%';
        const from = `translate3d(${event.clientX - 4}px, ${event.clientY - 4}px, 0) scale(1)`;
        node.style.transform = from;
        document.body.appendChild(node);
        live.add(node);

        /* Radial throw with a little gravity, so the burst falls rather than hovers. */
        const angle = (i / PARTICLES) * Math.PI * 2 + Math.random() * 0.6;
        const reach = 22 + Math.random() * 16;
        const to = `translate3d(${event.clientX - 4 + Math.cos(angle) * reach}px, ${
          event.clientY - 4 + Math.sin(angle) * reach + 14
        }px, 0) scale(0.2)`;

        const animation = node.animate(
          [
            { transform: from, opacity: 1 },
            { transform: to, opacity: 0 },
          ],
          { duration: 520 + Math.random() * 180, easing: 'ease-out' },
        );
        const remove = () => {
          live.delete(node);
          node.remove();
        };
        animation.onfinish = remove;
        animation.oncancel = remove;
      }
    };

    window.addEventListener('pointerdown', onDown, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onDown);
      for (const node of live) node.remove();
      live.clear();
    };
  }, []);

  return null;
};

export default TapSparkle;
