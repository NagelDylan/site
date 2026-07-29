/**
 * Résumé availability (spec §13).
 *
 * SERVER-ONLY — imports node:fs. Import this from .astro frontmatter or build
 * scripts, never from a React island. Islands receive the resolved ResumeState
 * object as a prop (ThemeAppProps.resume), which is why every href a theme could
 * possibly need is precomputed here.
 *
 * The file itself is the switch: drop public/resume.pdf in place and every
 * download button, the /resume viewer page and its nav link all appear, with no
 * code change. RESUME.force in config.ts overrides the check in either direction.
 * Both of those properties are load-bearing — preserve them if you touch this.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { RESUME } from '../config';

export type ResumeState = {
  available: boolean;
  /** Download target — the bare file, no open parameters. */
  href: string;
  /** href + RESUME.viewParams, for <object data=...>. */
  viewHref: string;
  /** RESUME.page — the canonical /resume route. */
  page: string;
  filename: string;
};

export function getResume(): ResumeState {
  const present = existsSync(join(process.cwd(), 'public', RESUME.path.replace(/^\//, '')));
  return {
    available: RESUME.force ?? present,
    href: RESUME.path,
    // Composed here, once, so no theme has to know the PDF open-parameter syntax
    // and no download link accidentally ships the #view fragment on it.
    viewHref: `${RESUME.path}${RESUME.viewParams}`,
    page: RESUME.page,
    filename: RESUME.filename,
  };
}
