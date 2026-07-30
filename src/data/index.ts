/**
 * One source of truth for every dated, named or linked claim on the site.
 *
 * Two easy mistakes: graduation is 2028 (the only 2027 is the Summer 2027 co-op
 * term in the availability line), and FlowSense placed nowhere at Hack the 6ix
 * 2024, so there is no award to mention anywhere.
 */
export type * from './types';

export { IDENTITY, SOCIALS, INTERESTS, PHOTO } from './identity';
export { ROLES, COOP_TERMS } from './experience';
export { FEATURED, SECONDARY, RECYCLE_BIN } from './projects';
export { EDUCATION, SKILLS } from './education';

import { FEATURED } from './projects';

export function projectBySlug(slug: string) {
  return FEATURED.find((p) => p.slug === slug);
}
