/**
 * Shapes for the fact layer.
 *
 * The fact layer is the single source of truth for every dated, named, or
 * linked claim on this site (spec §8, layer 1). All three presentation trees
 * read from it, and it is compiled into the chatbot's system prompt at build
 * time so the bot can never cite a stale job title.
 *
 * Nothing in here is theme-specific. Voice lives in voice.ts.
 */

/** A link we render. `verified` tracks the launch-pass link audit (spec Appendix). */
export type Link = {
  label: string;
  href: string;
  /**
   * False when the URL was inferred rather than given verbatim in the spec.
   * The launch pass must confirm every one of these by hand; consumers may
   * choose to hide unverified links. See LINK_AUDIT in ../config.ts.
   */
  verified: boolean;
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
  /** Which co-op term this was, if it was one. Apple is the 4th (spec §3). */
  coopTerm: 1 | 2 | 3 | 4 | null;
  /**
   * Shared verbatim across all three themes. Spec §2 is explicit: experience
   * bullets do not get three voices, because three drifting copies of a job
   * history is how a date goes stale in exactly one place.
   */
  bullets: string[];
  /** Single-paragraph alternative to bullets, used where a role has no bullets. */
  description: string | null;
  tags: string[];
  /** Extra context the site must show, e.g. Empathia's dual arrangement. */
  note: string | null;
  logo: string | null;
  /** Some roles deliberately have no outbound link (spec §4.4). */
  link: Link | null;
};

export type Project = {
  slug: string;
  name: string;
  /** One line, shared across themes; the voiced blurb lives in voice.ts. */
  summary: string;
  built: string;
  team: string;
  stack: string[];
  highlights: string[];
  /** Framing the site must not deviate from, e.g. FlowSense's no-award rule. */
  framing: string | null;
  links: Link[];
  media: {
    /** Animated WebP. Only ever loaded on intent — see MotionMedia. */
    animated: string;
    /** First frame. What actually ships on first paint, and the reduced-motion still. */
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
