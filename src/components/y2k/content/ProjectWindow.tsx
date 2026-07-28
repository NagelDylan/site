/**
 * A featured project's window.
 *
 * The blurb is the Y2K voice layer's (already written, §8 layer 2); every other
 * string — summary, dates, team, stack, highlights, links — is verbatim fact
 * layer.
 *
 * R2 IS LOAD-BEARING HERE. FlowSense's only permitted framing is
 * `project.framing` ("Built at Hack the 6ix 2024."), rendered as stored. There is
 * no award slot in this component, no trophy, no badge, no placement, and none
 * may be added: FlowSense placed nowhere, and two of Dylan's own public documents
 * are already wrong about this. Enthusiasm goes on the engineering.
 *
 * Media is poster-first through the shared MotionMedia utility — tanks.webp is
 * 1 MB and must never load unprompted — framed here as a window client area.
 */
import MotionMedia from '../../shared/MotionMedia';
import { projectBySlug } from '../../../data';
import { VOICES } from '../../../data/voice';
import { RainbowRule } from '../deco';

const blurbs = VOICES.y2k.projectBlurbs;

const ProjectWindow = ({ slug }: { slug: string }) => {
  const project = projectBySlug(slug);

  if (!project) {
    return (
      <div className="y2k-client">
        <h2>FILE NOT FOUND</h2>
        <p>
          C:\Projects\{slug} does not exist. Try C:\Projects\ — the folder is on the desktop
          and it really does open.
        </p>
      </div>
    );
  }

  const blurb = slug in blurbs ? blurbs[slug as keyof typeof blurbs] : null;

  return (
    <div className="y2k-client">
      <h2>{project.name.toUpperCase()}</h2>
      {blurb ? <p>{blurb}</p> : null}

      {project.media ? (
        <MotionMedia
          animated={project.media.animated}
          poster={project.media.poster}
          alt={project.media.alt}
          width={project.media.width}
          height={project.media.height}
          className="y2k-media"
          playLabel="▶ PLAY THE DEMO"
          renderControl={({ playing, loading }) => (
            <span>{playing ? '■ STOP' : loading ? 'LOADING…' : '▶ PLAY THE DEMO'}</span>
          )}
        />
      ) : null}

      <p>{project.summary}</p>

      <dl className="y2k-kv">
        <dt>Built</dt>
        <dd>{project.built}</dd>
        <dt>Team</dt>
        <dd>{project.team}</dd>
        <dt>Stack</dt>
        <dd>{project.stack.join(', ')}</dd>
      </dl>

      {/* The only framing this project is allowed. Rendered exactly as stored. */}
      {project.framing ? <p className="y2k-note">{project.framing}</p> : null}

      <RainbowRule />
      <h3>WHAT&apos;S IN IT</h3>
      <ul className="y2k-bullets">
        {project.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>

      <p style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {project.links.map((link) => (
          <a key={link.href} className="y2k-btn" href={link.href} target="_blank" rel="noreferrer noopener">
            {link.label} ↗
          </a>
        ))}
      </p>
    </div>
  );
};

export default ProjectWindow;
