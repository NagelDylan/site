/**
 * The narrow-viewport page: one long tiled page, not a shrunken desktop.
 *
 * A window manager is unusable on a phone — title bars are smaller than a thumb,
 * overlapping windows have nowhere to overlap, and drag fights the scroll. So
 * narrow screens get what the era actually looked like on a small screen:
 * marquee, pixel headings and maximalism, in document order. Everything the
 * desktop conveys is on this page.
 */
import {
  COOP_TERMS,
  EDUCATION,
  FEATURED,
  IDENTITY,
  PHOTO,
  RECYCLE_BIN,
  ROLES,
  SECONDARY,
  SKILLS,
  SOCIALS,
} from '../../data';
import { COPY } from '../../data/copy';
import { MARQUEE_TEXT, Marquee, RainbowRule } from './deco';
import type { Resume } from './wm';

type Props = {
  onToggleMode: () => void;
  mode: 'light' | 'dark';
  resume: Resume;
};

const MobileY2k = ({ onToggleMode, mode, resume }: Props) => (
  <div className="y2k-m">
    <Marquee text={MARQUEE_TEXT} label="Site announcements" />

    <header className="y2k-m-hero">
      <p className="y2k-rainbow" style={{ fontWeight: 700 }}>
        {COPY.greeting}
      </p>
      <h1>{IDENTITY.name}</h1>
      <p>
        <strong>{IDENTITY.headline}</strong>
        <br />
        {IDENTITY.location}
      </p>
      <p>
        <span className="y2k-avail">★ {IDENTITY.availability.toUpperCase()} ★</span>
      </p>
      <p style={{ marginTop: 10 }}>
        <img
          className="y2k-portrait"
          src={PHOTO.small}
          alt={PHOTO.alt}
          width={110}
          height={110}
          style={{ width: 110, height: 'auto', margin: '0 auto', border: '3px ridge #ff2fb9' }}
        />
      </p>
      <p style={{ marginTop: 8 }}>{COPY.heroSub}</p>
      <p style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a className="y2k-btn" href={`mailto:${IDENTITY.email}`}>
          {COPY.ctaSecondary}
        </a>
        <a className="y2k-btn" href="#projects">
          {COPY.ctaPrimary}
        </a>
        {/*
         * A link out, not an embed. Phone browsers routinely refuse to draw a PDF
         * inline, so an <object> here would be a dead grey box on the most common
         * screen the site has. Both links are gated on the file existing.
         */}
        {resume.available ? (
          <>
            <a className="y2k-btn" href={resume.href} target="_blank" rel="noreferrer noopener">
              📄 READ RÉSUMÉ ↗
            </a>
            <a className="y2k-btn" href={resume.href} download={resume.filename}>
              💾 SAVE IT
            </a>
          </>
        ) : null}
      </p>
    </header>

    <section className="y2k-m-sec">
      <h2>{COPY.headings.about}</h2>
      <p>{COPY.bioShort}</p>
      <RainbowRule />
      {COPY.bioLong.map((paragraph) => (
        <p key={paragraph.slice(0, 24)}>{paragraph}</p>
      ))}
    </section>

    <section className="y2k-m-sec">
      <h2>{COPY.headings.experience}</h2>
      {/* Verbatim from src/data, at every screen size. */}
      {ROLES.map((role) => (
        <article key={role.slug} style={{ marginBottom: 16 }}>
          <h3>
            {role.company} — {role.title}
          </h3>
          <p style={{ fontSize: 11, opacity: 0.85 }}>
            {role.dates} · {role.location} · {role.arrangement}
            {role.coopTerm ? ` · co-op term ${role.coopTerm}` : ''}
          </p>
          {role.description ? <p>{role.description}</p> : null}
          {role.bullets.length ? (
            <ul>
              {role.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
          {role.note ? <p className="y2k-note">{role.note}</p> : null}
          <p style={{ fontSize: 11 }}>{role.tags.join(' · ')}</p>
        </article>
      ))}
      <h3>CO-OP TERMS</h3>
      <ul>
        {COOP_TERMS.map((term) => (
          <li key={term.term}>
            Term {term.term} — {term.company}, {term.season}
          </li>
        ))}
      </ul>
    </section>

    <section className="y2k-m-sec" id="projects">
      <h2>{COPY.headings.projects}</h2>
      {FEATURED.map((project) => {
        const blurb = COPY.projectBlurbs[project.slug as keyof typeof COPY.projectBlurbs];
        return (
          <article key={project.slug} style={{ marginBottom: 18 }}>
            <h3>{project.name.toUpperCase()}</h3>
            {project.media ? (
              <img
                src={project.media.poster}
                alt={project.media.alt}
                width={project.media.width}
                height={project.media.height}
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: 'auto', border: '2px solid #fff' }}
              />
            ) : null}
            {blurb ? <p>{blurb}</p> : null}
            <p>{project.summary}</p>
            <p style={{ fontSize: 11 }}>
              {project.team} · {project.stack.join(', ')}
            </p>
            {project.framing ? <p className="y2k-note">{project.framing}</p> : null}
            <ul>
              {project.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
            <p>
              {project.links.map((link, index) => (
                <span key={link.href}>
                  {index > 0 ? ' · ' : ''}
                  <a href={link.href} target="_blank" rel="noreferrer noopener">
                    {link.label} ↗
                  </a>
                </span>
              ))}
            </p>
          </article>
        );
      })}

      <RainbowRule />
      <h3>OLD BUT GOLD</h3>
      {SECONDARY.map((project) => (
        <article key={project.name} style={{ marginBottom: 12 }}>
          <strong>{project.name}</strong>
          <p style={{ margin: '2px 0' }}>{project.oneLiner}</p>
          <p style={{ margin: 0, fontSize: 11 }}>
            {project.stack.join(' · ')}
            {' — '}
            {project.links.map((link, index) => (
              <span key={link.href}>
                {index > 0 ? ' · ' : ''}
                <a href={link.href} target="_blank" rel="noreferrer noopener">
                  {link.label}
                </a>
              </span>
            ))}
          </p>
        </article>
      ))}

      <RainbowRule />
      <h3>🗑 RECYCLE BIN</h3>
      <p>these didn&apos;t make the cut :)</p>
      <p style={{ opacity: 0.75 }}>{RECYCLE_BIN.join(' · ')}</p>
    </section>

    <section className="y2k-m-sec">
      <h2>{COPY.headings.skills}</h2>
      {SKILLS.map((group) => (
        <div key={group.label}>
          <h3>{group.label}</h3>
          <p>{group.items.join(' · ')}</p>
        </div>
      ))}
    </section>

    <section className="y2k-m-sec">
      <h2>{COPY.headings.education}</h2>
      <p>
        <strong>{EDUCATION.school}</strong>
        <br />
        {EDUCATION.degree} — {EDUCATION.program}
        <br />
        {EDUCATION.location} · {EDUCATION.dates}
        <br />
        GPA {EDUCATION.gpa}
      </p>
      <h3>SELECTED COURSEWORK</h3>
      <ul>
        {EDUCATION.coursework.map((course) => (
          <li key={course}>{course}</li>
        ))}
      </ul>
    </section>

    <section className="y2k-m-sec">
      <h2>{COPY.headings.contact}</h2>
      <p>
        <strong>{IDENTITY.availability}.</strong>
      </p>
      <ul>
        <li>
          E-mail: <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a>
        </li>
        <li>
          <a href={SOCIALS.github} target="_blank" rel="noreferrer noopener">
            GitHub
          </a>
        </li>
        <li>
          <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer noopener">
            LinkedIn
          </a>
        </li>
      </ul>
      <p style={{ fontSize: 11 }}>
        There is no contact form on this page — the desktop version has one, and that one really
        does send. E-mail arrives either way.
      </p>
    </section>

    <div className="y2k-m-bar" data-chrome>
      <span style={{ fontWeight: 700 }}>Dylan OS 98</span>
      <span style={{ display: 'flex', gap: 6 }}>
        <button
          type="button"
          className="y2k-btn"
          onClick={onToggleMode}
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {mode === 'dark' ? '☀' : '☾'}
        </button>
      </span>
    </div>
  </div>
);

export default MobileY2k;
