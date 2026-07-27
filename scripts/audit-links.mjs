/**
 * Lists outbound links whose URLs were inferred rather than given verbatim in
 * the build spec, so the launch pass has a concrete checklist.
 *
 * Context (spec Appendix): nagelbros.com, youtube.com, and nageldylan.github.io
 * were all unreachable from the environment where the spec was compiled, so NO
 * outbound link on this site has been confirmed live. The six secondary repo
 * paths were additionally inferred from the folder names in the §19.9 wireframe.
 *
 * Reads the source as text rather than importing it, so it needs no TS loader.
 *
 * Usage: npm run audit:links
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = ['src/data/projects.ts', 'src/data/experience.ts', 'src/data/identity.ts'];

const found = [];
for (const rel of files) {
  let text;
  try {
    text = readFileSync(join(root, rel), 'utf8');
  } catch {
    continue;
  }
  const re = /\{\s*label:\s*'([^']*)',\s*href:\s*'([^']*)',\s*verified:\s*(true|false)\s*\}/g;
  for (const m of text.matchAll(re)) {
    found.push({ file: rel, label: m[1], href: m[2], verified: m[3] === 'true' });
  }
  // Bare URLs in identity/socials, which also want a click-through.
  for (const m of text.matchAll(/(https?:\/\/[^\s'"`]+)/g)) {
    if (!found.some((f) => f.href === m[1])) {
      found.push({ file: rel, label: '(bare)', href: m[1], verified: null });
    }
  }
}

const unverified = found.filter((f) => f.verified === false);

console.log(`\n  ${found.length} outbound links in the fact layer.\n`);
if (unverified.length) {
  console.log(`  ${unverified.length} marked verified: false — confirm each by hand:\n`);
  for (const f of unverified) console.log(`    [ ] ${f.href}\n          ${f.label} · ${f.file}`);
} else {
  console.log('  No links are marked unverified.');
}

console.log('\n  Also click through these before launch (never confirmed live):\n');
for (const f of found.filter((f) => f.verified !== false)) {
  console.log(`    [ ] ${f.href}`);
}
console.log('\n  When all boxes are ticked, set LINK_AUDIT_COMPLETE = true in src/config.ts.\n');
