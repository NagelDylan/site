# nagel-site

Dylan Nagel's personal site. Three themes over one fact layer: **paper** (risograph
craft), **y2k** (Win98 desktop), **mac** (Mac OS 9 Platinum desktop).

A fourth theme — **chat**, an assistant that argues his case — is built and still in
the repo, but is **hidden**: no control offers it, no URL resolves to it, and a
persisted preference for it lands on the chooser instead. `THEMES` in `src/config.ts`
is the switch, and its comment lists everything needed to bring it back. Everything
below that describes four themes is describing the code, which still has four trees.

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
   linked claim. Read by all four themes *and* compiled into the chatbot's system
   prompt at build time (`src/lib/fact-pack.ts`), so the bot cannot cite a stale job
   title.
2. **Voice layer** — `src/data/voice.ts`. Four copy sets, scoped to hero / about /
   project blurbs **only**. Experience bullets and education are shared verbatim on
   purpose: four drifting copies of a job history is how a date goes stale in
   exactly one place.
3. **Presentation layer** — four independent component trees under
   `src/components/{paper,y2k,mac,chat}/`. A Win98 window, a Platinum window and a
   taped-in Polaroid share no structure. Don't try to unify them.

### How four themes share one set of URLs

Explained in full in `src/lib/theme-mount.ts`. The short version:

- **Paper is server-rendered** into static HTML at every route. It's what crawlers
  index, what deep links resolve to, the OG image source, and the no-JS fallback for
  every other theme — a visitor with Y2K persisted and a broken bundle still gets the
  most legible version of the site.
- **Y2K and mac mount on the client**, dynamically imported. They're
  applications (two window managers), not documents. A paper visitor
  never downloads a byte of any of them: the boot chunk is ~4 KB and `react-dom` only
  loads if a client theme is actually activated.
- Switching dispatches `nagel:theme-change` instead of navigating, so the URL never
  changes and the swap is instant.
- `?theme=paper` (also `y2k`, `mac`) forces a theme and bypasses the splash —
  this is the link to send recruiters. `?theme=chat` no longer resolves: the alias was
  removed when that theme was hidden, so it falls through to the chooser.

The splash only appears when JS is running. Without JS, and for crawlers, the paper
site is simply there with no gate to dismiss.

### The two retro desktops are not one theme with two skins

`mac` is the same era as `y2k` from the other side of the aisle: a Macintosh running
Mac OS 8/9 Platinum. Same facts, same completeness, opposite temperament — Windows 98
shouts and the Macintosh politely explains. Where Y2K has a Start menu, a taskbar,
Clippy, a marquee and a sparkle cursor, the Mac has a fixed screen-top **menu bar**
as its navigation, an Application menu, **window-shade collapse** instead of
minimise, **Balloon Help** you switch on yourself, flying toasters for a screensaver,
and a Stickies note pinned to the desktop carrying the availability line. Close boxes
are on the left, icons live on the right, title bars are pinstriped rather than
gradient, and Shut Down produces a bomb dialog and a Sad Mac rather than a BSOD. The
copy is calm sentence-case Apple-manual prose; the contrast with Y2K's ALL CAPS *is*
the joke.

The two trees deliberately share **no code** — not a hook, not an icon, not a window
manager. G9's independence is what stops them converging into one grey desktop with
two stylesheets, and duplicating four small hooks is the intended cost. `mac` also
never renders the Apple logo or answers to `?theme=apple`: R3 limits Apple content to
the one approved sentence, and the theme is a Classic Mac OS pastiche, not an Apple
product. The system-menu mark is an abstract six-stripe rainbow lozenge.

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
| `me-y2k.png` | 1,220 KB | 66 KB + 29 KB lossless WebP at 256 px — **also serves `mac`** |
| `me-chat.png` | 1,221 KB | 22 KB + 8 KB WebP |

**One portrait per theme, with one knowing exception.** G9 keeps the themes
structurally independent, and that extends to the artwork: a risograph print for
paper, pixel art for Y2K, a flat vector cut for chat. `PHOTOS` in
`src/data/identity.ts` is keyed by theme; `PHOTO` is the paper/canonical one and is
what OG tags, structured data, and the print stylesheet use.

`mac` is the exception, and it is deliberate. **`assets-src/` cannot be added to** —
no new artwork can be produced here — so the Classic Mac theme points at the *same*
pixel portrait as Y2K and does the differentiating in CSS instead: 1-bit black and
white with a dither overlay, inverted in dark mode, in `src/styles/mac/content-base.css`.
There is no `me-mac.webp` and nothing in the repo should imply there is. The entry in
`PHOTOS` carries the same note, so nobody "fixes" it by inventing a file.

