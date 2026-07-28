/**
 * ProjectCard — what `render_project_card` produces.
 *
 * The model supplies a slug and, optionally, one line of its own reasoning.
 * Everything else on this card is read straight out of src/data, which is what
 * makes R5 structural here rather than aspirational: the bot cannot misstate a
 * stack, invent a link, or attach an award to FlowSense, because it does not
 * supply any of those fields.
 *
 * Media is poster-first via MotionMedia. That is not a nicety — tanks.webp is
 * about 1 MB, and a chat that renders three cards in one answer would otherwise
 * pull well over a megabyte onto a phone unprompted.
 */
import { projectBySlug } from '../../data';
import { VOICES } from '../../data/voice';
import MotionMedia from '../shared/MotionMedia';
import type { ProjectSlug } from '../../lib/chat';

const ProjectCard = ({ slug, note }: { slug: ProjectSlug; note?: string }) => {
  const project = projectBySlug(slug);
  if (!project) return null;

  const blurb = VOICES.chat.projectBlurbs[slug];

  return (
    <article className="c-card c-card--project" aria-labelledby={`card-${slug}`}>
      {project.media ? (
        <MotionMedia
          className="c-card__media"
          animated={project.media.animated}
          poster={project.media.poster}
          alt={project.media.alt}
          width={project.media.width}
          height={project.media.height}
          playLabel="Play demo"
          renderControl={({ playing, loading }) => (
            <span aria-hidden="true">{playing ? 'Pause' : loading ? 'Loading…' : 'Play demo'}</span>
          )}
        />
      ) : null}

      <div className="c-card__body">
        <h3 className="c-card__title" id={`card-${slug}`}>
          {project.name}
        </h3>
        <p className="c-card__meta">
          {project.built} · {project.team}
        </p>
        <p className="c-card__text">{blurb}</p>
        {note ? <p className="c-card__note">{note}</p> : null}

        {/*
          FlowSense's framing is required copy, not decoration (R2). It renders
          here because the card is the most likely place a visitor forms an
          impression of what the project was.
        */}
        {project.framing ? <p className="c-card__framing">{project.framing}</p> : null}

        <ul className="c-chips">
          {project.stack.map((tech) => (
            <li className="c-chip" key={tech}>
              {tech}
            </li>
          ))}
        </ul>

        {project.links.length ? (
          <p className="c-card__links">
            {project.links.map((link) => (
              <a
                className="c-link"
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </p>
        ) : null}
      </div>
    </article>
  );
};

export default ProjectCard;
