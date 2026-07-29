/**
 * The Projects folder, as a real Finder window in list view (spec §4.11).
 *
 * WHAT IT IS: the Mac's answer to `y2k/ProjectsExplorer.tsx`. That window is a
 * tree pane and an icon grid with a `C:\Projects\` status bar; this one is the
 * other side of the aisle — a list view with Name / Kind / Size / Last Modified
 * columns, a disclosure triangle per row, and folders that reveal their contents
 * in place. FEATURED are folders. SECONDARY live inside a nested `Archive` folder,
 * because a one-liner and a repo link do not deserve a window each.
 *
 * WHAT IT READS: FEATURED, SECONDARY and RECYCLE_BIN from the fact layer, and
 * `VOICES.mac.projectBlurbs` for the sentence inside an expanded row. Every name,
 * summary, stack and link is printed straight from src/data.
 *
 * ─── R1 IS THE RULE THIS FILE GUARDS ─────────────────────────────────────────
 * A Finder list view has a Size column and a date column, and both are places
 * where a number could quietly start reading as an achievement. So:
 *   • Sizes are machine fiction, computed from how many entries a project has in
 *     its `stack` and `highlights` arrays. They are file sizes in the same sense
 *     that this is a Macintosh.
 *   • Last Modified is the year out of `built` — a fact already on the site —
 *     never a fabricated day or hour, and never a duration.
 *   • Rows with no date in the fact layer show an em dash rather than a guess
 *     (R5). The archived projects genuinely carry no date, so that column is
 *     empty for them and the footnote says why.
 *   • A visible footnote states that the two columns measure nothing.
 * No percentage, no currency, no audience count, and nothing here is a score.
 *
 * The Trash list at the bottom of this file holds exactly RECYCLE_BIN and nothing
 * else. MedicalClinic and the old portfolio repo are excluded from that list in
 * the fact layer deliberately and must never be surfaced anywhere on this site,
 * not even as a joke.
 */
import { Fragment, useState } from 'react';
import { FEATURED, RECYCLE_BIN, SECONDARY } from '../../../data';
import { VOICES } from '../../../data/voice';
import type { IconName } from '../Icon';
import Icon from '../Icon';
import { KindLabel } from '../deco';

const blurbs = VOICES.mac.projectBlurbs;

/**
 * Bytes on disk, for a disk that does not exist.
 *
 * Deterministic so the column does not twitch between renders, and derived from
 * array lengths so it cannot accidentally encode anything about how the project
 * was received. `units` is a count of items in the fact layer; the K is costume.
 */
const sizeOnDisk = (units: number): string => `${units}K`;

/** Featured projects: one unit per stack entry, one per highlight. */
const featuredUnits = (stack: number, highlights: number): number => stack * 12 + highlights * 4;

/**
 * The year out of a `built` string, e.g. "Oct – Nov 2025" → "2025".
 *
 * The last year in the string rather than the first: "2023 – 2024" was last
 * touched in 2024, and a Last Modified column that reported the earlier date
 * would be wrong in the one way this column can be wrong. Returns an em dash
 * when there is no year to read, because inventing one would break R5.
 */
const yearFrom = (text: string): string => {
  const years = text.match(/\b(?:19|20)\d{2}\b/g);
  return years?.[years.length - 1] ?? '—';
};

type RowProps = {
  name: string;
  kind: string;
  size: string;
  modified: string;
  icon: IconName;
  /** 0 for a top-level row, 1 for a row inside the Archive folder. */
  depth?: 0 | 1;
  selected?: boolean;
  /** Present when the row has a disclosure triangle. */
  open?: boolean;
  onToggle?: () => void;
  /** Id of the detail row this triangle discloses, for `aria-controls`. */
  detailId?: string;
  /** Present when the row can be opened into a Get Info window. */
  onOpen?: () => void;
  onSelect?: () => void;
};

/**
 * One row of the list view, shared by the Projects window and the Trash so that
 * "the same list view" is literally true rather than approximately true.
 *
 * The interaction split is the Finder's, and it is worth the extra state: the
 * triangle discloses, the name selects on a single click and opens on a double
 * click. Return opens too, and `preventDefault` there stops the browser's
 * synthetic click from also firing — without it, one keystroke would both select
 * and open, which is harmless but reads as a double action to a screen reader.
 */
