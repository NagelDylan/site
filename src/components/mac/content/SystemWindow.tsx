/**
 * About This Macintosh — the era's most distinctive window, repurposed for
 * education (spec §4.11).
 *
 * WHAT IT IS: the real window listed built-in memory, virtual memory, the largest
 * unused block, and a bar per running application. That shape is doing something
 * useful here: a key/value block for the degree, and a bar per course. The Y2K
 * tree puts the same facts in System Properties; this is the other side of the
 * aisle showing its own dialog.
 *
 * WHAT IT READS: EDUCATION and IDENTITY from the fact layer, `VOICES.mac` for the
 * section heading. Every value is printed straight from src/data.
 *
 * ─── R1 IS THE RULE THIS FILE EXISTS TO GUARD ────────────────────────────────
 * A memory window is the single most tempting place on this site to type a
 * percentage, and a percentage next to a course name would read as a grade — a
 * performance metric, which R1 forbids outright. So:
 *   • The bars carry NO NUMBER of any kind, in the markup or beside it.
 *   • Their length comes from a hash of the course name, which means it is
 *     stable between renders and means precisely nothing.
 *   • They are `aria-hidden` and `data-decorative`, so assistive technology and
 *     print both skip them, and a visible footnote says outright that they are
 *     ornament rather than measurement.
 * The only figure in this window is GPA 3.9, which is approved copy (§3) and is
 * not a performance metric.
 *
 * R4: graduation is 2028. `EDUCATION.dates` reads "Sep 2023 – Expected 2028" and
 * is rendered verbatim. The Summer 2027 on this site is the co-op *term* in
 * `IDENTITY.availability`, printed below with its own co-op context; the two must
 * never be conflated, because a false degree date on a public page is not a typo,
 * it is a lie.
 */
import { EDUCATION, IDENTITY } from '../../../data';
import { VOICES } from '../../../data/voice';
import { RainbowMark } from '../Icon';
import { Chiselled, Hairline } from '../deco';

const voice = VOICES.mac;

/**
 * Bar length, in percent of the track, derived from the course name.
 *
 * Deliberately meaningless and deliberately deterministic: a random width would
 * twitch on every re-render and read as live telemetry, and a width derived from
 * anything real would read as a score. This is the same joke the era's memory
 * bars are: a shape that looks like data and is not.
 */
const barWidth = (label: string): number => {
  let sum = 0;
  for (let i = 0; i < label.length; i += 1) sum += label.charCodeAt(i);
  return 40 + (sum % 55);
};

const SystemWindow = () => (
  <div className="mac-client mac-system mac-scroll">
    {/* The header row of the real dialog: system mark, system name, and a line
        along the right where the version string used to sit. The mark is the
        abstract six-stripe lozenge (§2) — never fruit, never a trademark. */}
    <div className="mac-system-head">
      <span className="mac-system-mark" aria-hidden="true">
        <RainbowMark />
      </span>
      <span className="mac-system-os">Dylan OS 9</span>
      <span className="mac-system-tag">Built for the long term</span>
    </div>

    <Hairline />

    <h2>{voice.headings.education}</h2>

    <dl className="mac-kv">
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

    <Hairline />

    <Chiselled>Selected coursework</Chiselled>
    <div className="mac-system-well mac-scroll">
      <ul className="mac-bar-list">
        {EDUCATION.coursework.map((course) => (
          <li key={course} className="mac-bar-row">
            <span className="mac-bar-name">{course}</span>
            {/* No number, no label, no tooltip. See the R1 note at the top. */}
            <span className="mac-bar" data-decorative aria-hidden="true">
              <span className="mac-bar-fill" style={{ width: `${barWidth(course)}%` }} />
            </span>
          </li>
        ))}
      </ul>
    </div>
    <p className="mac-note">
      The bars are where the memory graph used to go. They are ornament, not marks, and
      nothing in this window is being measured.
    </p>

    <Hairline />

    <p className="mac-avail">{IDENTITY.availability}.</p>
  </div>
);

export default SystemWindow;
