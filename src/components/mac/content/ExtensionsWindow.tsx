/**
 * Extensions Manager — skills, in the control panel that lists what loaded at
 * startup (spec §4.11).
 *
 * WHAT IT IS: the perfect Mac analogue for a skills list, and the reason this
 * window exists rather than a grid of tags. Extensions Manager showed a set name
 * in a popup at the top, then a scrolling list of every extension with a checkbox,
 * an icon and a Kind cell. That shape maps onto `SKILLS` exactly: one group per
 * heading, one row per thing, and a count of both along the bottom.
 *
 * WHAT IT READS: `SKILLS` from the fact layer, grouped and ordered exactly as it
 * is stored (by centrality to actual work), and `VOICES.mac.headings.skills` for
 * the title. It authors no skill of its own.
 *
 * ─── RULES THIS FILE GUARDS ──────────────────────────────────────────────────
 * §7  No proficiency tiers. No stars, no bars, no percentages, no
 *     expert/intermediate labels — a number out of five never told anybody
 *     anything, and R1 forbids the percentage version of the same idea. Every row
 *     looks identical, which is the honest rendering: this is a list of what gets
 *     used, not a ranking.
 * R1  The status strip counts groups and items. A count of rows on a screen is
 *     structure, not performance; there is no outcome anywhere in this window.
 * R5  Every item is printed verbatim. Nothing is added, expanded, or explained.
 *
 * ─── WHY THE CHECKBOXES ARE DEAD ─────────────────────────────────────────────
 * They are checked, `disabled` and `aria-disabled`, and one footnote says so in
 * plain words. A checkbox that could be cleared would imply this window changes
 * something, and it changes nothing — there is no configuration behind it. The
 * disabled attribute is also what suppresses React's controlled-input warning for
 * a `checked` prop with no `onChange`, which is the correct reason to have it.
 */
import { SKILLS } from '../../../data';
import { VOICES } from '../../../data/voice';
import Icon from '../Icon';
import { KindLabel } from '../deco';

const voice = VOICES.mac;

/** Rows on screen. Structure, not a score — see the R1 note above. */
const ITEM_COUNT = SKILLS.reduce((total, group) => total + group.items.length, 0);

const ExtensionsWindow = () => (
  <>
    <div className="mac-client mac-extensions">
      <h2>{voice.headings.skills}</h2>

      {/*
        The set popup, drawn as a popup and deliberately not built as one: there is
        exactly one set and it holds everything, so a real menu would open onto a
        list of one. Plain text in a popup's clothing states the same fact without
        shipping a control that does nothing.
      */}
      <div className="mac-ext-head">
        <span className="mac-ext-set-label">Selected Set:</span>
        <span className="mac-popup mac-popup--static">All Skills</span>
      </div>

      <p className="mac-lead">
        Grouped the way these get used rather than ranked. There are no ratings in this window,
        because a score out of five has never told anybody anything useful.
      </p>

      <div className="mac-ext-list mac-scroll">
        <table className="mac-list mac-ext-table">
          <thead>
            <tr className="mac-list-cols">
              <th scope="col" className="mac-list-col mac-list-col--on">
                On
              </th>
              <th scope="col" className="mac-list-col mac-list-col--name">
                Name
              </th>
              <th scope="col" className="mac-list-col">
                Kind
              </th>
            </tr>
          </thead>

          {/*
            One <tbody> per group, which is what row groups are for: the group name
            is a real heading cell for the rows beneath it rather than a styled row
            that only looks like one.
          */}
          {SKILLS.map((group) => (
            <tbody className="mac-ext-group" key={group.label}>
              <tr className="mac-ext-grouprow">
                <th scope="rowgroup" colSpan={3} className="mac-ext-groupname">
                  <span className="mac-list-icon" aria-hidden="true">
                    <Icon name="folder" />
                  </span>
                  {group.label}
                </th>
              </tr>
              {group.items.map((item) => (
                <tr className="mac-list-row" key={item}>
                  <td className="mac-list-cell mac-list-cell--on">
                    <input
                      type="checkbox"
                      className="mac-check"
                      checked
                      readOnly
                      disabled
                      aria-disabled="true"
                      aria-label={`${item} — switched on, and this switch is decorative`}
                    />
                  </td>
                  <td className="mac-list-cell mac-list-cell--name">
                    {/* Every extension shared one icon on a real Mac, and every
                        row shares one here. Inventing a glyph per language would
                        be a judgement about each of them, which is not the job. */}
                    <span className="mac-list-icon" aria-hidden="true">
                      <Icon name="extension" />
                    </span>
                    <span className="mac-list-name mac-list-name--plain">{item}</span>
                  </td>
                  <td className="mac-list-cell mac-list-cell--kind">
                    <KindLabel kind={group.label} />
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>

      <p className="mac-note">
        The checkboxes are drawn rather than wired. Everything in this list is switched on and
        cannot be switched off, because this is a record of what gets used and not a control panel
        that changes anything.
      </p>
    </div>

    {/*
      The window's own status strip. It mirrors the markup MacWindow renders for a
      window-level strip, so the two look like the same object — this one belongs to
      the content because the counts belong to the content.
    */}
    <div className="mac-statusbar" data-chrome>
      <div className="mac-status-cell">{SKILLS.length} groups</div>
      <div className="mac-status-cell">{ITEM_COUNT} items</div>
      <div className="mac-status-cell">Selected Set: All Skills</div>
    </div>
  </>
);

export default ExtensionsWindow;
