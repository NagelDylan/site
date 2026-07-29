/**
 * MOBILE — a simplified Y2K page, not a shrunken desktop (§10 mobile).
 *
 * A window manager on a phone is a bad joke told slowly: title bars are smaller
 * than a thumb, overlapping windows have nowhere to overlap, and drag fights the
 * scroll. So narrow viewports get what the era actually looked like on a small
 * screen — one long tiled page, a marquee, pixel headings, and maximalism, in
 * document order.
 *
 * G10 still holds here: everything the desktop conveys is on this page.
 * Experience bullets and education remain verbatim from the fact layer, and R3's
 * Apple boundary is respected exactly as it is on the desktop.
 */
import {
  COOP_TERMS,
  EDUCATION,
  FEATURED,
  IDENTITY,
  INTERESTS,
  PHOTO,
  PHOTOS,
  RECYCLE_BIN,
  ROLES,
  SECONDARY,
  SKILLS,
  SOCIALS,
} from '../../data';
import type { ThemeId } from '../../data/voice';
import { VOICES } from '../../data/voice';
import { MARQUEE_TEXT, Marquee, RainbowRule, UnderConstruction } from './deco';
import type { Resume } from './wm';

const voice = VOICES.y2k;

type Props = {
  onTheme: (theme: ThemeId) => void;
  onToggleMode: () => void;
  mode: 'light' | 'dark';
  resume: Resume;
};

const MobileY2k = ({ onTheme, onToggleMode, mode, resume }: Props) => (
  <div className="y2k-m">
    <Marquee text={MARQUEE_TEXT} label="Site announcements" />

    <header className="y2k-m-hero">
      <p className="y2k-rainbow" style={{ fontWeight: 700 }}>
        {voice.greeting}
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
          src={PHOTOS.y2k.small}
          alt={PHOTO.alt}
          width={110}
          height={110}
          style={{ width: 110, height: 'auto', margin: '0 auto', border: '3px ridge #ff2fb9' }}
        />
      </p>
      <p style={{ marginTop: 8 }}>{voice.heroSub}</p>
      <p style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a className="y2k-btn" href={`mailto:${IDENTITY.email}`}>
          {voice.ctaSecondary}
        </a>
        <a className="y2k-btn" href="#projects">
          {voice.ctaPrimary}
        </a>
        {/*
         * A link out, not an embed. There is no window manager on this page and so
         * no plug-in gag to run, and phone browsers routinely refuse to draw a PDF
         * inline at all — an <object> here would be a dead grey box on the most
         * common screen the site has. Handing the file to the browser's own viewer
         * in a new tab is the honest version (§18.5). Both are gated on the file
         * really existing (§13).
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
      <p>
        <UnderConstruction label="MOBILE EDITION — NO WINDOWS TO DRAG, SORRY" />
      </p>
    </header>

    <section className="y2k-m-sec">
      <h2>{voice.headings.about}</h2>
      <p>{voice.bioShort}</p>
      <RainbowRule />
      {voice.bioLong.map((paragraph) => (
        <p key={paragraph.slice(0, 24)}>{paragraph}</p>
      ))}
      <h3>{voice.headings.interests}</h3>
      <p>{INTERESTS.join(' · ')}</p>
    </section>

    <section className="y2k-m-sec">
      <h2>{voice.headings.experience}</h2>
      {/* Verbatim from the fact layer — no voice applied, on any screen size. */}
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
      <h2>{voice.headings.projects}</h2>
      {FEATURED.map((project) => {
        const blurb = voice.projectBlurbs[project.slug as keyof typeof voice.projectBlurbs];
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
              {project.built} · {project.team} · {project.stack.join(', ')}
            </p>
            {/* FlowSense's only permitted framing (R2). No award, ever. */}
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
      <h2>{voice.headings.skills}</h2>
      {SKILLS.map((group) => (
        <div key={group.label}>
          <h3>{group.label}</h3>
          <p>{group.items.join(' · ')}</p>
        </div>
      ))}
    </section>

    <section className="y2k-m-sec">
      <h2>{voice.headings.education}</h2>
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
      <h2>{voice.headings.contact}</h2>
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
      <RainbowRule />
      <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      </p>
    </section>

    <div className="y2k-m-bar" data-chrome>
      <span style={{ fontWeight: 700 }}>Dylan OS 98</span>
      <span style={{ display: 'flex', gap: 6 }}>
        <button type="button" className="y2k-btn" onClick={() => onTheme('paper')}>
          📄 Paper
        </button>
        <button type="button" className="y2k-btn" onClick={() => onTheme('mac')}>
          🖥 Mac
        </button>
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
