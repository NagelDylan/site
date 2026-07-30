/** Every dated, named or linked claim on the site comes from these files. */
export type * from './types';

export { IDENTITY, SOCIALS, PHOTO } from './identity';
export { ROLES, COOP_TERMS } from './experience';
export { FEATURED, SECONDARY, RECYCLE_BIN } from './projects';
export { EDUCATION, SKILLS } from './education';

import { FEATURED } from './projects';

export function projectBySlug(slug: string) {
  return FEATURED.find((p) => p.slug === slug);
}
