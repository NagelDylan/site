/**
 * Résumé availability (spec §13).
 *
 * SERVER-ONLY — imports node:fs. Import this from .astro frontmatter or build
 * scripts, never from a React island. Islands should receive the resolved
 * `resumeHref` as a prop.
 *
 * The file itself is the switch: drop public/resume.pdf in place and every
 * download button on the site appears, with no code change. RESUME.force in
 * config.ts overrides the check in either direction.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { RESUME } from '../config';

export type ResumeState = {
  available: boolean;
  href: string;
  filename: string;
};

export function getResume(): ResumeState {
  const present = existsSync(join(process.cwd(), 'public', RESUME.path.replace(/^\//, '')));
  return {
    available: RESUME.force ?? present,
    href: RESUME.path,
    filename: RESUME.filename,
  };
}
