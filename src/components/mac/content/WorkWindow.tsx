/**
 * Work History — one block per role, in a Platinum window (spec §4.11).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NO MAC VOICE IN THIS WINDOW'S DATA. Every company, title, date, bullet and
 * note below is rendered verbatim from src/data/experience.ts. Spec §2 scopes
 * the voice layer to hero / about / project blurbs precisely so that a job
 * history cannot drift between four themes, and the only copy this file authors
 * is its own lead line and the co-op term summary heading.
 *
 * R3: THE APPLE ROLE RENDERS PLAIN. It gets `mac-role--plain`, which drops the
 * chiselled treatment the other roles carry, and its body is APPLE_DESCRIPTION
 * (reached through `role.description`) and nothing else — no added enthusiasm,
 * no project names, no scale claims, and never the logo. `role.logo` is null in
 * the fact layer for exactly that trademark reason and is not read here even if
 * it were populated. This mirrors `.y2k-role--plain` in the Y2K tree; the
 * treatment differs, the rule does not.
 *
 * R1: the numbers in the Carta bullets are technical scope ("roughly 60
 * destination categories", "3,000+ line"), which is approved verbatim copy. Do
 * not "tidy" them, and do not add any figure of your own.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Reads: ROLES, COOP_TERMS, EDUCATION from the fact layer; VOICES.mac for the
 * section headings only.
 */
import { COOP_TERMS, EDUCATION, ROLES } from '../../../data';
import { VOICES } from '../../../data/voice';
import { Chiselled, Hairline, KindLabel } from '../deco';

const voice = VOICES.mac;

const WorkWindow = () => (
  // Four roles with full bullet lists will not fit 620 × 470, so this root is the
  // scroll container and carries `mac-scroll` to get the era's scroll bars (§4.3).
  <div className="mac-client mac-work mac-scroll">
    <h2>{voice.headings.experience}</h2>
    <p className="mac-lead">
      The dates and descriptions below are the same words on every version of this site. The
      desktop is a costume; the work history is not.
    </p>
    <Hairline />

    {ROLES.map((role) => {
      /**
       * Company match rather than slug: if the Apple role were ever re-slugged,
       * a slug check would silently stop stripping the treatment, which is the
       * quiet way an R3 guard fails.
       */
      const plain = role.company === 'Apple';
      return (
        <article
          key={role.slug}
          className={`mac-role${plain ? ' mac-role--plain' : ''}`}
          data-print-block
        >
          <div className="mac-role-head">
            <span className="mac-role-co">{role.company}</span>
            <strong className="mac-role-title">{role.title}</strong>
          </div>
          <p className="mac-role-meta">
            {role.dates} · {role.location} · {role.arrangement}
            {role.current ? ' · current' : ''}
          </p>

          {/* The Finder's "Kind" cell, borrowed to say which co-op term this was. */}
          {role.coopTerm ? <KindLabel kind={`Co-op term ${role.coopTerm}`} /> : null}

          {role.description ? <p className="mac-role-desc">{role.description}</p> : null}

          {role.bullets.length ? (
            <ul className="mac-bullets">
              {role.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}

          {/* §4.4 requires every theme to render this note. Empathia's nine-month
              span was a four-month term plus part-time study, and a site that
              hides that is overstating the term. */}
          {role.note ? <p className="mac-note">{role.note}</p> : null}

          {/* Tags, as small chiselled pills — engraved type on a Platinum chip.
              `.mac-pill` carries that treatment in CSS rather than wrapping each
              tag in <Chiselled>, because a tag list is content and should not
              need a decoration component to be readable. */}
          <ul className="mac-pills">
            {role.tags.map((tag) => (
              <li key={tag} className="mac-pill">
                {tag}
              </li>
            ))}
          </ul>
        </article>
      );
    })}

    <Hairline />

    <Chiselled>Co-op terms</Chiselled>
    <p className="mac-coop">
      {COOP_TERMS.length} terms so far, in the order they happened.{' '}
      {COOP_TERMS.map((term) => `${term.season} — ${term.company}`).join(' · ')}
    </p>
    <p className="mac-note">
      {EDUCATION.school} · {EDUCATION.program} · {EDUCATION.dates}
    </p>
  </div>
);

export default WorkWindow;
