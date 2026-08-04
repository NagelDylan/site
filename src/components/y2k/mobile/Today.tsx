/**
 * Today — the CE home screen, and the loudest page on the site.
 *
 * A real Pocket PC's Today screen existed to answer "what is going on" without
 * opening anything: the date, the next appointment, unread mail. This one keeps
 * that job (see the glance panel, which is every field read straight out of
 * src/data) and then spends the rest of the screen being a 1999 homepage —
 * marquee, pixel headings, rainbow rules, a hit counter, a webring that goes
 * nowhere and admits it.
 *
 * It holds no facts of its own. The hero is the same COPY/IDENTITY the desktop's
 * WelcomeWindow renders, the glance rows are ROLES/EDUCATION/COOP_TERMS/FEATURED,
 * and the launcher is PROGRAMS from shell.ts, whose icons come from WINDOW_DEFS.
 * The one thing it deliberately does not do is duplicate a program's body: every
 * row and every tile is a tap through to the component the desktop already has.
 */
import {
  COOP_TERMS,
  EDUCATION,
  FEATURED,
  IDENTITY,
  PHOTO,
  ROLES,
  SECONDARY,
  SOCIALS,
} from '../../../data';
import { COPY } from '../../../data/copy';
import { Blink, MOBILE_MARQUEE_TEXT, Marquee, RainbowRule } from '../deco';
import Icon from '../Icon';
import type { Resume, WindowKind } from '../wm';
import { PROGRAMS } from './shell';

type Props = {
  resume: Resume;
  onOpen: (kind: WindowKind, arg?: string | null) => void;
};

type GlanceRow = {
  label: string;
  lines: string[];
  kind: WindowKind;
  /** Named in the accessible name, because a row that navigates should say where. */
  opens: string;
};

/** The role marked current in src/data, not the first one: the list is sorted for display. */
const CURRENT_ROLE = ROLES.find((role) => role.current) ?? null;

const COOP_LIST = COOP_TERMS.map((term) => `${term.term}. ${term.company}`).join(' · ');

const GLANCE: GlanceRow[] = [
  ...(CURRENT_ROLE
    ? [
        {
          label: 'NOW',
          lines: [
            `${CURRENT_ROLE.company} — ${CURRENT_ROLE.title}`,
            `${CURRENT_ROLE.datesShort} · ${CURRENT_ROLE.location}`,
          ],
          kind: 'experience' as WindowKind,
          opens: 'JOBS I HAVE HAD',
        },
      ]
    : []),
  {
    label: 'SCHOOL',
    lines: [EDUCATION.school, EDUCATION.program, EDUCATION.dates],
    kind: 'education',
    opens: 'SCHOOL',
  },
  {
    label: 'CO-OP TERMS',
    lines: [`${COOP_TERMS.length} terms`, COOP_LIST],
    kind: 'experience',
    opens: 'JOBS I HAVE HAD',
  },
  {
    label: 'PROJECTS',
    lines: [`${FEATURED.length} featured · ${SECONDARY.length} archived`],
    kind: 'projects',
    opens: 'C:\\Projects\\',
  },
  {
    label: 'INBOX',
    /* The work term comes from IDENTITY, not from this string: the hero two panels
       up prints the same fact, and a retyped year would let them disagree. */
    lines: [
      `1 unread — it is this website, re: ${IDENTITY.availabilityShort.toLowerCase()}`,
      'not a real inbox',
    ],
    kind: 'contact',
    opens: 'CONTACT ME',
  },
];

const Today = ({ resume, onOpen }: Props) => (
  <div className="y2k-ce-today">
    <Marquee text={MOBILE_MARQUEE_TEXT} label="Site announcements" />

    <header className="y2k-ce-hero">
      <p className="y2k-rainbow y2k-ce-hero-greet">{COPY.greeting}</p>
      <h1>{IDENTITY.name}</h1>
      <p className="y2k-ce-hero-head">
        <strong>{IDENTITY.headline}</strong>
        <br />
        {IDENTITY.location}
      </p>
      <p>
        <span className="y2k-avail">
          <Blink>★</Blink> {IDENTITY.availability.toUpperCase()} <Blink>★</Blink>
        </span>
      </p>
      {/*
       * 160 square is the file's true grid (see PHOTO in src/data/identity.ts) and
       * the attributes have to state it: CSS scales the portrait down, and without
       * an intrinsic ratio the hero reflows the moment the image decodes.
       */}
      <img
        className="y2k-portrait y2k-ce-hero-photo"
        src={PHOTO.small}
        alt={PHOTO.alt}
        width={160}
        height={160}
      />
      <p className="y2k-ce-hero-sub">{COPY.heroSub}</p>
    </header>

    {/*
     * Stacked and full-width rather than the desktop's wrapped row: a thumb
     * reaching across a 320px screen cannot aim at a button that shares its line.
     */}
    <div className="y2k-ce-cta">
      <button type="button" className="y2k-ce-cta-btn" onClick={() => onOpen('projects')}>
        {COPY.ctaPrimary}
      </button>
      <button type="button" className="y2k-ce-cta-btn" onClick={() => onOpen('contact')}>
        {COPY.ctaSecondary}
      </button>
      {/* Both only exist when the PDF does — same gate as the desktop's icon. */}
      {resume.available ? (
        <>
          <button type="button" className="y2k-ce-cta-btn" onClick={() => onOpen('resume')}>
            📄 READ MY RÉSUMÉ
          </button>
          <a className="y2k-ce-cta-btn" href={resume.href} download={resume.filename}>
            💾 DOWNLOAD THE .pdf
          </a>
        </>
      ) : null}
    </div>

    <RainbowRule />

    <section className="y2k-ce-glance" aria-labelledby="ce-glance-head">
      <h2 id="ce-glance-head">AT A GLANCE</h2>
      {GLANCE.map((row) => (
        <button
          key={row.label}
          type="button"
          className="y2k-ce-glance-row"
          onClick={() => onOpen(row.kind)}
          aria-label={`${row.label}: ${row.lines.join('. ')}. Opens ${row.opens}`}
        >
          <span className="y2k-ce-glance-label">{row.label}</span>
          <span className="y2k-ce-glance-val">
            {row.lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </span>
          <span className="y2k-ce-glance-go" aria-hidden="true">
            ▸
          </span>
        </button>
      ))}
    </section>

    <RainbowRule />

    <section aria-labelledby="ce-progs-head">
      <h2 id="ce-progs-head">PROGRAMS</h2>
      <div className="y2k-ce-progs">
        {/* shell.ts ships the résumé entry unconditionally and documents that the
            caller is the one that knows whether the file was built. */}
        {PROGRAMS.filter((program) => program.kind !== 'resume' || resume.available).map(
          (program) => (
            <button
              key={program.kind}
              type="button"
              className="y2k-ce-prog"
              onClick={() => onOpen(program.kind)}
            >
              <Icon name={program.icon} />
              <span>{program.label}</span>
            </button>
          ),
        )}
      </div>
    </section>

    <RainbowRule />

    <div className="y2k-ce-social">
      <a href={SOCIALS.github} target="_blank" rel="noreferrer noopener">
        GitHub
      </a>
      <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer noopener">
        LinkedIn
      </a>
      <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a>
      <button type="button" className="y2k-ce-cta-btn" onClick={() => onOpen('guestbook')}>
        SIGN MY GUESTBOOK
      </button>
    </div>
  </div>
);

export default Today;
