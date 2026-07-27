/**
 * MotionMedia — poster-first animated media.
 *
 * Why this exists: the three project GIFs carried over from the old portfolio
 * were 3.4 MB / 692 KB / 428 KB. Converted to animated WebP they are ~1 MB /
 * 432 KB / 170 KB, which is better but still far too much to put on first paint,
 * and frame-count reduction was not possible with the available tooling (see the
 * comment in scripts/optimize-assets.sh). So the size is handled here instead:
 * only the poster still (7–24 KB) ever loads automatically, and the animation is
 * fetched on explicit intent. Three project cards therefore cost ~44 KB, not
 * ~1.6 MB, which is what G13 needs on a phone.
 *
 * This is a shared *utility*, not shared presentation. G9 keeps the three themes
 * structurally independent, and they are: paper frames this as a taped-in
 * Polaroid, Y2K as a window's client area, chat as a card. They wrap it; they do
 * not share a layout through it. What is shared is network behaviour, which
 * should not be reimplemented three times and get it wrong twice.
 *
 * Reduced motion (G17): the animation never starts on its own, and the control
 * is still available — a preference against motion is not a reason to withhold
 * the content, only a reason not to move it unasked.
 */
import { useEffect, useRef, useState } from 'react';

export type MotionMediaProps = {
  animated: string;
  poster: string;
  alt: string;
  width: number;
  height: number;
  /** Class applied to the wrapper, so each theme can frame it. */
  className?: string;
  /** Overrides the default control label, e.g. "Play demo". */
  playLabel?: string;
  /** Renders the control in the theme's own idiom. */
  renderControl?: (state: { playing: boolean; loading: boolean }) => React.ReactNode;
};

const MotionMedia = ({
  animated,
  poster,
  alt,
  width,
  height,
  className,
  playLabel = 'Play',
  renderControl,
}: MotionMediaProps) => {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const preloaded = useRef(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const onChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      if (e.matches) setPlaying(false);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  /**
   * Warms the animation on pointer-over so a click feels instant, without
   * spending the bytes for someone who never gestures at it. Skipped entirely on
   * a slow or metered connection, and when the visitor asked for less motion.
   */
  const preload = () => {
    if (preloaded.current || reducedMotion) return;
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (connection?.saveData) return;
    if (connection?.effectiveType && /2g/.test(connection.effectiveType)) return;
    preloaded.current = true;
    const img = new Image();
    img.src = animated;
  };

  const toggle = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    setLoading(!preloaded.current);
    setPlaying(true);
  };

  return (
    <div className={className} data-motion-media data-playing={playing || undefined}>
      <img
        src={playing ? animated : poster}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoading(false)}
        draggable={false}
      />
      <button
        type="button"
        onClick={toggle}
        onPointerEnter={preload}
        onFocus={preload}
        aria-pressed={playing}
        data-motion-control
      >
        {renderControl ? (
          renderControl({ playing, loading })
        ) : (
          <span>{playing ? 'Stop' : loading ? 'Loading…' : playLabel}</span>
        )}
        <span className="sr-only">
          {playing ? `Stop the ${alt} animation` : `Play the ${alt} animation`}
        </span>
      </button>
    </div>
  );
};

export default MotionMedia;
