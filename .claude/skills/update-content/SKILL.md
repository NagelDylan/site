---
name: update-content
description: Use when changing any fact or piece of copy on this site — a job title, a new or ended role, a retitled section, a new project, changed dates, a new email or link, an edited bio, the availability line, a new skill, a correction, a graduation year, a heading, a project slug, or anything the chatbot says. This site fans one fact layer out into four presentation trees, a compiled chatbot prompt, meta tags, structured data, and an automated rule checker; this skill finds every landing site for a change so none is missed. Also use when reviewing someone else's content edit.
---

# Updating content on nagel-site

The failure mode this exists to prevent: a fact changes in one theme and goes stale in
three. There are four presentation trees, and **three of them never appear in
`dist/*.html`** — Y2K, mac and chat ship inside JS chunks. A reviewer eyeballing built
HTML sees only paper. A stale date can sit in the Y2K desktop or the chatbot's scripted
replies indefinitely and look fine from the outside.

## Rule zero

**Facts live in `src/data/` and nowhere else.** Every dated, named, or linked claim —
role dates, company names, titles, the availability line, graduation year, project
slugs, URLs, GPA, coursework — has exactly one definition there. Everything downstream
reads it.

If you find a component holding a second copy of a fact, **fixing that is part of the
change**, not a follow-up. There are already a handful of these (see
`references/propagation-map.md` § Known second copies) and they are the reason this
skill's first step is a grep, not a checklist.

## Step 1 — grep for the consumers (mandatory, not optional)

`references/propagation-map.md` has a file map. **It is a starting point. The grep is
the source of truth.** A fourth theme (`mac`) is landing as this is written and a fifth
is not impossible; a hardcoded list of files goes stale exactly the way a hardcoded fact
does.

Before editing anything, find who reads the thing you are about to change:

```bash
# 1. Who imports the symbol? (IDENTITY, ROLES, EDUCATION, FEATURED, SECONDARY,
#    SKILLS, INTERESTS, COOP_TERMS, RECYCLE_BIN, PHOTOS, VOICES, CANONICAL, …)
rg -n 'IDENTITY\.availability|ROLES|EDUCATION\.' src

# 2. Who holds a literal copy of the OLD value? This is the one that finds bugs.
rg -ni 'Summer 2027' src scripts README.md package.json

# 3. Which trees does the change touch? (paper is .astro; the rest are .tsx)
rg -l 'IDENTITY\.availability' src/components src/pages src/lib
```

Read every hit. A comment mentioning the old value is usually fine to leave; a rendered
string is not.

## Step 2 — the R1–R6 gate

Restated from the header of `src/data/index.ts`, which is authoritative. Two of these
exist because Dylan's résumé PDF and GitHub profile README currently say something
false, and this site is the corrected version.

| Rule | The line you must not cross |
|---|---|
| **R1** | No **performance** metrics. No `N%`, no `$N`, no user/view/customer counts, no "increased X by Y". Those live on the résumé. |
| **R2** | FlowSense won nothing. Built at **Hack the 6ix 2024**, placed nowhere. Never "Hack the North", never a placement, prize, trophy, badge or 🏆. |
| **R3** | Apple content is `APPLE_DESCRIPTION` in `src/data/experience.ts`, verbatim, and nothing more. No project names, no internal tooling, no scale, no logo (trademark). |
| **R4** | Graduation is **2028**. The only `2027` on this site is the Summer 2027 co-op **work term**, and it must sit within ~140 characters of co-op/work-term context or the checker flags it. |
| **R5** | Never invent a fact. If it is not in `src/data/`, ask Dylan. Microcopy may be flavour; it may not be new information. |
| **R6** | The chatbot inherits R1–R5 — including `src/lib/chat/stub-transport.ts`, whose scripted replies are *worse* than a model's slip, because they are committed and shipped to everyone. |

**R1 bans impact, not scope.** "Roughly 60 destination categories", "3,000+ line",
"four co-op terms", "GPA 3.9" are approved copy and are allowlisted in
`scripts/check-rules.mjs`. Do not strip them while "cleaning up numbers". The test:
does it describe the *shape* of the work or *grade* it?

## Step 3 — fan out

Four trees. Each one must convey the fact independently (G10) — they share the fact
layer, not structure, so there is no shared component to fix once.

