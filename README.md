# nagel-site

Dylan Nagel's personal site. Three themes over one fact layer: **paper** (risograph
craft), **y2k** (Win98 desktop), **chat** (an assistant that argues his case).

Astro 7 + React islands, prerendered to static HTML, built for Cloudflare Pages.

---

## Read this before editing any copy

`src/data/index.ts` opens with the six hard rules from the build spec (§0). They are
not style preferences — two of them exist because Dylan's *other* public documents
currently say something false, and this site is the corrected version.

The short form:

| Rule | Meaning |
|---|---|
| **R1** | No performance metrics anywhere. No percentages, dollar figures, user counts. Résumé only. |
| **R2** | FlowSense won no award. Built at Hack the 6ix 2024; it placed nowhere. |
| **R3** | Apple content is exactly `APPLE_DESCRIPTION` in `src/data/experience.ts` and nothing more. |
| **R4** | Graduation year is 2028. The only 2027 on the site is the co-op *work term*. |
| **R5** | Never invent facts. Everything traces to the fact layer. |
| **R6** | The chatbot inherits R1–R5. |

R1 bans *performance* metrics, not technical scope. "Roughly 60 destination
categories", the "3,000+ line" rules file, "four co-op terms" and "GPA 3.9" are
approved copy. Don't strip them.

**These are enforced automatically.** `npm run check:rules` scans the fact layer, the
voice layer, the compiled chatbot prompt, and every built HTML page for metric
shapes, award language near project context, and 2027-as-a-degree-date. It runs
against built output too, so a violation introduced in a component is still caught.

The checker matches the *shape* of a metric (`\d+%`, `$\d`, `N users`) rather than
listing the actual résumé figures, because this repo is public and listing them
would republish exactly what R1 exists to keep off the internet.

---

## Commands

```bash
npm run dev           # local dev server
npm run build         # static build to dist/
npm run check         # astro check (types across .astro and .tsx)
npm run check:rules   # §0 hard-rule audit (source + built HTML)
npm run verify        # check && build && check:rules — run this before pushing
npm run audit:links   # lists outbound links needing a manual click-through
npm run assets        # regenerate public/ images from assets-src/
```

---

## Architecture

Three layers, per spec §8:

1. **Fact layer** — `src/data/`. Single source of truth for every dated, named, or
   linked claim. Read by all three themes *and* compiled into the chatbot's system
   prompt at build time (`src/lib/fact-pack.ts`), so the bot cannot cite a stale job
   title.
2. **Voice layer** — `src/data/voice.ts`. Three copy sets, scoped to hero / about /
   project blurbs **only**. Experience bullets and education are shared verbatim on
   purpose: three drifting copies of a job history is how a date goes stale in
   exactly one place.
3. **Presentation layer** — three independent component trees under
   `src/components/{paper,y2k,chat}/`. A Win98 window and a taped-in Polaroid share
   no structure. Don't try to unify them.

### How three themes share one set of URLs

Explained in full in `src/lib/theme-mount.ts`. The short version:

- **Paper is server-rendered** into static HTML at every route. It's what crawlers
  index, what deep links resolve to, the OG image source, and the no-JS fallback for
  all three themes — a visitor with Y2K persisted and a broken bundle still gets the
  most legible version of the site.
- **Y2K and chat mount on the client**, dynamically imported. They're applications
  (a window manager, a chat client), not documents. A paper visitor never downloads
  a byte of either: the boot chunk is ~4 KB and `react-dom` only loads if a client
  theme is actually activated.
- Switching dispatches `nagel:theme-change` instead of navigating, so the URL never
  changes and the swap is instant.
- `?theme=paper` (also `y2k`, `chat`) forces a theme and bypasses the splash — this
  is the link to send recruiters.

The splash only appears when JS is running. Without JS, and for crawlers, the paper
site is simply there with no gate to dismiss.

---

## Assets

`assets-src/` holds the **only surviving copies** of the eight carried-over files.
`github.com` is off the sandbox allowlist and they cannot be re-fetched. Never delete
that directory. `scripts/optimize-assets.sh` regenerates everything in `public/` from
it.

What the pipeline does:

| Source | Was | Ships as |
|---|---|---|
| `favicon.png` | 1,536 KB | 16/32 px PNG (1.5 / 3.0 KB), 180 px apple-touch, 512 px, and a real multi-size `.ico` |
| `tanks.gif` | 3,438 KB | 1,024 KB animated WebP + 12 KB poster |
| `acronymize.gif` | 692 KB | 432 KB + 7 KB poster |
| `flowsense.gif` | 428 KB | 170 KB + 24 KB poster |
| `me-paper.png` | 3,314 KB | 194 KB + 34 KB WebP |
| `me-y2k.png` | 1,220 KB | 66 KB + 29 KB lossless WebP at 256 px |
| `me-chat.png` | 1,221 KB | 22 KB + 8 KB WebP |

