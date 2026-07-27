/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  FACT LAYER — single source of truth for this site (spec §8, layer 1).    ║
 * ║                                                                           ║
 * ║  Read by all three presentation trees AND compiled into the chatbot's     ║
 * ║  system prompt at build time (see src/lib/fact-pack.ts), so the bot can   ║
 * ║  never cite a stale job title.                                            ║
 * ║                                                                           ║
 * ║  BEFORE YOU EDIT ANY COPY, THE SIX HARD RULES (spec §0). These are not    ║
 * ║  preferences; violating them causes real harm.                            ║
 * ║                                                                           ║
 * ║  R1  No performance metrics anywhere on the site. No percentages, dollar  ║
 * ║      figures, or user counts. They live on the résumé only. Technical     ║
 * ║      scope (≈60 email categories, a 3,000-line file, GPA 3.9) is NOT a    ║
 * ║      performance metric and is approved copy.                             ║
 * ║  R2  FlowSense won no award. Built at Hack the 6ix 2024, placed nowhere.  ║
 * ║      Never claim a placement, prize, trophy, or badge.                    ║
 * ║  R3  Apple content is limited to APPLE_DESCRIPTION in experience.ts, and  ║
 * ║      nothing more. No project names, internal tooling, URLs, or scale     ║
 * ║      claims. Held material lives outside this repo and must never enter   ║
 * ║      it or any prompt.                                                    ║
 * ║  R4  Graduation year is 2028. Never 2027. The only 2027 on this site is   ║
 * ║      the Summer 2027 co-op *term* availability line.                      ║
 * ║  R5  Never invent facts. Every claim traces to the build spec. If it is   ║
 * ║      not in here, ask Dylan — do not gap-fill.                            ║
 * ║  R6  The chatbot inherits R1–R5.                                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
export type * from './types';

export { IDENTITY, SOCIALS, INTERESTS, PHOTO } from './identity';
export { ROLES, APPLE_DESCRIPTION, COOP_TERMS, EXPERIENCE_EXCLUSIONS } from './experience';
export { FEATURED, SECONDARY, RECYCLE_BIN } from './projects';
export { EDUCATION, SKILLS } from './education';

import { FEATURED } from './projects';

/** Featured project lookup for the /projects/:slug routes (§8). */
export function projectBySlug(slug: string) {
  return FEATURED.find((p) => p.slug === slug);
}

/** Slugs for Astro's getStaticPaths, so routes and data can never disagree. */
export const FEATURED_SLUGS = FEATURED.map((p) => p.slug);
