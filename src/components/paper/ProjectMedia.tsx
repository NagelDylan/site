/**
 * A project GIF framed as a taped-in Polaroid (§9).
 *
 * Wraps the shared MotionMedia primitive, which is poster-first: the 1 MB
 * animated WebP is only fetched when the visitor asks for it. This component
 * supplies the paper framing and a control in the paper idiom; the network
 * behaviour lives in MotionMedia and is identical across all three themes.
 */
import MotionMedia from '../shared/MotionMedia';

type Props = {
  animated: string;
  poster: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

const ProjectMedia = ({ animated, poster, alt, width, height, caption }: Props) => (
  <div className="media-frame" data-print-block>
    <span className="tape tape--tl tape--butter" data-decorative aria-hidden="true" />
    <span className="tape tape--br tape--sky" data-decorative aria-hidden="true" />
    <MotionMedia
      animated={animated}
      poster={poster}
      alt={alt}
      width={width}
      height={height}
      playLabel="play ▸"
      renderControl={({ playing, loading }) => (
        <span aria-hidden="true">{playing ? '■ stop' : loading ? 'loading…' : 'play ▸'}</span>
      )}
    />
    {caption && (
      <p className="hand" style={{ margin: '0.5rem 0 0', fontSize: '1.15rem' }}>
        {caption}
      </p>
    )}
  </div>
);

export default ProjectMedia;
