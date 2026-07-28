/**
 * MY SKILLZ, dressed as the Win98 Control Panel.
 *
 * §7 forbids proficiency tiers — no stars, no percentages, no expert/intermediate
 * labels. So each group is a flat list of the things themselves, ordered as the
 * fact layer orders them (by centrality to actual work).
 */
import { SKILLS } from '../../../data';
import { VOICES } from '../../../data/voice';
import Icon from '../Icon';

const voice = VOICES.y2k;

const SkillsWindow = () => (
  <div className="y2k-client y2k-client--face">
    <h2>{voice.headings.skills}</h2>
    <p style={{ fontSize: 11 }}>
      Control Panel &gt; Add/Remove Skills. No star ratings in here — a number out of
      five never told anybody anything.
    </p>
    {SKILLS.map((group) => (
      <section key={group.label} style={{ marginBottom: 12 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 18, height: 18, display: 'inline-block' }}>
            <Icon name="gear" />
          </span>
          {group.label.toUpperCase()}
        </h3>
        <ul className="y2k-tags">
          {group.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    ))}
  </div>
);

export default SkillsWindow;