const ListRow = ({
  name,
  kind,
  size,
  modified,
  icon,
  depth = 0,
  selected,
  open,
  onToggle,
  detailId,
  onOpen,
  onSelect,
}: RowProps) => (
  <tr className="mac-list-row" data-depth={depth} data-selected={selected || undefined}>
    <td className="mac-list-cell mac-list-cell--name">
      {onToggle ? (
        <button
          type="button"
          className="mac-disclosure"
          aria-expanded={open ?? false}
          aria-controls={detailId}
          aria-label={`${open ? 'Hide' : 'Show'} more about ${name}`}
          data-balloon="Click this triangle to see what is inside, without opening a second window."
          onClick={onToggle}
        />
      ) : (
        <span className="mac-disclosure mac-disclosure--none" aria-hidden="true" data-decorative />
      )}
      <span className="mac-list-icon" aria-hidden="true">
        <Icon name={icon} />
      </span>
      {onOpen ? (
        <button
          type="button"
          className="mac-list-name"
          onClick={onSelect}
          onDoubleClick={onOpen}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            onOpen();
          }}
          data-balloon="Double-click a name to open its Get Info window. Selecting it and pressing Return does the same."
        >
          {name}
        </button>
      ) : (
        <span className="mac-list-name mac-list-name--plain">{name}</span>
      )}
    </td>
    <td className="mac-list-cell mac-list-cell--kind">
      <KindLabel kind={kind} />
    </td>
    <td className="mac-list-cell mac-list-cell--size">{size}</td>
    <td className="mac-list-cell mac-list-cell--date">{modified}</td>
  </tr>
);

/** The column strip. A real `<thead>`, so the columns are columns to a screen reader. */
const ListColumns = () => (
  <thead>
    <tr className="mac-list-cols">
      <th scope="col" className="mac-list-col mac-list-col--name">
        Name
      </th>
      <th scope="col" className="mac-list-col">
        Kind
      </th>
      <th scope="col" className="mac-list-col">
        Size
      </th>
      <th scope="col" className="mac-list-col">
        Last Modified
      </th>
    </tr>
  </thead>
);

/** Total fictional size of the Archive folder: the sum of what is inside it. */
const archiveUnits = SECONDARY.reduce((total, project) => total + project.stack.length * 9, 0);

