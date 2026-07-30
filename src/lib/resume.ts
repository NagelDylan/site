/**
 * Is there a résumé to show?
 *
 * Server-only: imports node:fs, so call it from .astro frontmatter and pass the
 * result into the island. Every href it might need is precomputed for that
 * reason. Drop public/resume.pdf in place and the icon, Start menu entry and
 * window all appear; RESUME.force in config.ts overrides the check either way.
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
  filename: string;
};

export function getResume(): ResumeState {
  const present = existsSync(join(process.cwd(), 'public', RESUME.path.replace(/^\//, '')));
  return {
    available: RESUME.force ?? present,
    href: RESUME.path,
    // Composed here, once, so the window never has to know the PDF
    // open-parameter syntax and the download link can never inherit the #view
    // fragment.
    viewHref: `${RESUME.path}${RESUME.viewParams}`,
    filename: RESUME.filename,
  };
}
