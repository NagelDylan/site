/**
 * SCHOOL, dressed as the System Properties dialog.
 *
 * R4: the graduation year rendered here is whatever EDUCATION.dates says, which
 * is "Sep 2023 – Expected 2028". 2028. The only 2027 anywhere on this site is the
 * Summer 2027 co-op *term* line, which is a work term and not a degree date.
 *
 * GPA 3.9 is approved copy (§3) and is not a performance metric under R1.
 */
import { EDUCATION, IDENTITY } from '../../../data';
import { VOICES } from '../../../data/voice';

const voice = VOICES.y2k;

const EducationWindow = () => (
  <div className="y2k-client y2k-client--face">
    <h2>{voice.headings.education}</h2>
    <div className="y2k-in" style={{ padding: '10px 12px', marginBottom: 10 }}>
      <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, lineHeight: 1.7 }}>
        System:
        <br />
        {EDUCATION.school}
        <br />
        {EDUCATION.degree}
        <br />
        {EDUCATION.program}
      </p>
    </div>

    <dl className="y2k-kv">
      <dt>Registered to</dt>
      <dd>{IDENTITY.name}</dd>
      <dt>Location</dt>
      <dd>{EDUCATION.location}</dd>
      <dt>Dates</dt>
      <dd>{EDUCATION.dates}</dd>
      <dt>GPA</dt>
      <dd>{EDUCATION.gpa}</dd>
    </dl>

    <h3>SELECTED COURSEWORK</h3>
    <ul className="y2k-bullets">
      {EDUCATION.coursework.map((course) => (
        <li key={course}>{course}</li>
      ))}
    </ul>

    <p className="y2k-note">{IDENTITY.availability}.</p>
  </div>
);

export default EducationWindow;
