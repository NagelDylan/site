# Worked examples

Two real edits, walked end to end. The greps are the actual commands; run them, don't
trust the file lists.

---

## Example 1 — the availability line changes to a Winter 2028 co-op

The single most fanned-out string on the site, and it collides with R4. Do this one
carefully.

### Before you touch anything: raise the R4 tension

R4 exists so that a **term** year is never mistaken for a **graduation** year.
Graduation is `Expected 2028`. A "Winter 2028 co-op" puts 2028 on the site in two
different meanings, which is the exact ambiguity R4 was written to prevent. It is
probably still the right change — recruiters screen on term availability — but it needs
prose that separates the two explicitly, and the R4 checker logic has to be rewritten
rather than nudged. Say so before editing, and ask if the graduation year is also
moving.

### Step 1 — find every consumer and every literal

```bash
# Symbol consumers
rg -n 'IDENTITY\.availability|availabilityShort' src

# Literal copies of the old value — this is the list that matters
rg -ni 'summer 2027|2027' src scripts README.md package.json
```

That returns, as rendered copy (comments excluded):

| File | What |
|---|---|
| `src/data/identity.ts` | `availability`, `availabilityShort` — **the source** |
| `src/data/voice.ts` | `CANONICAL.metaDescription` — literal *"Seeking a Summer 2027 software engineering co-op."* |
| `src/pages/index.astro` | contact card — literal *"I'm looking for a Summer 2027 co-op."* |
| `src/lib/chat/stub-transport.ts` | the `availability` reply — literal *"seeking a Summer 2027 software engineering co-op … he is in the Honours Co-operative program … and graduates in 2028"* |
| `src/lib/fact-pack.ts` | the Education block's *"The 'Summer 2027' on this site is a co-op work term, not a graduation date"* line, and hard rule 4 in the system prompt |
| `scripts/check-rules.mjs` | `isTerm` (`summer 2027`), the availability-presence check (`/summer 2027/i`), and the R4 comment block |

And as interpolated consumers, which need no edit but must be re-read after the change to
confirm the sentence still parses:

- paper: `src/pages/index.astro` hero, `src/pages/contact.astro`,
  `src/pages/experience.astro` (`availabilityShort`, in a tight highlight — check it
  still fits)
- y2k: `content/WelcomeWindow.tsx` and `Mobile.tsx` both `.toUpperCase()` it;
  `deco.tsx`'s `MARQUEE_TEXT` uppercases it inline; `content/panels.tsx` `.toLowerCase()`s
  it mid-sentence — a leading capital or trailing period in the new string will read wrong
  in at least one of those
- mac *(pending)*: `deco.tsx`'s `DeskNote`, `content/ReadMeWindow.tsx`, `Mobile.tsx`
- chat: `Widgets.tsx` contact card
- shared: `Splash.astro`, `BaseHead.astro` JSON-LD `seeks.name`

### Step 2 — edit the source

`src/data/identity.ts`: both `availability` and `availabilityShort`. Update the comment
above them — it names Summer 2027 explicitly and explains the term-vs-graduation
distinction, which is the whole reason the field is documented at all.

### Step 3 — edit the literals

The four rendered literals above (`CANONICAL.metaDescription`, `index.astro`,
`stub-transport.ts`, `fact-pack.ts`). While you are in `fact-pack.ts`, hard rule 4 in the
system prompt says *"He is seeking a Summer 2027 co-op work term"* — the bot will
confidently state the old term otherwise, which is an R5 failure aimed at the visitor.

### Step 4 — edit the checker, deliberately

`scripts/check-rules.mjs`:

- The R4 block's `isTerm` regex and the `GRAD_2027` pattern are built around 2027. With
  the term year moved to 2028 — the graduation year — a bare-year check cannot
  distinguish them any more. The honest rewrite is to check that 2028 appears **either**
  in degree context **or** in term context and never ambiguously, and to add a note when
  a page carries both without disambiguating prose nearby.
- The availability-presence check's `/summer 2027/i` becomes the new term string.
- Update the comment block above R4. It states the rule in prose and is what the next
  person reads.

This is the one case where editing the checker is required rather than suspicious.
Comment it, and say in the commit that the rule's *intent* is unchanged.

### Step 5 — verify

```bash
npm run verify
rg -ni '2027' src scripts dist   # expect: zero rendered hits
```

