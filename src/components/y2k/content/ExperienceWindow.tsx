/**
 * JOBS I HAVE HAD — the experience window.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NO Y2K VOICE IN THIS WINDOW'S DATA. Every role title, date, bullet and note is
 * rendered verbatim from src/data/experience.ts. Spec §2 scopes the three voices
 * to hero / about / project blurbs precisely so a job history cannot drift, and
 * the only liberty taken here is the window's own heading.
 *
 * R3: the Apple role renders APPLE_DESCRIPTION and nothing else — no added
 * exclamation marks, no glow, no speculation, no logo. It gets .y2k-role--plain,
 * which strips the pixel-font/neon treatment the other roles get. The logo field
 * is null in the fact layer for exactly this reason (trademark) and is never used
 * here even if it were populated.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { COOP_TERMS, EDUCATION, ROLES } from '../../../data';
import { VOICES } from '../../../data/voice';
import { RainbowRule } from '../deco';

const voice = VOICES.y2k;

const ExperienceWindow = () => (
  <div className="y2k-client">
    <h2>{voice.headings.experience}</h2>
    <p style={{ fontSize: 11 }}>
      Four co-op terms, in reverse order. Dates and descriptions below are the same
      words on every version of this site — that part does not get a costume.
    </p>
    <RainbowRule />

    {ROLES.map((role) => {
      const plain = role.company === 'Apple';
      return (
        <article key={role.slug} className={`y2k-role${plain ? ' y2k-role--plain' : ''}`} data-print-block>
          <div className="y2k-role-head">
            <span className="y2k-role-co">{role.company}</span>
            <strong>{role.title}</strong>
          </div>
          <p className="y2k-role-meta">
            {role.dates} · {role.location} · {role.arrangement}
            {role.coopTerm ? ` · co-op term ${role.coopTerm}` : ''}
            {role.current ? ' · CURRENT' : ''}
          </p>

          {role.description ? <p style={{ marginTop: 8 }}>{role.description}</p> : null}

          {role.bullets.length ? (
            <ul className="y2k-bullets" style={{ marginTop: 8 }}>
              {role.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}

          {/* §4.4 requires every theme to render this note. */}
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
