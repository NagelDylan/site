/**
 * Poster-first animated media.
 *
 * The project animations are ~1 MB / 432 KB / 170 KB as animated WebP, far too
 * much for first paint, and frame-count reduction was not possible with the
 * available tooling (see scripts/optimize-assets.sh). So only the poster still
 * (7–24 KB) loads automatically and the animation is fetched on explicit intent:
 * three cards cost ~44 KB instead of ~1.6 MB.
 *
 * Under reduced motion the animation never starts on its own, but the control
 * stays available — the preference is a reason not to move things unasked, not a
 * reason to withhold the content.
 */
import { useEffect, useRef, useState } from 'react';

export type MotionMediaProps = {
  animated: string;
  poster: string;
  alt: string;
  width: number;
  height: number;
  /** Class applied to the wrapper. */
  className?: string;
  /** Overrides the default control label, e.g. "Play demo". */
  playLabel?: string;
  /** Renders the control in the caller's own idiom. */
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
   * spending the bytes for someone who never gestures at it. Skipped on a slow or
   * metered connection, and under reduced motion.
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