The Y2K portrait is stored at 256 px **lossless** and scaled back up with
`image-rendering: pixelated`. Its resolution is fake — it is a small pixel grid
blown up — so lossless-at-256 is byte-identical in appearance to the 1254 px source
once upscaled, at 66 KB instead of 450 KB. Do not switch it to lossy or let the
browser smooth it; either one destroys the hard pixel edges the art is made of. The
Mac theme's 1-bit treatment of the same file has the same requirement for the same
reason.

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

### Audio

There are now real audio files, in two unrelated sets. Neither came from
`assets-src/` — both were supplied from outside the repo, which is why they are the
only shipped assets `scripts/optimize-assets.sh` does not regenerate.

| Set | Where it plays | Files |
|---|---|---|
| **netBloc Vol. 24: tiuqottigeloot** (blocSonic, 2009) — a free netlabel compilation | Y2K's Winamp and the Mac's QuickTime Player | `public/media/music/` — 12 tracks, ~44 MB |
| **The mixtape** — five songs Dylan picked | The paper theme's control cluster | `public/media/music-paper/` — 5 tracks, ~15 MB |

Both are **128 kbps AAC in an MP4 container** (`.m4a`), which every current browser
decodes natively. The sources were 320 kbps and 192 kbps MP3 at 106 MB and 22 MB;
transcoding is the difference between a repo you can clone and one you can't.
Regenerate with macOS `afconvert` — no ffmpeg needed, same as the image pipeline:

```bash
afconvert -f m4af -d aac -b 128000 -q 127 -s 3 in.mp3 out.m4a
```

The manifest for both sets is `src/lib/music.ts`. It is a **lib** module, not part of
the fact layer, deliberately: a tracklist is not a fact about Dylan and the chatbot
has no business reciting one, so it is not re-exported from `src/data/index.ts` and
`fact-pack.ts` never sees it.

**Nothing autoplays and nothing preloads.** Every player is `preload="none"` with no
`src` until a press, so a visitor who never touches one pays nothing — which matters
most on paper, the server-rendered theme crawlers land on. The durations shown before
playback are transcribed from `afinfo` into the manifest for exactly this reason.

**Two things about this are not settled — see the comment headers in
`src/lib/music.ts` before launch.** The netBloc licence terms are per-artist and the
files carry no licence frame, so no specific CC clause is asserted anywhere in the
UI. The mixtape is five commercial recordings, ripped from streams, and serving them
publicly is a decision with legal exposure that the code documents rather than hides.
Three of the five artists are unknown to the repo — the MP3s have no ID3 artist
frames at all — so those tracks show a title and no artist rather than a guess (R5).

---

## Phase status

Phase A (this repo, complete) is a linkable, honest site with no credentials.
Phase B needs accounts Dylan doesn't have yet.

Everything gated is switched off in **one place**: `FEATURES` in `src/config.ts`.
Nothing is half-wired, and nothing pretends to work.

Two of those flags are no longer switches: `formSubmission` and `turnstile` are
*computed* from whether their key exists, so a build cannot claim a delivery path it
does not have. Copy `.env.example` to `.env` and paste in a Web3Forms access key to
turn contact delivery on locally; set the same variable in the Cloudflare Pages build
environment for production.

| Capability | Now | To go live |
|---|---|---|
| Chatbot | **Hidden** — the theme is unreachable, so none of this is live for visitors. The tree is intact: `StubTransport` still gives scripted replies, artificial stream delay and fake tool calls, permanently labelled **"demo mode — not connected to a live model"**. | Unhide it first (add `'chat'` to `THEMES` — see that comment for the full list). Then deploy the Worker, set the Anthropic key, flip `FEATURES.liveChat`. `WorkerTransport` already has the SSE shape. |
| Contact form | **Live**, in all four themes, if `PUBLIC_WEB3FORMS_ACCESS_KEY` is set — submissions are relayed to Dylan's inbox by [Web3Forms](https://web3forms.com), because a fully static site has no server to hold mail credentials. Success is shown only on a confirmed relay; every failure says so and hands back a prefilled `mailto`. Spam defence is a hidden `botcheck` honeypot. Without the key, `FEATURES.formSubmission` computes to false and each form says up front that it cannot send. | Optional hardening: create a Cloudflare Turnstile widget, put the **secret** in the Web3Forms dashboard, set `TURNSTILE_SITE_KEY`, and add Cloudflare's script to `BaseHead.astro`. |
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
- [ ] **Audio:** confirm the netBloc per-artist licence terms on blocSonic and add the
      specific clause beside the credit if they require it; decide whether the five
      commercial tracks in `public/media/music-paper/` are shipping at all; and fill in
      the three unknown artists in `MIXTAPE` (`src/lib/music.ts`). All three are
      flagged in that file's comments.
- [ ] Visual pass in a real browser at desktop, tablet, and phone widths, in light
      and dark, for all four themes. **None of the CSS in this repo has been
      verified in a browser** — the build environment has none.
