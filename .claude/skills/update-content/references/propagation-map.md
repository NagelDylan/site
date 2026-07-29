# Propagation map

**This map is a starting point. The grep in SKILL.md step 1 is the source of truth.**
Paths marked *(pending)* belong to the `mac` theme, which is being built in parallel —
see `.claude/specs/mac-theme.md`. Do not edit those files as part of a content change
while that build is in flight; note what needs doing and say so.

---

## Change-type → propagation table

### Identity, contact, availability — `src/data/identity.ts`

`IDENTITY.availability` is the most widely fanned-out string on the site. `IDENTITY.name`,
`.headline`, `.location`, `.email`, `SOCIALS`, `INTERESTS`, `PHOTOS` follow the same
paths.

| Lands in | Files |
|---|---|
| paper | `src/pages/index.astro` (hero), `src/pages/contact.astro`, `src/pages/experience.astro` (uses `availabilityShort`), `src/components/paper/PaperLayout.astro` (brand/footer), `src/pages/about.astro` |
| y2k | `content/WelcomeWindow.tsx`, `content/AboutWindow.tsx`, `content/ContactWindow.tsx`, `content/EducationWindow.tsx`, `content/panels.tsx`, `deco.tsx` (`MARQUEE_TEXT` uppercases it), `Clippy.tsx`, **`Mobile.tsx`** |
| mac | `content/ReadMeWindow.tsx`, `content/AboutWindow.tsx`, `content/MailWindow.tsx`, `deco.tsx` (`DeskNote` — the G10 always-visible carrier), **`Mobile.tsx`** *(all pending)* |
| chat | `Widgets.tsx` (contact card), `Message.tsx`, `RecruiterCapture.tsx`, `ChatUnavailable.tsx`, `src/lib/chat/stub-transport.ts` |
| everywhere else | `src/components/shared/Splash.astro` (name + headline + availability, so a visitor who never picks a theme still sees it), `src/components/shared/BaseHead.astro` (`author`, `og:site_name`, `og:image:alt`, JSON-LD `seeks.name`), `src/lib/fact-pack.ts` (Identity block, and `IDENTITY.email` inline in the prompt), `CANONICAL.metaDescription` in `src/data/voice.ts` |

**Two literal paraphrases exist and must be updated by hand:**

- `src/pages/index.astro` — the contact card reads *"I'm looking for a Summer 2027
  co-op."* It is not interpolated.
- `CANONICAL.metaDescription` in `src/data/voice.ts` ends with *"Seeking a Summer 2027
  software engineering co-op."*

Changing the availability line and missing either of those leaves the term wrong in the
paper hero column and in every page's `<meta name="description">`.

Also: `IDENTITY.availabilityShort` is a separate field. Both need editing, together.

**The checker will bite.** R4 flags a bare `2027` with no co-op/work-term context within
±140 characters, and separately *notes* any built page that does not mention "summer
2027". If the term year changes, the R4 rule in `scripts/check-rules.mjs` (`GRAD_2027`,
the `isTerm` regex, the availability-presence check) hardcodes `2027`/`summer 2027` and
must change with it. That is a deliberate checker edit, in the same commit.

**Phone numbers and other socials are deliberately absent** and must not be added — see
the header of `src/data/identity.ts`. The chatbot prompt states this too.

---

### A role: added, ended, retitled, or bullets edited — `src/data/experience.ts`

Nearly everything here is derived, which is the point. Edit `ROLES` and:

| Lands in | How |
|---|---|
| paper | `src/pages/experience.astro` → `src/components/paper/RoleCard.astro` (renders `bullets` verbatim — it must not rephrase or truncate); `src/pages/index.astro` condensed timeline |
| y2k | `content/ExperienceWindow.tsx`, `Mobile.tsx` |
| mac | `content/WorkWindow.tsx`, `Mobile.tsx` *(pending)* |
| chat | `src/lib/fact-pack.ts` Experience block (automatic) |
| meta | `BaseHead.astro` JSON-LD `jobTitle` + `worksFor` from `ROLES.find(r => r.current)` |

**Manual follow-ups a role change requires:**

