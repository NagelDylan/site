/**
 * MOBILE — a simplified Macintosh document, not a shrunken desktop (spec §4.13).
 *
 * A window manager on a phone is a bad joke told slowly: title bars are smaller
 * than a thumb, overlapping windows have nowhere to overlap, and drag fights the
 * scroll. The Y2K tree answers that with one long tiled page of maximalism. This
 * theme answers it the way a Macintosh would have: a single SimpleText-style
 * document, read top to bottom, with a menu bar drawn across the top of it that
 * makes no promises it cannot keep.
 *
 * ─── WHAT IT READS ───────────────────────────────────────────────────────────
 * The fact layer (src/data) for everything dated, named or linked, and VOICES.mac
 * for hero and about copy and the project blurbs. Nothing on this page is written
 * here that is not already true somewhere in src/data (R5).
 *
 * ─── THE RULES THIS FILE GUARDS ──────────────────────────────────────────────
 * G10  Everything the desktop conveys is on this page: hero and availability,
 *      portrait, about, the full work history, featured and secondary projects,
 *      the Trash list, skills, education, contact and the theme switcher. If a
 *      window gets a new fact, it gets added here too.
 * R3   The Apple role renders APPLE_DESCRIPTION verbatim and gets the plain
 *      treatment — no pills beyond its tags, no flourish, and never the logo.
 * R4   Graduation is 2028, read from EDUCATION.dates. The only 2027 on this page
 *      is IDENTITY.availability, which is a co-op *term*.
 * G15  The fake menu bar is chrome and is marked as such, so print.css strips it
 *      and a printed page reads as a document rather than a screenshot.
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
import { returnToChooser } from '../../lib/theme';
import MotionMedia from '../shared/MotionMedia';
import { RainbowMark } from './Icon';
import { Hairline, StickyNote, ThemeRing } from './deco';
import type { Resume } from './wm';

const voice = VOICES.mac;

/**
 * The menu titles drawn across the top of the page.
 *
 * They are text, not buttons, and they are aria-hidden: a menu that opens nothing
 * should not be announced as a menu. The line underneath says so in plain words
 * rather than leaving a visitor to discover it by tapping.
 */
const FAKE_MENUS = ['File', 'Edit', 'View', 'Special', 'Help'] as const;

type Props = {
  onTheme: (theme: ThemeId) => void;
  onToggleMode: () => void;
  mode: 'light' | 'dark';
  resume: Resume;
};

