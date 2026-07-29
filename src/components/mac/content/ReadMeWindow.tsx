/**
 * Read Me — the SimpleText document that stands in for the hero (spec §4.11).
 *
 * WHAT IT IS: the file a 1997 installer left on your desktop, repurposed as the
 * front door of this theme. The Y2K tree opens the same information with a
 * marquee and three exclamation marks; the Macintosh opens it with a plain
 * document that tells you what is installed and where to click. Same facts, one
 * tenth of the volume — that contrast is the entire point of this tree (§0).
 *
 * WHAT IT READS: `VOICES.mac` for the greeting, the hero sub-line and the two
 * command-style CTA labels, and the fact layer for IDENTITY, SOCIALS and the
 * counts in the "What's installed" list. Nothing is paraphrased here.
 *
 * RULES IT GUARDS:
 *   R5 — the only copy this file authors is navigation microcopy about windows
 *        that genuinely exist in WINDOW_DEFS. Every count is read from the fact
 *        layer rather than typed, so a new project cannot make this list lie.
 *   R4 — the availability line is `IDENTITY.availability` verbatim. It is a
 *        Summer 2027 *co-op term*, never a graduation date; graduation is 2028
 *        and lives in the About This Macintosh window.
 *   R1 — the list below counts folders and windows. Structure, never outcomes:
 *        no percentages, no audience figures, nothing a reader could score.
 *
 * §13: the résumé link only renders when the file is actually on the server. The
 * document reads perfectly well without it.
 */
import { COOP_TERMS, FEATURED, IDENTITY, RECYCLE_BIN, SOCIALS } from '../../../data';
import type { ThemeId } from '../../../data/voice';
import { VOICES } from '../../../data/voice';
import type { IconName } from '../Icon';
import Icon from '../Icon';
import { Hairline, ThemeRing } from '../deco';
import type { Resume, WindowKind } from '../wm';

const voice = VOICES.mac;

type Props = {
  resume: Resume;
  onTheme: (theme: ThemeId) => void;
  onOpen: (kind: WindowKind) => void;
};

/**
 * One row of the "What's installed" list.
 *
 * G10 says every fact on the paper site has to be reachable inside this theme,
 * and the menu bar is the formal guarantee of that. This list is the informal
 * one: a visitor who never thinks to pull down a menu still has a labelled way
 * into every content window. `kind` is a real WindowKind, so a window that
 * stopped existing would fail the type check rather than dead-end a click.
 */
type Installed = { kind: WindowKind; icon: IconName; name: string; note: string };

/**
 * Names match `WINDOW_DEFS` titles exactly — a list that called the Finder
 * window something other than what its title bar says is the kind of small
 * disagreement that makes a desktop feel fake.
 */
const INSTALLED: Installed[] = [
  {
    kind: 'projects',
    icon: 'folderOpen',
    name: 'Projects',
    note: `${FEATURED.length} project folders, plus an archive of the smaller ones.`,
  },
  {
    kind: 'work',
    icon: 'doc',
    name: 'Work History',
    note: `${COOP_TERMS.length} co-op terms, most recent first.`,
  },
  {
    kind: 'about',
    icon: 'simpletext',
    name: 'About Dylan Nagel',
    note: 'A longer introduction, and a portrait rendered in two colours.',
  },
  {
    kind: 'extensions',
    icon: 'extension',
    name: 'Extensions Manager',
    note: 'Languages, frameworks and tooling, grouped the way they get used.',
  },
  {
    kind: 'system',
    icon: 'hd',
    name: 'About This Macintosh',
    note: 'School, program and selected coursework.',
  },
  {
    kind: 'mail',
    icon: 'mail',
    name: 'New Message',
    note: 'A contact form that is honest about where it sends things.',
  },
  {
    kind: 'scrapbook',
    icon: 'scrapbook',
    name: 'Scrapbook',
    note: 'A guest book with no database behind it.',
  },
  {
    kind: 'quicktime',
    icon: 'quicktime',
    name: 'QuickTime Player',
    note: 'A netlabel collection from about the era. It waits to be asked.',
  },
  {
    kind: 'trash',
    icon: 'trash',
    name: 'Trash',
    note: `${RECYCLE_BIN.length} shelved ideas. They are in there on purpose.`,
  },
  {
    kind: 'guide',
    icon: 'guide',
    name: 'Macintosh Guide',
    note: 'How this desktop works, for when a window surprises you.',
  },
];

const ReadMeWindow = ({ resume, onTheme, onOpen }: Props) => (
  // `mac-scroll` on the root because this document is the scroll container: §4.3
  // requires the Mac's own scroll bars — arrows at both ends, hollow thumb — on
  // every well that scrolls, and they are attached to that class.
  <div className="mac-client mac-client--doc mac-scroll">
    {/* The heading rule a real Read Me carried: name of the release, then a line. */}
    <div className="mac-doc-head">
      <h2 className="mac-doc-title">Read Me — Dylan OS 9</h2>
      <Hairline />
    </div>

    {voice.greeting ? <p className="mac-doc-greeting">{voice.greeting}</p> : null}

    <h3 className="mac-doc-name">{IDENTITY.name}</h3>
    <p className="mac-doc-meta">
      {IDENTITY.headline}
      <br />
      {IDENTITY.location}
    </p>
    <p className="mac-avail">{IDENTITY.availability}.</p>

    <p>{voice.heroSub}</p>

    <div className="mac-btn-row">
      <button
        type="button"
        className="mac-btn mac-btn--default"
        onClick={() => onOpen('projects')}
        data-balloon="Click here to open the Projects folder. It behaves like a Finder window, because it is one."
      >
        {voice.ctaPrimary}
      </button>
      <button
        type="button"
        className="mac-btn"
        onClick={() => onOpen('mail')}
        data-balloon="Click here to open a message window. It explains plainly where a message can actually go."
      >
        {voice.ctaSecondary}
      </button>
    </div>

    <Hairline />

    <h3>What&rsquo;s installed</h3>
    <p className="mac-note">
      Every item below opens a window. The menu bar at the top of the screen holds the same
      list, and a few things besides.
    </p>
    <ul className="mac-installed">
      {INSTALLED.map((item) => (
        <li key={item.kind} className="mac-installed-row">
          <button
            type="button"
            className="mac-installed-btn"
            onClick={() => onOpen(item.kind)}
            data-balloon={`Click here to open ${item.name}.`}
          >
            <span className="mac-installed-icon">
              <Icon name={item.icon} />
            </span>
            <span className="mac-installed-name">{item.name}</span>
            <span className="mac-installed-note">{item.note}</span>
          </button>
        </li>
      ))}
    </ul>

    {/* §13: no PDF on the server means no link to one. Never a 404 disguised as a download. */}
    {resume.available ? (
      <p>
        <a className="mac-btn" href={resume.href} download={resume.filename}>
          Save Résumé.pdf
        </a>
      </p>
    ) : null}

    <Hairline />

    <p className="mac-links">
      <a href={SOCIALS.github} target="_blank" rel="noreferrer noopener">
        GitHub
      </a>
      <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer noopener">
        LinkedIn
      </a>
      <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a>
    </p>

    <ThemeRing onTheme={onTheme} />
  </div>
);

export default ReadMeWindow;