1. **`current: true`** — exactly one role should have it, or `BaseHead.astro`'s
   `jobTitle`/`worksFor` and `CANONICAL.bioShort` ("currently a software developer
   intern at Apple") disagree with the timeline.
2. **`CANONICAL.bioShort`** in `src/data/voice.ts` names the current employer. So do
   `PAPER.bioShort` (aliased to `CANONICAL`), `Y2K.bioShort` and `CHAT.bioShort` — all
   three name Apple, Carta and Empathia.ai independently.
3. **`COOP_TERMS`** in the same file — the term map, consumed by `ExperienceWindow.tsx`,
   `Mobile.tsx`, `Clippy.tsx` (`COOP_TERMS.length`) and the fact pack. A fifth term
   means widening `Role['coopTerm']` in `src/data/types.ts` from `1 | 2 | 3 | 4 | null`.
4. **"four co-op terms"** is written out as prose in `bioLong` in all voices, in
   `src/lib/chat/stub-transport.ts` (several replies), and in the fact pack's heading
   `## Co-op terms (four so far)` and its R1 scope carve-out. A fifth term makes every
   one of those wrong. Grep: `rg -ni 'four co-op|fourth co-op|four terms'`.
5. **`src/pages/experience.astro`** has a hardcoded meta description naming Apple, Carta
   and Empathia.ai and asserting "Four co-op terms". Not interpolated.
6. **`src/lib/chat/stub-transport.ts`** hand-writes role dates, locations, "partway
   through his fourth co-op term, at Apple in Cupertino, through August 2026", and a
   reverse-chronological summary reply. None of it is derived.
7. **`EXPERIENCE_EXCLUSIONS`** documents what is deliberately *not* in `ROLES`. If a
   role is being added that is on that list, the exclusion was a decision — ask.

### The Apple role specifically (R3)

`APPLE_DESCRIPTION` is one exported string and is designed to be swapped in one place.
But:

- **`scripts/check-rules.mjs` asserts the exact string** (`APPROVED_APPLE`) and fails if
  `src/data/experience.ts` no longer contains it. Changing the wording means changing
  that constant in the same commit. Do it because the wording was *approved*, never to
  silence a failure.
- Nothing may be added around it: no project names, no internal tooling, no URLs, no
  scale claims, no enthusiasm. Each tree renders it plainly —
  `y2k/content/ExperienceWindow.tsx` keys off `role.company === 'Apple'` for the
  `.y2k-role--plain` treatment; the mac tree mirrors that.
- **No Apple logo, ever** (trademark). `logo: null` on the role is load-bearing, and
  `y2k/Icon.tsx` carries a comment saying there is no apple shape in the file and never
  may be. The mac theme's menu-bar mark is a deliberately non-fruit rainbow lozenge for
  the same reason.
- `check-rules.mjs` also fails if any file in `src/` or `scripts/` mentions the held
  Apple material file by name. Held material lives outside this repo and must never
  enter it, a commit message, or a prompt.

---

### A featured project — `FEATURED` in `src/data/projects.ts`

| Lands in | Files |
|---|---|
| paper | `src/pages/projects/index.astro`, `src/pages/projects/[slug].astro` (`getStaticPaths` over `FEATURED`), `src/pages/index.astro`, `src/components/paper/ProjectCard.astro` |
| y2k | `content/ProjectsExplorer.tsx`, `content/ProjectWindow.tsx`, `Taskbar.tsx` (Start → Programs lists each project), `Boot.tsx` (`FEATURED.length`), `Mobile.tsx` |
| mac | `content/FinderWindow.tsx`, `content/GetInfoWindow.tsx`, `MenuBar.tsx` (File → Get Info ▸), `Boot.tsx`, `Mobile.tsx` *(pending)* |
| chat | `ProjectCard.tsx`, `src/lib/fact-pack.ts` (automatic) |

**Adding or renaming a featured project is a slug change** — see below. It is the most
invasive content edit in the repo.

`framing` is a hard field: FlowSense's `'Built at Hack the 6ix 2024.'` is the R2 guard
and every tree renders it as stored. Never soften, extend, or drop it.

`media` is optional but if present must be a poster + animated pair produced by
`scripts/optimize-assets.sh` from `assets-src/`. **`assets-src/` holds the only surviving
copies of those files and cannot be re-fetched** (README, Assets). No new artwork can be
produced here — a new project ships without media rather than with a placeholder.

### A secondary project — `SECONDARY`

Much smaller fan-out: `src/pages/projects/index.astro`, `y2k/content/ProjectsExplorer.tsx`
(Archive folder), `y2k/Boot.tsx` (`SECONDARY.length`), `y2k/Mobile.tsx`,
`mac/content/FinderWindow.tsx` *(pending)*, and the fact pack. No route, no slug, no
detail page. New links here default to `verified: false`.

`RECYCLE_BIN` is a four-item joke list rendered in `y2k/content/ProjectsExplorer.tsx`,
`y2k/Mobile.tsx` and `mac/content/FinderWindow.tsx`'s `TrashList` *(pending)*. The
comment in `projects.ts` names two repos that must **not** be surfaced anywhere,
including the gag.

---

### Skills — `SKILLS` in `src/data/education.ts`

`src/pages/about.astro`, `y2k/content/SkillsWindow.tsx`, `y2k/Mobile.tsx`,
`mac/content/ExtensionsWindow.tsx` *(pending)*, `src/lib/fact-pack.ts`.

No proficiency tiers, star ratings, percentages, or "expert/intermediate" labels — a
percentage here is a straight R1 failure. Four technologies were cut by Dylan's decision
and the file names them; do not reinstate. `BaseHead.astro`'s JSON-LD `knowsAbout` is a
separate, deliberately short hand-curated list — it is not `SKILLS`.

### Education — `EDUCATION` in `src/data/education.ts`

`src/pages/about.astro`, `src/pages/experience.astro`, `y2k/content/EducationWindow.tsx`,
`y2k/content/ExperienceWindow.tsx` (footer line), `y2k/Mobile.tsx`,
`mac/content/SystemWindow.tsx` *(pending)*, `BaseHead.astro` (`alumniOf`),
`src/lib/fact-pack.ts`.

`dates` is `'Sep 2023 – Expected 2028'`. **R4: never 2027 here.** `check-rules.mjs` has
a dedicated `'Expected 2027'` check on top of the general one. `gpa: '3.9'` is approved
copy (allowlisted) and is not an R1 metric — do not strip it. `src/lib/chat/stub-transport.ts`
restates the degree, program, span, GPA and coursework as literals.

---

### Voice-layer copy — `src/data/voice.ts`

Scope is deliberately narrow: `greeting`, `heroSub`, `ctaPrimary`, `ctaSecondary`,
`bioShort`, `bioLong`, `headings`, `projectBlurbs`. **Nothing else gets a per-theme
voice** — experience bullets and education are shared verbatim, because three (now four)
drifting copies of a job history is how a date goes stale in exactly one place.

When you change a voiced string, decide explicitly:

- **Is the underlying fact the same in every voice?** It must be. The voices differ in
  register only. If you fix a fact in `PAPER.bioLong`, the same fact is wrong in `Y2K`,
  `MAC` *(pending)* and `CHAT` — fix all of them in the same edit.
- **Is it purely tonal?** Then it is legitimately one-voice-only. Rewriting the Y2K
  greeting does not touch paper.

`CANONICAL` sits above the voices: it is the paper register, used where voice must not
vary (meta description, OG description, JSON-LD `description`). `PAPER.bioShort` is
aliased to `CANONICAL.bioShort`; the other voices restate the same facts in their own
register and are **not** aliased.

`STARTER_PROMPTS` (four exact strings) feeds `chat/StarterPrompts.tsx`. Changing one
changes what the stub transport is asked — check the matchers in
`src/lib/chat/stub-transport.ts` still fire.

### Headings — `voice.headings`

Consumers: `src/pages/{about,contact}.astro`, `y2k/content/{AboutWindow,ExperienceWindow,
SkillsWindow,EducationWindow,WelcomeWindow}.tsx`, `y2k/Mobile.tsx`, and the mac content
windows *(pending)*.

**Two places restate headings and will drift:**

1. **`WINDOW_DEFS` in `src/components/y2k/wm.ts`** hardcodes window titles —
   `'JOBS I HAVE HAD — WordPad'`, `'ABOUT ME!! — Notepad'`, `'Control Panel — My Skillz'`
   — that duplicate `VOICES.y2k.headings` verbatim. Retitle a section in the Y2K voice
   and the window chrome still says the old thing. The mac tree has its own
   `WINDOW_DEFS` with Mac-flavoured titles *(pending)*.
2. **`NAV` in `src/components/paper/PaperLayout.astro`** is a hardcoded five-item nav
   (`Home / Experience / Projects / About / Contact`). It intentionally uses route names
   rather than voiced headings, but if a *section* is renamed the nav label may need to
   follow. Same for the Y2K Start menu labels in `Taskbar.tsx`.

---

### A new outbound link

1. Add it as a `Link` in the fact layer with **`verified: false`** unless you have
   personally loaded the URL. No outbound link on this site has been confirmed live.
2. Run `npm run audit:links`.
3. **Formatting matters.** `scripts/audit-links.mjs` reads the source as *text*, matching
   `{ label: '…', href: '…', verified: true|false }`. Whitespace and line breaks are
   fine, but **single quotes and that exact key order are not optional**, and no extra
   key may sit between them. A double-quoted href, or `{ href, label, verified }`, is
   silently skipped — it never appears in the audit and nothing fails. Match the existing
   style exactly.
4. It only scans `src/data/{projects,experience,identity}.ts`. A link added anywhere else
   is invisible to the audit — which is another reason links belong in the fact layer.
5. `LINK_AUDIT_COMPLETE` in `src/config.ts` flips to `true` only when every box in the
   audit output is ticked.

---

### Anything that changes a route or a slug

The highest-risk content change. The featured slug set appears in **six** places. Two
derive from `FEATURED`; the other four are hand-written:

| Place | Derived? | Caught by `npm run check`? |
|---|---|---|
| `FEATURED_SLUGS` in `src/data/index.ts` (`FEATURED.map`) | yes | n/a |
| `getStaticPaths` in `src/pages/projects/[slug].astro` (maps `FEATURED`) | yes | n/a |
| `ROUTES` in `src/lib/theme-mount.ts` — literal `'/projects/acronymize'`, … | **no** | no — it is a `readonly string[]`, so a wrong route is silent |
| `projectBlurbs: Record<'acronymize' \| 'flowsense' \| 'tanks', string>` in `src/data/voice.ts` | **no** (type union) | usually — a lookup with the new slug becomes a type error |
| `ProjectSlug` in `src/lib/chat/tools.ts` | **no** (type union; its comment says it mirrors `FEATURED`) | usually, same reason |
| `FEATURED_SLUGS` in `src/components/chat/model.ts` | **no** (runtime validation allowlist) | **no** — an unrecognised slug makes the card silently not render, which is by design for model-supplied input and therefore invisible when the cause is a stale list |

Plus:

- **`windowsForRoute`** in `src/components/y2k/wm.ts` (and the mac equivalent, *pending*)
  regex-matches `/projects/:slug`, so it is slug-agnostic — but confirm the deep link
  actually opens the right window.
- **`ROUTE_OPENERS`** in `src/components/chat/App.tsx` maps each route to a per-project
  greeting that **restates project facts in prose** ("the RAG-backed PDF reader from Hack
  the 6ix 2024"). Both the key and the copy need updating.
- **`src/lib/chat/stub-transport.ts`** passes slugs as literals to
  `render_project_card`.
- **The sitemap is generated** by `@astrojs/sitemap` from the prerendered routes. No
  manual edit — but after `npm run build`, check `dist/sitemap-0.xml` lists what you
  expect. A missing route there means `getStaticPaths` and the data disagree.
- `astro.config.mjs` sets `prerenderConflictBehavior: 'error'`, so two trees claiming one
  route is a build failure rather than a warning. Good. Rely on it.

---

## Known second copies of facts

Found by grep, current as of this writing. Treat each as a place to check on any relevant
change, and fix opportunistically.

| File | The literal |
|---|---|
| `src/pages/index.astro` | *"I'm looking for a Summer 2027 co-op."* — paraphrase of `IDENTITY.availability` |
| `src/pages/experience.astro` | meta description naming Apple / Carta / Empathia.ai and "Four co-op terms" |
| `src/data/voice.ts` (`CANONICAL.metaDescription`) | *"Seeking a Summer 2027 software engineering co-op."* |
| `src/data/voice.ts` (`bioShort` × 3, `bioLong` × 3) | current employer, "four co-op terms" |
| `src/lib/chat/stub-transport.ts` | role dates, locations, "fourth co-op term … through August 2026", degree, GPA, coursework, graduation 2028 |
| `src/lib/fact-pack.ts` | R1–R4 restated in prose in the system prompt; `## Co-op terms (four so far)` |
| `src/components/chat/App.tsx` | `ROUTE_OPENERS` — per-project and per-route factual prose |
| `src/components/y2k/wm.ts` | `WINDOW_DEFS` titles duplicating `VOICES.y2k.headings` |
| `src/components/shared/BaseHead.astro` | JSON-LD `addressLocality: 'Waterloo'` / `addressRegion: 'ON'`, rather than deriving from `IDENTITY.location` |
| `src/lib/theme.ts` | `NO_FLASH_SCRIPT` duplicates the alias map and theme guard from `themeFromUrl` — the file says so, and the two must stay in sync |

None of these is a bug today. Each is a place where a future fact change lands silently
wrong if you only edit `src/data/`.

---

## The checker, precisely

`scripts/check-rules.mjs`. Know what it sees before you trust a PASS.

**Copy sources it assembles:**

1. String literals from `src/data/{experience,projects,identity,education,voice}.ts` and
   `src/lib/fact-pack.ts`, with comments stripped first (the rule commentary itself
   discusses the banned patterns).
2. **Prose** string literals from every `.ts`/`.tsx` under `src/components/` and every
   `.ts` under `src/lib/`. "Prose" = at least two spaces, no CSS-value shape, no CSS
   unit, contains three consecutive letters. This filter is why `width: '100%'` is not a
   false positive — and why a short violating string like `'up 40%'` could slip through.
3. **JSX text nodes** from every `.tsx` under `src/components/` — tags stripped,
   `{expressions}` blanked, lines that still look like code dropped. Crude by necessity.
4. The stripped text of every `dist/**/*.html`.

**It does not parse `.astro` files as source.** Paper's copy reaches the checker only
through built HTML. Build before checking.

**Why the net is that wide:** Y2K, mac and chat never appear in `dist/*.html`. Scanning
`src/data` and built HTML alone would leave three of four themes unchecked.

**What it matches:**

- **R1** — metric *shapes*, not values: `\d+%`, `$\d`, `six/seven/eight-figure`, a count
  followed by `users|customers|clients|subscribers|testers|visitors|views|downloads|
  installs|signups|businesses|emails/yr`, and `increased|improved|reduced|…` within 40
  characters of a percentage. Shapes rather than a blocklist **because this repo is
  public** — listing the actual résumé figures would republish exactly what R1 keeps off
  the internet. `SCOPE_ALLOWLIST` exempts the approved scope phrases, and is tested
  against both the match and ±60 characters of surrounding context (several entries are
  phrases, not tokens).
- **R2** — award vocabulary within 300 characters of `flowsense|hack the|hackathon`,
  unless placement-specific corrective phrasing is nearby. The corrective exemption is
  deliberately narrow: an earlier version matched any "not"/"never" within 300 chars and
  a nearby unrelated aside silently excused a real false claim. Separately, any
  non-corrective mention of "Hack the North" is a violation.
- **R3** — `src/data/experience.ts` must contain `APPROVED_APPLE` verbatim; no file in
  `src/` or `scripts/` may name the held Apple file.
- **R4** — `2027` attached to a degree word, or a bare `2027` with no co-op/work-term
  context within ±140 characters, or `Expected 2027`. Corrective phrasing is exempt.
- **A note, not a failure:** any built page that does not mention "summer 2027".

**When a legitimate copy change trips it:** change the checker deliberately, in the same
commit, with a comment explaining why the new copy is approved. The comment style in that
file (the R2 negative-control note, the reason `100% hand-coded` is allowlisted narrowly)
is the standard to match. Never widen a pattern to make a failure quiet.
