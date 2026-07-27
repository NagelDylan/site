/**
 * Automated check for the six hard rules in spec §0.
 *
 * Runs against user-visible copy: the fact layer, the voice layer, the compiled
 * chatbot prompt, and — if dist/ exists — the text content of every built page
 * with markup, script, and style stripped out.
 *
 * NOTE ON WHY THE PATTERNS ARE GENERIC: this repo is public. Listing the actual
 * §14 résumé-only figures here as a blocklist would republish them in exactly
 * the indexed, permanent form R1 exists to prevent. So the rules below match the
 * *shape* of a performance metric rather than specific values — which also
 * catches figures nobody has thought of yet.
 *
 * Usage: npm run check:rules   (exits non-zero on any violation)
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const violations = [];
const notes = [];

function flag(rule, file, detail) {
  violations.push({ rule, file, detail });
}

function walk(dir, ext, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, ext, out);
    else if (ext.some((e) => name.endsWith(e))) out.push(p);
  }
  return out;
}

/** Extracts human-readable text from built HTML. */
function htmlText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
}

/** Extracts single/double/backtick string literals from a TS source file. */
function stringLiterals(src) {
  const out = [];
  for (const m of src.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) {
    out.push(m[1] ?? m[2] ?? m[3] ?? '');
  }
  return out;
}

// ── Sources of user-visible copy ────────────────────────────────────────────
const copySources = [];

for (const rel of [
  'src/data/experience.ts',
  'src/data/projects.ts',
  'src/data/identity.ts',
  'src/data/education.ts',
  'src/data/voice.ts',
  'src/lib/fact-pack.ts',
]) {
  const p = join(root, rel);
  if (existsSync(p)) {
    // Strip comments first: the rule commentary itself discusses these patterns.
    const src = readFileSync(p, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/^\s*\/\/.*$/gm, ' ');
    copySources.push({ file: rel, text: stringLiterals(src).join('\n') });
  }
}

const distFiles = walk(join(root, 'dist'), ['.html']);
for (const p of distFiles) {
  copySources.push({ file: relative(root, p), text: htmlText(readFileSync(p, 'utf8')) });
}
if (distFiles.length === 0) {
  notes.push('dist/ not built — checked source copy only. Re-run after `npm run build`.');
}

// ── R1: no performance metrics ──────────────────────────────────────────────
// Shape-matched, not value-matched. Percentages, money, and counted audiences.
const METRIC_PATTERNS = [
  { re: /\b\d+(?:\.\d+)?\s?%/g, why: 'percentage' },
  { re: /(?<![A-Za-z])\$\s?\d/g, why: 'dollar figure' },
  { re: /\b(?:six|seven|eight)[- ]figure\b/gi, why: 'figure-count claim' },
  {
    re: /\b\d[\d,]*\+?\s*(?:users|customers|clients|subscribers|testers|beta[- ]testers|visitors|views|downloads|installs|signups|sign-ups|businesses|emails\/(?:yr|year)|annual emails)\b/gi,
    why: 'audience or volume count',
  },
  {
    re: /\b(?:increased|improved|reduced|decreased|grew|boosted|cut|saved)\b[^.]{0,40}\b\d+(?:\.\d+)?\s?%/gi,
    why: 'impact claim with a figure',
  },
];

// Approved technical scope (§4.2, §3) that must NOT be flagged.
const SCOPE_ALLOWLIST = [
  /\broughly 60 destination categories\b/i,
  /\b3,000\+? ?line\b/i,
  /\bGPA 3\.9\b/i,
  /\b3\.9\b/,
  /\b60 (?:email )?(?:destination )?categories\b/i,
];

for (const { file, text } of copySources) {
  for (const { re, why } of METRIC_PATTERNS) {
    for (const m of text.matchAll(re)) {
      const snippet = text.slice(Math.max(0, m.index - 60), m.index + m[0].length + 60).trim();
      if (SCOPE_ALLOWLIST.some((a) => a.test(m[0]))) continue;
      flag('R1', file, `${why}: "${m[0].trim()}" — …${snippet}…`);
    }
  }
}

// ── R2: FlowSense won no award ──────────────────────────────────────────────
const AWARD_WORDS =
  /\b(?:1st|first|second|third)\s+place\b|\baward[- ]?winning\b|\bwon\b|\bwinner\b|\bplaced\s+(?:1st|first|second|third)\b|\btrophy\b|\bprize\b|\bmedal(?:led|ed)?\b|\bchampion\b|🏆/gi;

