/**
 * Types for the data files: the single source of truth for every dated, named
 * or linked claim on the site. Wording lives in copy.ts.
 */

export type Link = {
  label: string;
  href: string;
};

export type Role = {
  slug: string;
  company: string;
  title: string;
  /** Human-readable span, e.g. "May 2026 – Aug 2026". */
  dates: string;
  /** Compact span for tight layouts, e.g. "May–Aug 2026". */
  datesShort: string;
  /** Sort key only — never displayed. Descending order across the timeline. */
  startISO: string;
  location: string;
  /** e.g. "Hybrid", "Remote". */
  arrangement: string;
  /** True while the role is ongoing. */
  current: boolean;
  /** Which co-op term this was, if it was one. Apple is the 4th. */
  coopTerm: 1 | 2 | 3 | 4 | null;
  bullets: string[];
  /** Single-paragraph alternative to bullets, used where a role has no bullets. */
  description: string | null;
  tags: string[];
  /** Extra context the site must show, e.g. Empathia's dual arrangement. */
  note: string | null;
  logo: string | null;
  /** Some roles deliberately have no outbound link. */
  link: Link | null;
};

export type Project = {
  slug: string;
  name: string;
  /** One line. The louder blurb lives in copy.ts. */
  summary: string;
  built: string;
  team: string;
  stack: string[];
  highlights: string[];
  /** Fixed wording for how a project gets framed, e.g. where it was built. */
  framing: string | null;
  links: Link[];
  media: {
    /** Animated WebP. Only ever loaded on intent — see MotionMedia. */
    animated: string;
    /** First frame: what ships on first paint, and the reduced-motion still. */
    poster: string;
    alt: string;
    width: number;
    height: number;
  } | null;
};

export type SecondaryProject = {
  name: string;
  stack: string[];
  oneLiner: string;
  links: Link[];
};

export type SkillGroup = {
  label: string;
  items: string[];
};

export type Education = {
  school: string;
  degree: string;
  program: string;
  location: string;
  dates: string;
  gpa: string;
  coursework: string[];
};