| Tree | Where | Server-rendered? | Caught by a `dist/` grep? |
|---|---|---|---|
| paper | `src/pages/**`, `src/components/paper/**` | yes | **yes** |
| y2k | `src/components/y2k/**` | no | no |
| mac | `src/components/mac/**` *(pending — see `.claude/specs/mac-theme.md`)* | no | no |
| chat | `src/components/chat/**`, `src/lib/chat/**` | no | no |

### The spot people forget: the narrow-viewport pages

Each client theme has a **separate simplified page** for narrow viewports, rendered
instead of the desktop, not derived from it:

- `src/components/y2k/Mobile.tsx`
- `src/components/mac/Mobile.tsx` *(pending)*

They re-declare the whole site in one column. G10 holds there too: **if a fact is on
the desktop and not on the mobile page, it is missing for every phone visitor.** Chat
has no separate mobile page — it is one responsive conversation.

Check these *every time*. They are the single most commonly missed file in the repo.

## Step 4 — the non-obvious downstream hits

Full detail in `references/propagation-map.md`; the short list:

- **`src/lib/fact-pack.ts`** compiles the fact layer into the chatbot's system prompt at
  build time. Fact-layer edits flow through automatically — but prose *in* that file
  (the hard-content-rules section) restates R1–R4 by hand and can go stale.
- **`src/lib/chat/stub-transport.ts`** hand-restates dates, companies, coursework, the
  graduation year and "fourth co-op term" in scripted replies. It imports only
  `APPLE_DESCRIPTION`, `IDENTITY` and `SOCIALS`. Everything else there is a literal.
  **This is the largest stale-copy surface on the site.**
- **`src/components/shared/BaseHead.astro`** — meta description, OG, Twitter card,
  and the `Person` JSON-LD (`jobTitle` and `worksFor` come from
  `ROLES.find(r => r.current)`; `seeks.name` is `IDENTITY.availability`).
- **`CANONICAL` in `src/data/voice.ts`** — `metaDescription` and `bioShort`, used for
  meta tags and structured data. Voice-neutral by design; it contains the availability
  line as a literal.
- **`src/styles/print.css`** carries no facts, but hides `[data-chrome]` and
  `[data-decorative]` globally. New markup must be marked correctly or it either leaks
  chrome into print or hides real information. Do not add facts to it.
- **`README.md`** when architecture, theme count or the asset table changes, and
  **`package.json`** `description` (it names the themes). Both currently say "three
  themes" — the mac fleet owns those edits right now, so leave them alone unless your
  change is the reason a count is wrong.
- **`scripts/check-rules.mjs`** when approved copy legitimately changes. It asserts
  `APPLE_DESCRIPTION` as an exact string literal and allowlists the approved scope
  phrases. Changing either means changing the checker **deliberately, in the same
  commit, with a comment saying why** — never to make a failure go away.

## Step 5 — verify, in this order

```bash
npm run verify        # = check && build && check:rules
npm run audit:links   # only when a link changed
```

Order matters. `npm run check:rules` alone is **weaker** than after a build: it scans
`dist/**/*.html` as one of its copy sources, and a stale `dist/` means it is either
checking yesterday's HTML or (if absent) printing `dist/ not built — checked source copy
only`. Always build first.

What `check:rules` does and does not see:

- **Sees:** `src/data/*.ts`, `src/lib/**/*.ts`, prose string literals **and** JSX text
  nodes across `src/components/**/*.{ts,tsx}`, and the stripped text of every
  `dist/**/*.html`.
- **Does not see:** `.astro` files as source. Paper's copy is only checked via built
  HTML — which is exactly why the build has to run before the check.

### Final self-review: prove the old value is gone

```bash
rg -ni '<the old string>' src scripts dist README.md package.json
```

Zero rendered hits. Comments and corrective phrasing ("graduation is 2028, never 2027")
are legitimate; a rendered string is not. If the change touched a route or slug, also
confirm `dist/sitemap-0.xml` lists the routes you expect — it is generated from
`getStaticPaths`, so a wrong slug there means the data and the routes disagree.

## References

- `references/propagation-map.md` — change-type → propagation table, the per-tree file
  map, slug/route changes, known second copies of facts.
- `references/worked-example.md` — two edits walked end to end with the actual greps.
