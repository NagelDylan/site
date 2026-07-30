/**
 * JOBS I HAVE HAD — the experience window.
 *
 * Titles, dates, bullets and notes render verbatim from src/data/experience.ts —
 * only the heading is styled, so a job history cannot pick up an exclamation mark.
 * The Apple role gets .y2k-role--plain: no pixel font, no neon, no logo (trademark).
 */
import { COOP_TERMS, EDUCATION, ROLES } from "../../../data";
import { COPY } from "../../../data/copy";
import { RainbowRule } from "../deco";

const ExperienceWindow = () => (
  <div className="y2k-client">
    <h2>{COPY.headings.experience}</h2>
    <RainbowRule />

    {ROLES.map((role) => {
      const plain = role.company === "Apple";
      return (
        <article
          key={role.slug}
          className={`y2k-role${plain ? " y2k-role--plain" : ""}`}
          data-print-block
        >
          <div className="y2k-role-head">
            <span className="y2k-role-co">{role.company}</span>
            <strong>{role.title}</strong>
          </div>
          <p className="y2k-role-meta">
            {role.dates} · {role.location} · {role.arrangement}
            {role.coopTerm ? ` · co-op term ${role.coopTerm}` : ""}
            {role.current ? " · CURRENT" : ""}
          </p>

          {role.description ? (
            <p style={{ marginTop: 8 }}>{role.description}</p>
          ) : null}

          {role.bullets.length ? (
            <ul className="y2k-bullets" style={{ marginTop: 8 }}>
              {role.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}

          {role.note ? <p className="y2k-note">{role.note}</p> : null}

          <ul className="y2k-tags">
            {role.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </article>
      );
    })}

    <RainbowRule />
    <h3>CO-OP TERM MAP</h3>
    <ol className="y2k-bullets">
      {COOP_TERMS.map((term) => (
        <li key={term.term}>
          Term {term.term} — {term.company}, {term.season}
        </li>
      ))}
    </ol>
    <p style={{ fontSize: 11 }}>
      {EDUCATION.school} · {EDUCATION.program} · {EDUCATION.dates}
    </p>
  </div>
);

export default ExperienceWindow;
