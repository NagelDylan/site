/**
 * A featured project's window.
 *
 * The blurb is the only loud string; summary, dates, team, stack, highlights and
 * links come verbatim from the data files. `project.framing` is the whole of what
 * gets said about how a project did, so there is no award or placement slot here.
 *
 * Media goes through MotionMedia poster-first: tanks.webp is 1 MB and must never
 * load unprompted.
 */
import MotionMedia from '../MotionMedia';
import { projectBySlug } from '../../../data';
import { COPY } from '../../../data/copy';
import { RainbowRule } from '../deco';

const blurbs = COPY.projectBlurbs;

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
