/**
 * SCHOOL, dressed as the System Properties dialog.
 *
 * The graduation year is whatever EDUCATION.dates says (2028). The Summer 2027
 * line elsewhere is a co-op work term, not a degree date.
 */
import { EDUCATION, IDENTITY } from '../../../data';
import { COPY } from '../../../data/copy';

const EducationWindow = () => (
  <div className="y2k-client y2k-client--face">
    <h2>{COPY.headings.education}</h2>
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