Then read one built page's `<meta name="description">` and the JSON-LD `seeks` block to
confirm the new term made it into the head, not just the body:

```bash
rg -o 'name="description" content="[^"]*"' dist/index.html
rg -o '"seeks":\{[^}]*\}' dist/index.html
```

---

## Example 2 — the Apple term ends and a fifth co-op begins

Adds a role, ends another, and breaks a count that is written out as prose in a dozen
places.

### Step 1 — grep

```bash
rg -n 'ROLES|COOP_TERMS|coopTerm' src
rg -ni 'four co-op|fourth co-op|four terms|four so far' src README.md
rg -n "current: true" src/data/experience.ts
rg -ni 'Apple' src --glob '!*.css' | rg -v '^\S+: *\*'   # drop comment lines
```

### Step 2 — the fact layer

`src/data/experience.ts`:

1. Apple: `current: false`. Its `dates` already end at Aug 2026, so nothing else changes
   — and **`APPLE_DESCRIPTION` does not change**, because a finished term does not
   unlock held material. R3 still applies in full.
2. New role at the top of `ROLES` (reverse-chronological; `startISO` is the sort key and
   is never displayed): `current: true`, `coopTerm: 5`.
3. `COOP_TERMS`: append `{ term: 5, company: …, season: … }`.

`src/data/types.ts`: `Role['coopTerm']` is `1 | 2 | 3 | 4 | null`. Widen it, or
`npm run check` fails — which is the type system doing its job. Update the comment there;
it currently says "Apple is the 4th".

### Step 3 — the counts written out as prose

This is where the change actually goes wrong. `COOP_TERMS.length` is derived in
`y2k/Clippy.tsx` and `FEATURED.length`/`SECONDARY.length` in `y2k/Boot.tsx`, so those
self-update. **These do not:**

| File | What to fix |
|---|---|
| `src/data/voice.ts` | `bioShort` in `CANONICAL` (and therefore `PAPER`), `Y2K`, `CHAT`, and `MAC` *(pending)* — each names the current employer. `bioLong` in every voice says "four co-op terms" / "Across FOUR co-op terms" / "Four co-op terms in". |
| `src/pages/experience.astro` | hardcoded meta description: "Software developer intern at Apple; previously Carta and Empathia.ai. Four co-op terms…" |
| `src/lib/fact-pack.ts` | the `## Co-op terms (four so far)` heading, and hard rule 1's scope carve-out which lists "four co-op terms" as approved copy. |
| `src/lib/chat/stub-transport.ts` | several replies: "his production ownership is measured in four co-op terms", "four co-op terms, a 3.9 GPA", "partway through his fourth co-op term, at Apple in Cupertino, through August 2026", "Four co-op terms, most recent first. Apple, Software Developer intern…". All literals. |
| `scripts/check-rules.mjs` | `SCOPE_ALLOWLIST` does not list "four co-op terms" (it is not a metric shape, so it never needed exempting) — no edit. Confirm, don't assume. |

### Step 4 — the trees

Nothing to add: every tree maps over `ROLES` and `COOP_TERMS`. But read each one, because
a fifth role changes layout assumptions:

- paper: `src/pages/experience.astro` → `RoleCard.astro` (tilt cycles over three values —
  five roles is fine), `src/pages/index.astro`'s condensed timeline renders **all** roles,
  not a slice.
- y2k: `content/ExperienceWindow.tsx`, `Mobile.tsx`.
- mac *(pending)*: `content/WorkWindow.tsx`, `Mobile.tsx`.
- chat: automatic through the fact pack.

### Step 5 — meta and structured data

`src/components/shared/BaseHead.astro` derives `jobTitle` and `worksFor` from
`ROLES.find(r => r.current)`. **Exactly one role may carry `current: true`.** Two, and
`find` silently picks the first — a wrong `worksFor` in the JSON-LD that renders fine and
is invisible in the page. Zero, and both fields vanish from the schema.

### Step 6 — verify

```bash
npm run verify
rg -ni 'four co-op|fourth co-op' src dist   # expect: zero
rg -o '"jobTitle":"[^"]*"' dist/index.html
rg -o '"worksFor":\{[^}]*\}' dist/index.html
```

`npm run check:rules` will not catch a stale "four co-op terms" — it is not a banned
shape. The grep is the check. That asymmetry is the point of the final self-review step:
the automated audit enforces the six rules, and nothing but a grep enforces internal
consistency.