for (const { file, text } of copySources) {
  for (const m of text.matchAll(AWARD_WORDS)) {
    const window = text.slice(Math.max(0, m.index - 300), m.index + 300);
    // Only a violation when it sits near hackathon/project context. The prompt's
    // own corrective instructions ("never say it won") legitimately use the word.
    const nearProject = /flowsense|hack the|hackathon/i.test(window);
    const isCorrective =
      /never|not|no placement|did not|didn't|placed nowhere|correct them|wrongly|do not/i.test(
        window,
      );
    if (nearProject && !isCorrective) {
      flag('R2', file, `award language near project context: "${m[0]}" — …${window.slice(240, 360).trim()}…`);
    }
  }
}
// Hack the North must never appear as a FlowSense venue (the real event is Hack the 6ix).
for (const { file, text } of copySources) {
  if (/hack the north/i.test(text) && !/wrongly|never|correct|not\b/i.test(text)) {
    flag('R2', file, 'mentions "Hack the North" — FlowSense was Hack the 6ix 2024');
  }
}

// ── R3: Apple boundary ─────────────────────────────────────────────────────
const APPROVED_APPLE =
  'Working in security engineering: developing dispatch software, building prompt evaluation platforms, enriching data pipelines, and running agentic performance evaluations to drive LLM improvements.';
const expFile = join(root, 'src/data/experience.ts');
if (existsSync(expFile)) {
  const src = readFileSync(expFile, 'utf8');
  if (!src.includes(APPROVED_APPLE)) {
    flag('R3', 'src/data/experience.ts', 'APPLE_DESCRIPTION no longer matches the approved §4.1 wording');
  }
}
// The held file must never be referenced anywhere in the repo.
for (const p of walk(join(root, 'src'), ['.ts', '.tsx', '.astro', '.css', '.md']).concat(
  walk(join(root, 'scripts'), ['.mjs', '.sh']),
)) {
  const src = readFileSync(p, 'utf8');
  if (/apple-experience-HELD/i.test(src) && !p.endsWith('check-rules.mjs')) {
    flag('R3', relative(root, p), 'references the held Apple file by name — must not enter the repo');
  }
}

// ── R4: graduation year is 2028 ─────────────────────────────────────────────
// The only legitimate 2027 on this site is the Summer 2027 co-op *work term*.
// A violation is 2027 attached to a degree date, or 2027 with no term context at
// all. Corrective language ("graduation is 2028, never 2027") is not a violation
// — the chatbot prompt has to be able to state the rule.
const GRAD_2027 =
  /(?:graduat\w*|expected|class of|degree|bachelor|bcs)[^.]{0,30}2027|2027[^.]{0,30}graduat/i;

for (const { file, text } of copySources) {
  for (const m of text.matchAll(/2027/g)) {
    const window = text.slice(Math.max(0, m.index - 140), m.index + 140);
    const isTerm = /summer 2027|co-?op|work term|term availability/i.test(window);
    const isCorrective = /never|not a graduation|2028|do not conflate|rather than/i.test(window);
    if (GRAD_2027.test(window) && !isCorrective) {
      flag('R4', file, `2027 attached to a degree date — …${window.trim()}…`);
    } else if (!isTerm && !isCorrective) {
      flag('R4', file, `bare "2027" with no co-op-term context — …${window.trim()}…`);
    }
  }
  if (/expected\s+2027/i.test(text)) flag('R4', file, '"Expected 2027" — graduation is 2028');
}

// ── Availability line must be present in built output ───────────────────────
if (distFiles.length) {
  const missing = distFiles.filter((p) => {
    const t = htmlText(readFileSync(p, 'utf8'));
    return !/summer 2027/i.test(t);
  });
  for (const p of missing) {
    notes.push(`${relative(root, p)} does not mention the Summer 2027 availability line`);
  }
}

// ── Report ─────────────────────────────────────────────────────────────────
console.log('\n  §0 hard-rule check\n');
if (notes.length) {
  for (const n of notes) console.log(`  note   ${n}`);
  console.log('');
}
if (violations.length === 0) {
  console.log(`  PASS — no violations across ${copySources.length} copy sources.\n`);
  process.exit(0);
}
const byRule = {};
for (const v of violations) (byRule[v.rule] ??= []).push(v);
for (const rule of Object.keys(byRule).sort()) {
  console.log(`  ${rule} — ${byRule[rule].length} violation(s)`);
  for (const v of byRule[rule]) console.log(`     ${v.file}\n       ${v.detail}`);
  console.log('');
}
console.log(`  FAIL — ${violations.length} violation(s).\n`);
process.exit(1);