**One portrait per theme.** G9 keeps the three themes structurally independent, and
that now extends to the artwork: a risograph print for paper, pixel art for Y2K, a
flat vector cut for chat. `PHOTOS` in `src/data/identity.ts` is keyed by theme;
`PHOTO` is the paper/canonical one and is what OG tags, structured data, and the
print stylesheet use.

The Y2K portrait is stored at 256 px **lossless** and scaled back up with
`image-rendering: pixelated`. Its resolution is fake — it is a small pixel grid
blown up — so lossless-at-256 is byte-identical in appearance to the 1254 px source
once upscaled, at 66 KB instead of 450 KB. Do not switch it to lossy or let the
browser smooth it; either one destroys the hard pixel edges the art is made of.

The animations are still large. Frame-count reduction isn't safely possible with the
available tooling — animated WebP frames are partial rects with blend/dispose flags,
so dropping every other frame corrupts the incremental ones, and neither `gifsicle`
nor `anim_dump` is installed. **The size is handled in the UI instead:**
`src/components/shared/MotionMedia.tsx` renders the poster still and only fetches the
animation on explicit intent. Three project cards cost ~44 KB, not ~1.6 MB.

If you want the files themselves smaller, `brew install gifsicle` and the pipeline
can halve the frame counts properly.

`public/og/paper.png` is **committed**, not generated at deploy time:
`scripts/make-og.sh` uses macOS `sips`, which doesn't exist on Cloudflare's Linux
build image. Re-run it locally if the card changes.

---

## Phase status

Phase A (this repo, complete) is a linkable, honest site with no credentials.
Phase B needs accounts Dylan doesn't have yet.

Everything gated is switched off in **one place**: `FEATURES` in `src/config.ts`.
Nothing is half-wired, and nothing pretends to work.

| Capability | Now | To go live |
|---|---|---|
| Chatbot | `StubTransport` — scripted replies, artificial stream delay, fake tool calls so the card/button rendering is fully exercised. Permanently labelled **"demo mode — not connected to a live model"**. | Deploy the Worker, set the Anthropic key, flip `FEATURES.liveChat`. `WorkerTransport` already has the SSE shape. |
| Contact form | Full UI, marked Turnstile slot. Submit logs to console and says plainly that nothing was sent, pointing at the mailto link. | Set `TURNSTILE_SITE_KEY`, flip `FEATURES.turnstile` + `FEATURES.formSubmission`, add the Worker route that verifies the token server-side. |
| Analytics | Omitted. Marked insertion point in `BaseHead.astro`. | Add the Cloudflare Web Analytics beacon, flip `FEATURES.analytics`. |
| Résumé | Hidden. | Drop `public/resume.pdf` in. The button appears everywhere — no code change; the build checks for the file. |
| Domain | Pages subdomain. | Point `me.nagelbros.com`, update `SITE_URL`. |

### Two Anthropic API details that must survive into Phase B

Both are documented at the `ChatTransport` types, but they're easy to lose in a
rewrite:

1. **Keep thinking ON at `effort: "low"`.** Do not set `thinking: {type: "disabled"}`.
   On Opus 5, disabling it has a documented failure mode where the model writes a
   tool call into its *visible text* instead of emitting a real `tool_use` block. The
   turn succeeds, the tool never runs, and no error is raised. This interface renders
   project cards via tool calls, so that surfaces as cards mysteriously not
   appearing — the worst class of bug to diagnose.
2. **Check `stop_reason` before reading content.** Safety classifiers can decline a
   request with HTTP 200, `stop_reason: "refusal"`, and empty content. Code that
   reads `content[0]` unconditionally crashes.

Cost control (§11.4) is entirely Worker-side; no API feature does it for you. Hard
monthly ceiling via a persistent counter, per-IP rate limit, capped conversation
length and `max_tokens`. When the cap is hit, the honest offline state is already
built — do not fall back to canned answers while implying the bot is live.

---

## Before launch

- [ ] `npm run audit:links` and click every URL. None has been confirmed live — the
      environment that compiled the spec couldn't reach `nagelbros.com`,
      `youtube.com`, or `nageldylan.github.io`. The six secondary repo paths were
      inferred from a wireframe and are flagged `verified: false`.
- [ ] Fix the two documents that contradict this site (spec §15): the résumé PDF and
      the GitHub profile README both still claim 1st place at Hack the North for
      FlowSense. Neither is a website task, but the site reads as wrong until they're
      corrected.
- [ ] Drop in `public/resume.pdf`.
- [ ] Visual pass in a real browser at desktop, tablet, and phone widths, in light
      and dark, for all three themes. **None of the CSS in this repo has been
      verified in a browser** — the build environment has none.