const FinderWindow = ({ onOpenProject }: { onOpenProject: (slug: string) => void }) => {
  /**
   * Expansion is a set of row ids rather than one id: opening a second triangle
   * must not close the first, which is what a Finder list view does and what makes
   * it useful for comparing two projects side by side.
   */
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const isOpen = (id: string) => expanded.includes(id);
  const toggle = (id: string) =>
    setExpanded((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  /** Top-level rows: the featured folders, plus the Archive folder. */
  const itemCount = FEATURED.length + 1;

  return (
    <div className="mac-client mac-finder">
      {/* The Finder's info bar. The right-hand cell is where free space used to
          sit; a Zip disk is the joke, and it deliberately carries no number. */}
      <div className="mac-finder-head" data-chrome>
        <span className="mac-finder-count">{itemCount} items</span>
        <span className="mac-finder-space" data-decorative aria-hidden="true">
          zip available
        </span>
      </div>

      <p className="mac-note">
        Click a triangle to read about a project without leaving this window. Double-click a name
        — or select it and press Return — to open its Get Info window.
      </p>

      <div className="mac-list-well mac-scroll">
        <table className="mac-list">
          <ListColumns />
          <tbody>
            {FEATURED.map((project) => {
              const id = `featured:${project.slug}`;
              const detailId = `mac-finder-detail-${project.slug}`;
              const open = isOpen(id);
              const blurb =
                project.slug in blurbs ? blurbs[project.slug as keyof typeof blurbs] : null;
              /**
               * A keyed Fragment, not `<>`: a row and its detail row are two
               * siblings in one `<tbody>`, and React needs the key on whatever the
               * map returns. `<>` cannot take one.
               */
              return (
                <Fragment key={id}>
                  <ListRow
                    name={project.name}
                    kind="folder"
                    size={sizeOnDisk(featuredUnits(project.stack.length, project.highlights.length))}
                    modified={yearFrom(project.built)}
                    icon={open ? 'folderOpen' : 'folder'}
                    selected={selected === id}
                    open={open}
                    onToggle={() => toggle(id)}
                    detailId={detailId}
                    onSelect={() => setSelected(id)}
                    onOpen={() => onOpenProject(project.slug)}
                  />
                  {open ? (
                    <tr className="mac-list-detail" id={detailId}>
                      <td colSpan={4}>
                        <div className="mac-list-detail-body">
                          <p>{project.summary}</p>
                          {blurb ? <p>{blurb}</p> : null}
                          <button
                            type="button"
                            className="mac-btn mac-btn--sm"
                            onClick={() => onOpenProject(project.slug)}
                            data-balloon="Click here to open the Get Info window for this project."
                          >
                            Get Info
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}

            {/*
              The Archive folder. Its triangle reveals sibling rows rather than a
              detail panel, which is the one thing a folder in a list view does
              differently — and the reason it carries no `detailId`: there is no
              single element for `aria-controls` to point at, and pointing it at an
              id that does not exist is worse than leaving it off.
            */}
            <ListRow
              name="Archive"
              kind="folder"
              size={sizeOnDisk(archiveUnits)}
              modified="—"
              icon={isOpen('archive') ? 'folderOpen' : 'folder'}
              open={isOpen('archive')}
              onToggle={() => toggle('archive')}
            />

            {isOpen('archive')
              ? SECONDARY.map((project) => {
                  const id = `archive:${project.name}`;
                  const detailId = `mac-finder-detail-${project.name.replace(/\s+/g, '-')}`;
                  const open = isOpen(id);
                  return (
                    <Fragment key={id}>
                      <ListRow
                        name={project.name}
                        kind="document"
                        size={sizeOnDisk(project.stack.length * 9)}
                        modified="—"
                        icon="doc"
                        depth={1}
                        open={open}
                        onToggle={() => toggle(id)}
                        detailId={detailId}
                      />
                      {open ? (
                        <tr className="mac-list-detail" id={detailId}>
                          <td colSpan={4}>
                            <div className="mac-list-detail-body" data-depth={1}>
                              <p>{project.oneLiner}</p>
                              <p className="mac-note">{project.stack.join(' · ')}</p>
                              <p className="mac-links">
                                {project.links.map((link) => (
                                  <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                  >
                                    {link.label}
                                  </a>
                                ))}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>

      <p className="mac-note">
        Size and Last Modified are the file system talking. The sizes are counted off each
        project&rsquo;s stack and highlights, the dates are the year the thing was built, and
        neither column measures anything. The archived projects carry no date in the fact layer, so
        that column stays empty for them rather than guessing. The headings are labels rather than
        buttons: the list keeps the order the fact layer gives it.
      </p>
    </div>
  );
};

/**
 * The Trash, in the same list view (spec §4.11).
 *
 * Four names, no links, no descriptions — the joke is that they are in the bin,
 * and inventing detail about them would break R5 anyway. There is no `mac-client`
 * wrapper here: App.tsx renders this inside its own well, and supplies the
 * window's status strip.
 *
 * Restore is disabled on purpose. Nothing in this theme deletes anything, so a
 * working Restore would be a button that undoes an action nobody took.
 */
export const TrashList = () => (
  <>
    <p className="mac-note">
      These are the ideas that did not make the cut. They are in the Trash deliberately, the
      Trash is never emptied, and Restore is unavailable for the same reason.
    </p>

    <div className="mac-list-well">
      <table className="mac-list">
        <ListColumns />
        <tbody>
          {RECYCLE_BIN.map((name) => (
            <ListRow
              key={name}
              name={name}
              kind="shelved document"
              size={sizeOnDisk(name.length * 3)}
              modified="—"
              icon="doc"
            />
          ))}
        </tbody>
      </table>
    </div>

    <div className="mac-btn-row">
      <button type="button" className="mac-btn" disabled aria-disabled="true">
        Restore
      </button>
    </div>
  </>
);

export default FinderWindow;
