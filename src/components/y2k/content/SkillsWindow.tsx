/**
 * MY SKILLZ, dressed as the Win98 Control Panel.
 *
 * No proficiency tiers by design: flat lists in the order src/data lists them.
 */
import { SKILLS } from "../../../data";
import { COPY } from "../../../data/copy";
import Icon from "../Icon";

const SkillsWindow = () => (
  <div className="y2k-client y2k-client--face">
    <h2>{COPY.headings.skills}</h2>
    {SKILLS.map((group) => (
      <section key={group.label} style={{ marginBottom: 12 }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 18, height: 18, display: "inline-block" }}>
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
