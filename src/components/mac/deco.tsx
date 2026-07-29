/**
 * Platinum decoration, and the desktop Stickies note.
 *
 * The Mac counterpart to y2k/deco.tsx (spec §4.10), and deliberately much
 * smaller than it. This theme's decoration is *structural* — pinstripes, chiselled
 * bevels, 50% dither, hairlines — rather than ornamental, so there is no marquee,
 * no blink, no rainbow rule and nothing to un-invent here. Windows 98 shouts; the
 * Macintosh politely explains.
 *
 * ─── WHAT IT READS ───────────────────────────────────────────────────────────
 * `IDENTITY` (name, headline, location, availability) for `DeskNote`, and
 * `THEME_LABELS` for `ThemeRing`. Nothing else, and nothing invented (R5). The
 * availability line is rendered from the fact layer rather than retyped, which is
 * also what keeps R4 honest: the only 2027 on this desktop is the one
 * `IDENTITY.availability` puts there, in co-op-term context.
 *
 * ─── PRINT (G15) ─────────────────────────────────────────────────────────────
 * Ornament is marked `data-decorative` and `print.css` drops it globally.
 * `DeskNote` is the exception and it is the important one: it carries the single
 * most actionable fact on the site, so it is NOT decorative and must survive
 * print. Only its pushpin flourish is marked. Getting this backwards would mean a
 * printed copy of this theme with no availability line on it.
 */
import { IDENTITY } from '../../data';
import { THEMES } from '../../config';
import type { ThemeId } from '../../data/voice';
import { THEME_LABELS } from '../../lib/theme';

/**
 * A Stickies-note surface. Carries no opinion about its contents, so callers
 * decide whether what they put inside it is information or ornament.
 */
export const StickyNote = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={className ? `mac-sticky ${className}` : 'mac-sticky'}>{children}</div>;

/**
 * The active title bar's signature: 1px horizontal stripes, interrupted by a
 * plaque holding the label.
 *
 * The stripes are decorative and hidden from assistive tech; the label is real
 * text and is not, so a plaque used as a heading still reads and still prints.
 */
export const Pinstripes = ({ label }: { label?: string }) => (
  <div className="mac-pinstripes">
    <span className="mac-pinstripes-fill" data-decorative aria-hidden="true" />
    {label ? <span className="mac-pinstripes-plaque">{label}</span> : null}
    <span className="mac-pinstripes-fill" data-decorative aria-hidden="true" />
  </div>
);

/** The Mac's divider: one hairline, one pixel, no colour. */
export const Hairline = () => <hr className="mac-hairline" data-decorative />;

/**
 * Engraved ("chiselled") text — the era's heading treatment, a white shadow one
 * pixel down and right of dark type.
 *
 * A span rather than a heading element on purpose: callers own their own document
 * outline, and a decoration should never decide what level a heading is.
 */
export const Chiselled = ({ children }: { children: React.ReactNode }) => (
  <span className="mac-chiselled">{children}</span>
);

/** A Finder "Kind" cell. Real content, so it is not decorative. */
export const KindLabel = ({ kind }: { kind: string }) => (
  <span className="mac-kind">{kind}</span>
);

/**
 * The desktop Stickies note — REQUIRED FOR G10.
 *
 * G10 says every fact the paper site states must be reachable in this theme, and
 * that the availability line must be readable without opening anything. This note
 * is the piece of the desktop that no window ever covers (wm.ts starts its
 * cascade clear of it), which makes it the Mac's answer to the Y2K banner: same
 * job, one tenth the volume.
 *
 * The last line is load-bearing rather than flavour. A visitor who does not
 * realise the windows drag and that the menu bar is the navigation will read this
 * theme as a screenshot, and everything behind the menus stays undiscovered.
 */
export const DeskNote = () => (
  <StickyNote className="mac-desknote">
    {/* The only ornament on the note, so the only thing marked decorative. */}
    <span className="mac-desknote-pin" data-decorative aria-hidden="true" />
    <h1 className="mac-desknote-name">{IDENTITY.name}</h1>
    <p className="mac-desknote-headline">{IDENTITY.headline}</p>
    <p className="mac-desknote-line">{IDENTITY.location}</p>
    <p className="mac-desknote-avail">{IDENTITY.availability}</p>
    <p className="mac-desknote-hint">
      The windows really do move — drag one by its title bar. The menu bar along the top of the
      screen is the navigation.
    </p>
  </StickyNote>
);

/**
 * The other themes, offered quietly. The opposite number of the Y2K webring: no
 * arrows, no capitals, no ring, just a sentence and a plain button each.
 *
 * `data-decorative` for the same reason the webring is: a printed page of theme
 * switches is noise, and every fact this theme states is printed by the windows
 * themselves. It is not the accessible switcher either — that is the Control
 * Strip, which is always visible and reachable without opening a menu (G8).
 */
/*
 * The other installed themes, from THEMES in config.ts minus this one — rather
 * than a hand-written list, which is how the paper and Y2K switchers had both
 * drifted out of date. Hiding a theme is then a config edit and this ring follows.
 */
const OTHER_THEMES: readonly ThemeId[] = THEMES.filter((theme) => theme !== 'mac');

/*
 * Spelled out rather than printed as a numeral: this theme's copy is calm
 * sentence-case prose and "Same person, 3 websites." reads like a spec sheet.
 * Derived from the list so the sentence cannot outlive the count — the previous
 * version said "four websites" in a literal, which is exactly the sort of line
 * that goes quietly wrong when a theme is added or hidden. Falls back to the
 * numeral past five, at which point somebody has bigger problems than grammar.
 */
const COUNT_WORDS = ['no', 'one', 'two', 'three', 'four', 'five'] as const;
const themeCount = OTHER_THEMES.length + 1;
const countWord = COUNT_WORDS[themeCount] ?? String(themeCount);

export const ThemeRing = ({ onTheme }: { onTheme: (t: ThemeId) => void }) => (
  <div className="mac-themering" data-decorative>
    <span className="mac-themering-line">
      Same person, {countWord} websites. The others are still installed:
    </span>
    {OTHER_THEMES.map((theme) => (
      <button
        key={theme}
        type="button"
        className="mac-btn mac-btn--sm"
        onClick={() => onTheme(theme)}
        data-balloon={`Click here to switch to the ${THEME_LABELS[theme]} version of this site. Nothing reloads, and you keep your place.`}
      >
        {THEME_LABELS[theme]}
      </button>
    ))}
  </div>
);
