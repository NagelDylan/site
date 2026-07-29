/**
 * Get Info — the Mac's little information window, one per featured project
 * (spec §4.11).
 *
 * WHAT IT IS: the counterpart to `y2k/ProjectWindow.tsx`, and structurally a very
 * different thing. That window is a page about a project; this is the dialog you
 * get from File → Get Info: a 32px icon and a bold name at the top, a key/value
 * block underneath, and a bordered `Comments:` well at the bottom. The Y2K tree
 * shouts about the project; the Macintosh files a record on it.
 *
 * WHAT IT READS: `projectBySlug` for every fact — name, summary, built, team,
 * stack, highlights, framing and links — and `VOICES.mac.projectBlurbs[slug]` for
 * the one voiced sentence in the Comments well.
 *
 * ─── R2 IS LOAD-BEARING IN THIS FILE ─────────────────────────────────────────
 * FlowSense's only permitted framing is `project.framing`, which reads "Built at
 * Hack the 6ix 2024." and is rendered here exactly as stored. There is no award
 * slot in this component, no trophy, no badge, no placement, and none may be
 * added: it placed nowhere, and two of Dylan's own public documents are already
 * wrong about this. The enthusiasm goes on the engineering, in `highlights`.
 *
 * ─── R5, AND WHY THE FICTION IS LABELLED ─────────────────────────────────────
 * A Get Info window has rows a portfolio does not: Kind, Where, Created,
 * Modified, Version. Those five are machine fiction, derived from the fact layer
 * (a count of highlights, the year inside `built`) — and `voice.ts` warns that a
 * quiet, well-formed documentation voice is exactly where an invented version
 * number sails past a reader unchallenged. So the fiction is confined to those
 * five rows, it is derived rather than dreamt up, and a visible note under the
 * block says which rows are costume. Built / Team / Stack are verbatim fact.
 *
 * MEDIA: through the shared `MotionMedia`, never a bare <img> of the animation.
 * tanks.webp is about 1 MB and must never load unprompted; MotionMedia ships the
 * poster and fetches the animation only on intent. Framed here as the window's
 * media well.
 */
import MotionMedia from '../../shared/MotionMedia';
import { projectBySlug } from '../../../data';
import { VOICES } from '../../../data/voice';
import Icon from '../Icon';
import { Chiselled, Hairline } from '../deco';

const blurbs = VOICES.mac.projectBlurbs;

/**
 * The year out of a `built` string, for the Created and Modified rows.
 *
 * A real Get Info window shows a day and a time. Those are not in the fact layer
 * and will not be invented here (R5), so this reports the year the project was
 * built — which is a fact the site already states — and nothing finer.
 */
const yearFrom = (text: string): string => {
  const years = text.match(/\b(?:19|20)\d{2}\b/g);
  return years?.[years.length - 1] ?? '—';
};

/**
 * A version string in the era's shape, counted off the highlights.
 *
 * Deterministic, obviously derived, and labelled as fiction below the block. No
 * project on this site has a released version number, so this must never be
 * mistaken for one.
 */
const versionFrom = (highlights: number): string => `1.${highlights}`;

/**
 * Unknown slug — a mistyped `/projects/:slug`, or a stale link.
 *
 * The Mac register for this is an apology and a direction, not an error code, and
 * it must never look like the desktop broke: nothing is wrong, the visitor asked
 * for a file that is not on the disk. Rendering this instead of throwing is the
 * whole point — App.tsx passes `win.arg ?? ''` through, so an empty slug has to
 * land somewhere sensible too.
 */
const NotFound = ({ slug }: { slug: string }) => {
  const label = slug.trim();
  return (
    <div className="mac-client mac-getinfo mac-getinfo--missing">
      <div className="mac-getinfo-head">
        <span className="mac-getinfo-icon" aria-hidden="true">
          <Icon name="caution" />
        </span>
        <div className="mac-getinfo-headtext">
          <strong className="mac-getinfo-name">
            {label ? `The item “${label}” could not be found.` : 'That item could not be found.'}
          </strong>
        </div>
      </div>
      <Hairline />
      <p>
        Nothing is broken. This window was asked for information about something that is not on
        the disk, which usually means an address was mistyped.
      </p>
      <p>
        The Projects folder on the desktop lists everything that really is installed, and every
        name in it opens.
      </p>
    </div>
  );
};

const GetInfoWindow = ({ slug }: { slug: string }) => {
  const project = projectBySlug(slug);
  if (!project) return <NotFound slug={slug} />;

  const blurb = slug in blurbs ? blurbs[slug as keyof typeof blurbs] : null;
  const year = yearFrom(project.built);

  return (
    <div className="mac-client mac-getinfo">
      {/* The window's identity block: icon, name. Folders in the Finder list view,
          folders here — the two windows must not disagree about what a project is. */}
      <div className="mac-getinfo-head">
        <span className="mac-getinfo-icon" aria-hidden="true">
          <Icon name="folder" />
        </span>
        <div className="mac-getinfo-headtext">
          <strong className="mac-getinfo-name">{project.name}</strong>
          <span className="mac-getinfo-where">Macintosh HD : Projects :</span>
        </div>
      </div>

      <Hairline />

      <dl className="mac-kv mac-getinfo-kv">
        <dt>Kind</dt>
        <dd>folder</dd>
        <dt>Where</dt>
        <dd>Macintosh HD : Projects :</dd>
        <dt>Created</dt>
        <dd>{year}</dd>
        <dt>Modified</dt>
        <dd>{year}</dd>
        <dt>Version</dt>
        <dd>{versionFrom(project.highlights.length)}</dd>
        <dt>Built</dt>
        <dd>{project.built}</dd>
        <dt>Team</dt>
        <dd>{project.team}</dd>
        <dt>Stack</dt>
        <dd>{project.stack.join(', ')}</dd>
      </dl>

      <p className="mac-note">
        Kind, Where, Created, Modified and Version are what a Finder window would say. They are
        counted off this project&rsquo;s own entry — the year it was built, the number of things
        listed below — and they are not release numbers. Built, Team and Stack are the real
        record.
      </p>

      <Hairline />

      <Chiselled>Comments:</Chiselled>
      <div className="mac-getinfo-comments mac-scroll">
        <p>{project.summary}</p>
        {blurb ? <p>{blurb}</p> : null}

        {/*
          The only framing this project is allowed, rendered exactly as stored.
          Nothing may be appended to it, and no sibling element may reinterpret it:
          see the R2 note at the top of this file.
        */}
        {project.framing ? <p className="mac-getinfo-framing">{project.framing}</p> : null}

        <ul className="mac-bullets">
          {project.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </div>

      <div className="mac-btn-row">
        {project.links.map((link) => (
          <a
            key={link.href}
            className="mac-btn"
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            data-balloon="This link opens in a new window, outside this desktop."
          >
            {link.label}
          </a>
        ))}
      </div>

      {project.media ? (
        <>
          <MotionMedia
            animated={project.media.animated}
            poster={project.media.poster}
            alt={project.media.alt}
            width={project.media.width}
            height={project.media.height}
            className="mac-media mac-getinfo-media"
            playLabel="Play the demonstration"
            renderControl={({ playing, loading }) => (
              <span>
                {playing ? 'Stop' : loading ? 'Loading…' : 'Play the demonstration'}
              </span>
            )}
          />
          <p className="mac-note">
            The still above is all that loads. The moving version is fetched only when you ask for
            it, which is a courtesy to anyone reading this on a telephone.
          </p>
        </>
      ) : null}
    </div>
  );
};

export default GetInfoWindow;