const MacMobile = ({ onTheme, onToggleMode, mode, resume }: Props) => (
  <div className="mac-m">
    <div className="mac-m-bar" data-chrome>
      <span className="mac-m-bar-mark">
        <RainbowMark />
      </span>
      <span className="mac-m-bar-titles" aria-hidden="true">
        {FAKE_MENUS.map((title) => (
          <span key={title}>{title}</span>
        ))}
      </span>
      <span className="mac-m-bar-actions">
        <button
          type="button"
          className="mac-m-btn"
          onClick={onToggleMode}
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {mode === 'dark' ? '☀' : '☾'}
        </button>
      </span>
    </div>
    <p className="mac-m-bar-note" data-chrome>
      This menu bar is a picture of one. The light and dark control on it is real; the words beside
      it are not. On a larger screen this theme is a desktop with windows you can move.
    </p>

    <header className="mac-m-hero">
      {voice.greeting ? <p className="mac-m-greeting">{voice.greeting}</p> : null}
      <h1>{IDENTITY.name}</h1>
      <p className="mac-m-headline">
        <strong>{IDENTITY.headline}</strong>
        <br />
        {IDENTITY.location}
      </p>

      {/* G10: the availability line, in the same yellow note the desktop pins to the desk. */}
      <StickyNote className="mac-m-sticky">
        <p>{IDENTITY.availability}.</p>
        <p>
          Reachable at <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a>.
        </p>
      </StickyNote>

      <img
        className="mac-m-portrait"
        src={PHOTOS.mac.small}
        alt={PHOTO.alt}
        width={140}
        height={140}
        decoding="async"
      />

      <p className="mac-m-herosub">{voice.heroSub}</p>

      <p className="mac-m-cta">
        <a className="mac-m-btn" href="#projects">
          {voice.ctaPrimary}
        </a>
        <a className="mac-m-btn" href={`mailto:${IDENTITY.email}`}>
          {voice.ctaSecondary}
        </a>
        {/* §13: offered only when the file actually exists. */}
        {resume.available ? (
          <>
            <a className="mac-m-btn" href={resume.href} download={resume.filename}>
              Save Résumé.pdf
            </a>
            {/*
              `viewHref` carries the open parameters, so the document arrives fitted
              to the width of the new window rather than at whatever zoom the
              viewer remembers. The download beside it keeps the bare path — a
              fragment on a saved file means nothing.
            */}
            <a
              className="mac-m-btn"
              href={resume.viewHref}
              target="_blank"
              rel="noreferrer noopener"
            >
              Open in a new window
            </a>
          </>
        ) : null}
      </p>

      {/*
       * Deliberately NO embedded PDF on this page, unlike the desktop's Résumé
       * window. Phone and tablet browsers frequently decline to draw a PDF inline
       * and give you a blank rectangle with no explanation in it, which reads as a
       * broken page rather than as a browser limitation — and a dead grey box is
       * worse than a link that plainly works. So the document is offered as two
       * honest links, and this note says why rather than leaving somebody to wonder
       * where the page went.
       */}
      {resume.available ? (
        <p className="mac-m-note">
          The résumé opens in a window of its own rather than inside this page. Phones and tablets
          often decline to draw a PDF in place, and an empty rectangle would tell you nothing.
        </p>
      ) : null}
    </header>

    <section className="mac-m-sec">
      <h2>{voice.headings.about}</h2>
      <p>{voice.bioShort}</p>
      <Hairline />
      {voice.bioLong.map((paragraph) => (
        <p key={paragraph.slice(0, 24)}>{paragraph}</p>
      ))}
      <h3>{voice.headings.interests}</h3>
      <p>{INTERESTS.join(' · ')}</p>
    </section>

    <section className="mac-m-sec">
      <h2>{voice.headings.experience}</h2>
      <p className="mac-m-meta">
        In reverse order. The dates and descriptions below are the same words on every version of
        this site — that part does not get a costume.
      </p>

      {/*
       * Verbatim from the fact layer — no voice applied, on any screen size.
       * R3: the Apple role takes the plain treatment and renders APPLE_DESCRIPTION
       * (its `description` field) and nothing else.
       */}
      {ROLES.map((role) => {
        const plain = role.company === 'Apple';
        return (
          <article
            key={role.slug}
            className={`mac-m-role${plain ? ' mac-m-role--plain' : ''}`}
            data-print-block
          >
            <h3>
              {role.company} — {role.title}
            </h3>
            <p className="mac-m-meta">
              {role.dates} · {role.location} · {role.arrangement}
              {role.coopTerm ? ` · co-op term ${role.coopTerm}` : ''}
              {role.current ? ' · current' : ''}
            </p>
            {role.description ? <p>{role.description}</p> : null}
            {role.bullets.length ? (
              <ul className="mac-m-bullets">
                {role.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
            {/* §4.4 requires every theme to render this note. */}
            {role.note ? <p className="mac-m-note">{role.note}</p> : null}
            <ul className="mac-m-tags">
              {role.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </article>
        );
      })}

      <Hairline />
      <h3>Co-op terms</h3>
      <ol className="mac-m-bullets">
        {COOP_TERMS.map((term) => (
          <li key={term.term}>
            Term {term.term} — {term.company}, {term.season}
          </li>
        ))}
      </ol>
    </section>

    <section className="mac-m-sec" id="projects">
      <h2>{voice.headings.projects}</h2>
      {FEATURED.map((project) => {
        const blurb = voice.projectBlurbs[project.slug as keyof typeof voice.projectBlurbs];
        return (
          <article key={project.slug} className="mac-m-project" data-print-block>
            <h3>{project.name}</h3>
            {/*
             * Poster-first: only the still frame loads, and the animation is
             * fetched on a tap. Three project cards cost a few tens of kilobytes
             * instead of a megabyte and a half, which is what G13 needs on a phone.
             */}
            {project.media ? (
              <MotionMedia
                className="mac-m-shot"
                animated={project.media.animated}
                poster={project.media.poster}
                alt={project.media.alt}
                width={project.media.width}
                height={project.media.height}
                playLabel="Play the demo"
              />
            ) : null}
            {blurb ? <p>{blurb}</p> : null}
            <p>{project.summary}</p>
            <p className="mac-m-meta">
              {project.built} · {project.team} · {project.stack.join(', ')}
            </p>
            {/*
             * R2: FlowSense's `framing` is the only thing this site says about the
             * hackathon, and it says it verbatim. No placement, no badge, ever.
             */}
            {project.framing ? <p className="mac-m-note">{project.framing}</p> : null}
            <ul className="mac-m-bullets">
              {project.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
            <p className="mac-m-links">
              {project.links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer noopener">
                  {link.label}
                </a>
              ))}
            </p>
          </article>
        );
      })}

      <Hairline />
      <h3>Archive</h3>
      <p className="mac-m-meta">Older work, kept because it is where the rest of it started.</p>
      {SECONDARY.map((project) => (
        <article key={project.name} className="mac-m-secondary">
          <strong>{project.name}</strong>
          <p>{project.oneLiner}</p>
          <p className="mac-m-meta">{project.stack.join(' · ')}</p>
          <p className="mac-m-links">
            {project.links.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer noopener">
                {link.label}
              </a>
            ))}
          </p>
        </article>
      ))}

      <Hairline />
      <h3>Trash</h3>
      <p className="mac-m-meta">
        {RECYCLE_BIN.length} items that did not make the cut. Nothing here is deleted, and the Trash
        is never emptied.
      </p>
      <p className="mac-m-list">{RECYCLE_BIN.join(' · ')}</p>
    </section>

    <section className="mac-m-sec">
      <h2>{voice.headings.skills}</h2>
      {SKILLS.map((group) => (
        <div key={group.label} className="mac-m-group">
          <h3>{group.label}</h3>
          <p>{group.items.join(' · ')}</p>
        </div>
      ))}
    </section>

    <section className="mac-m-sec">
      <h2>{voice.headings.education}</h2>
      {/* R4: the span comes from EDUCATION.dates, which ends in 2028. */}
      <dl className="mac-m-kv">
        <dt>School</dt>
        <dd>{EDUCATION.school}</dd>
        <dt>Degree</dt>
        <dd>{EDUCATION.degree}</dd>
        <dt>Program</dt>
        <dd>{EDUCATION.program}</dd>
        <dt>Location</dt>
        <dd>{EDUCATION.location}</dd>
        <dt>Dates</dt>
        <dd>{EDUCATION.dates}</dd>
        <dt>GPA</dt>
        <dd>{EDUCATION.gpa}</dd>
      </dl>
      <h3>Selected coursework</h3>
      <ul className="mac-m-bullets">
        {EDUCATION.coursework.map((course) => (
          <li key={course}>{course}</li>
        ))}
      </ul>
    </section>

    <section className="mac-m-sec">
      <h2>{voice.headings.contact}</h2>
      <p>
        <strong>{IDENTITY.availability}.</strong> Based in {IDENTITY.location}.
      </p>
      <ul className="mac-m-bullets">
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
      {/*
       * Honesty, same as the desktop's New Message window and for the same reason:
       * there is no form on this page, so the address has to carry the whole job.
       * The desktop window does now deliver (via the Web3Forms relay — see
       * src/lib/contact.ts), which is why this note no longer warns visitors off it.
       * Do not promise a form here that this page does not render.
       */}
      <p className="mac-m-note">
        There is no message form on this page. The desktop version has one, and that one does
        deliver. E-mail arrives either way.
      </p>
    </section>

    <footer className="mac-m-foot">
      <Hairline />
      {/* G8: nobody is trapped in a theme. Both routes out are plain buttons. */}
      <ThemeRing onTheme={onTheme} />
      <p className="mac-m-foot-row">
        <button type="button" className="mac-m-btn" onClick={returnToChooser}>
          Back to the chooser…
        </button>
        <button
          type="button"
          className="mac-m-btn"
          onClick={onToggleMode}
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {mode === 'dark' ? 'Light appearance' : 'Dark appearance'}
        </button>
      </p>
      <p className="mac-m-meta">Dylan OS 9 · this page is one document, not a desktop.</p>
    </footer>
  </div>
);

export default MacMobile;
