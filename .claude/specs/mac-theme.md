# Fourth theme: `mac` — Classic Mac OS (Platinum, circa 1999)

**Authoritative build contract.** Every agent building this theme reads this file
and treats it as ground truth. If something is not specified here, mirror what
the Y2K tree does in `src/components/y2k/` — that tree is the reference
implementation for structure, comment density, accessibility and print handling.

---

## 0. The point of this theme

The site has three themes. Y2K is a Windows 98 desktop: loud, GeoCities,
ALL CAPS, sparkle cursor, Clippy, a marquee. This is the **same era on the other
side of the aisle** — a Macintosh running Mac OS 8/9 Platinum. Same facts, same
completeness, opposite temperament.

The design thesis, in one line: **Windows 98 shouts; the Macintosh politely
explains.** Everything about this tree follows from that.

| Y2K does | Mac does instead |
|---|---|
| ALL CAPS exclamation copy | calm sentence-case Apple-manual prose |
| Start menu → navigation | fixed screen-top **menu bar** → navigation |
| Taskbar with minimise buttons | **window-shade collapse** + **Application menu** |
| Clippy, a character who interrupts | **Balloon Help** — you turn it on, then hover |
| Sparkle cursor trail | **zoom rects** — dotted rect flies from icon to window |
| Starfield screensaver | **flying toasters** screensaver |
| BSOD on Shut Down | **system-error bomb dialog → Sad Mac** on Shut Down |
| Marquee banner across the top | **Stickies** note pinned to the desktop |
| Winamp 2.9 | **QuickTime Player 4** |
| Hit counter, webring, rainbow rules | pinstripes, chiselled bevels, 1-bit icons |
| Icons on the left | icons on the **right** (HD top-right, Trash bottom-right) |

It must not read as the Y2K tree with grey paint on it. Different structure,
different interaction model, different voice, different jokes.

---

## 1. Naming and identifiers — fixed, do not improvise

| Thing | Value |
|---|---|
| Theme id (`ThemeId`) | `'mac'` |
| `THEME_LABELS.mac` | `'Classic Mac'` |
| Splash panel label | `Classic Mac` |
| Splash panel note | `a Macintosh desktop, circa 1999` |
| `?theme=` aliases | `mac`, `macos`, `classic`, `system7`, `os9`, `platinum`, `finder` |
| Fictional OS name in-theme | **Dylan OS 9** (mirrors Y2K's "DYLAN OS 98 SE") |
| CSS class prefix | `mac-` |
| Component dir | `src/components/mac/` |
| Stylesheets | `src/styles/theme-mac.css`, `src/styles/theme-mac-content.css` |
| `THEMES` order in config | `['paper', 'y2k', 'mac', 'chat']` |

`'apple'` is **not** an alias. See §2.

---

## 2. Hard constraints — read before writing a line

### The six §0 rules apply in full
They are documented at the top of `src/data/index.ts` and enforced by
`npm run check:rules`, which walks `src/components/**` — so this tree is checked
automatically, including JSX text nodes and prose string literals.

- **R1** No performance metrics. No `N%`, no `$N`, no "N users/customers/views".
  Technical scope is fine ("roughly 60 destination categories", "3,000+ line",
  "GPA 3.9"). *Watch out:* an "About This Computer"-style window is a natural
  place to accidentally write a percentage. Memory bars must carry no numbers a
  reader could mistake for an achievement, and no `%` in prose.
- **R2** FlowSense won nothing. Built at Hack the 6ix 2024, placed nowhere. No
  badge, no trophy, no "winner", and never "Hack the North".
- **R3** Apple content is `APPLE_DESCRIPTION` from `src/data/experience.ts`
  **verbatim and nothing more**. No project names, no internal tooling, no scale
  claims, no extra enthusiasm. Render it plainly — mirror the
  `.y2k-role--plain` treatment in `ExperienceWindow.tsx`.
- **R4** Graduation is 2028. The only `2027` anywhere is the *Summer 2027 co-op
  term* availability line, and it must always sit within ~140 characters of
  co-op/work-term context or `check:rules` flags it.
- **R5** Never invent a fact. Every dated, named or linked claim comes from
  `src/data/`. Microcopy may be *flavour*; it may not be *new information*.
- **R6** n/a here (chatbot).

### Trademark boundary — non-negotiable
`src/components/y2k/Icon.tsx` carries this comment, and it applies double here:

> R3: there is no Apple icon in this file, and there must never be one — the
> Apple role gets a text treatment, never the logo (trademark).

Therefore:

- **No apple silhouette anywhere.** The leftmost menu-bar item is a
  **six-stripe rainbow rounded lozenge** — an abstract mark, deliberately not
  fruit-shaped. Put a code comment at its definition saying exactly why.
- Its accessible name is `System menu`, never "Apple menu".
- Era *product* names are fine and expected, exactly as Y2K says "Winamp 2.9"
  and "Netscape Navigator": Finder, SimpleText, Scrapbook, QuickTime,
  Chooser, Extensions Manager, Balloon Help, Stickies, Note Pad, Sherlock.
- The theme is never labelled "Apple" in UI or in a URL alias.

### Assets are frozen
`assets-src/` cannot be added to (see README). **No new image files.** Every
icon and texture is inline SVG, CSS gradients, or a data-URI pattern generated
in CSS. The portrait reuses the Y2K pixel art — see §6.

### Accessibility floor (G12)
- Every interactive thing is a real `<button>` / `<a>` in the tab order.
- `:focus-visible` ring from `base.css` may be restyled, never removed.
- Nobody may be trapped in the theme: the theme switcher is reachable from the
  always-visible Control Strip **and** from the System menu.
- `prefers-reduced-motion` kills the screensaver, the zoom rects, and any
  looping animation — the JS checks the query and does not render them at all,
  it does not render them frozen. Use `useReducedMotion` (§4.1).

### Print (G15)
Chrome gets `data-chrome`, decoration gets `data-decorative`. `print.css`
hides both globally — no change to `print.css` is needed or allowed.

---

## 3. Visual system

### Palette — light (`[data-mode='light']`, the default)
```
--mac-face:        #dedede   /* window / dialog face, "Platinum" */
--mac-face-2:      #cccccc   /* chrome, menu-bar-adjacent fills */
--mac-white:       #ffffff   /* top-left bevel, content wells */
--mac-light:       #eeeeee
--mac-mid:         #999999   /* hairline dividers */
--mac-shadow:      #888888   /* bottom-right bevel */
--mac-dark:        #555555
--mac-ink:         #000000
--mac-ink-soft:    #333333
--mac-desktop:     #6f8bab   /* desktop base; dithered 50% over it */
--mac-desktop-2:   #5c7592
--mac-select:      #b3c7e6   /* selection fill (Mac OS 8.5 "Blue" appearance) */
--mac-select-ink:  #000000
--mac-accent:      #3a5f8f
--mac-sticky:      #fdf6a9   /* Stickies note */
--mac-sticky-line: #e0d67a
```

### Palette — dark (`[data-mode='dark']`)
A graphite appearance, not an inverted one. Same structure, cooler and darker:
face `#4a4a4c`, face-2 `#3c3c3e`, white-bevel `#6e6e70`, shadow `#232324`,
ink `#f2f2f2`, ink-soft `#c9c9c9`, desktop `#26303c` / `#1c242e`,
select `#3d5878`, sticky `#5c5730` with `#d8d2a0` ink. Every rule that sets a
colour needs a dark counterpart — the paper and Y2K themes both learned this the
hard way (commits `e31f3e6`, `900c415`).

### Bevels
The Mac bevel is **thinner and softer** than the Win98 one: 1px, not 2px, and it
uses greys rather than pure black/white. A raised surface is
`border-top/left: 1px solid var(--mac-white)`,
`border-bottom/right: 1px solid var(--mac-shadow)`, plus a `1px solid
var(--mac-dark)` outer frame on windows. Pressed inverts it. Wells (text areas,
list views) are inset: dark on top-left, white on bottom-right.

### Type
```css
font-family: 'Charcoal', 'Chicago', Geneva, Verdana, Tahoma, sans-serif;
```
No new webfonts. Body UI text is 12px/1.45; menu bar and title bars 12px bold
with `letter-spacing: 0.01em`. Do **not** use Press Start 2P — that is the Y2K
theme's font and using it here collapses the two.

### Textures
- **Desktop:** a 2px 50%-dither checkerboard (`repeating-conic-gradient` or a
  tiny data-URI SVG) over `--mac-desktop`. Subtle; icons must stay legible.
- **Pinstripes:** the active title bar's signature. Horizontal 1px lines,
  `repeating-linear-gradient(180deg, var(--mac-white) 0 1px, var(--mac-face-2) 1px 2px)`,
  running the full bar with the title text sitting in a `--mac-face` plaque that
  interrupts them. Inactive title bar: flat `--mac-face`, no stripes, grey text,
  no visible close/zoom/collapse boxes (authentic and a useful focus cue).
- Never a gradient title bar. That is Windows.

---

## 4. File-by-file build plan

Each file has exactly one owner. **Do not edit a file you do not own.** If you
need something from another owner's file, code against the contract below and
trust it exists.

### 4.1 `src/components/mac/hooks.ts` — owner M1
Port `src/components/y2k/hooks.ts` verbatim in behaviour: `useReducedMotion`,
`useNarrow` (same 860 / coarse-pointer logic), `useClock`, `useIdle`.
The Mac clock reads `Mon 10:04 AM` (classic Mac menu-bar clock showed the day);
keep the minute-boundary tick. Add `useMenuDismiss(onDismiss)` — closes an open
menu on outside pointerdown or `Escape`.

Do not import from the y2k tree. G9 keeps the trees structurally independent;
duplicating four small hooks is the intended cost.

### 4.2 `src/components/mac/wm.ts` — owner M1
Mirrors `y2k/wm.ts` and its two performance decisions (drag bypasses React;
z-order is a counter). Differences that matter:

```ts
export type WindowKind =
  | 'readme'      // welcome
  | 'work'        // experience
  | 'projects'    // Finder folder, list view
  | 'project'     // Get Info window, arg = slug
  | 'about'       // Read Me / SimpleText
  | 'extensions'  // skills
  | 'system'      // education, About This Macintosh
  | 'mail'        // contact
  | 'scrapbook'   // guestbook
  | 'trash'
  | 'quicktime'
  | 'resume'
  | 'guide'       // help
  | 'chooser';    // theme switcher
```

- `WindowState` replaces `minimized` with **`collapsed`** (window-shade: the
  frame renders title bar only) and keeps `maximized` as **`zoomed`**.
- Actions: `open`, `close`, `closeAll`, `focus`, `collapse` (toggle),
  `zoom` (toggle), `move`, `resize`, `select` (Application-menu pick →
  uncollapse + focus).
- Cascade origin clears the **Stickies** note (top-left) and the **right-hand**
  icon column: start at `x = 120`, `y = 64`, step `(opened % 6) * 22` both axes,
  clamped to `bounds.w - w - 96` so windows never bury the HD/Trash icons.
- `WINDOW_DEFS` titles are Mac-flavoured and assert no facts:

| kind | title | icon | w × h |
|---|---|---|---|
| `readme` | `Read Me` | `doc` | 540 × 420 |
| `work` | `Work History` | `doc` | 620 × 470 |
| `projects` | `Projects` | `folderOpen` | 640 × 400 |
| `project` | *(set per open: `<Name> Info`)* | `getinfo` | 420 × 480 |
| `about` | `About Dylan Nagel` | `simpletext` | 540 × 440 |
| `extensions` | `Extensions Manager` | `extension` | 520 × 420 |
| `system` | `About This Macintosh` | `hd` | 500 × 400 |
| `mail` | `New Message` | `mail` | 480 × 460 |
| `scrapbook` | `Scrapbook` | `scrapbook` | 460 × 400 |
| `trash` | `Trash` | `trash` | 480 × 320 |
| `quicktime` | `QuickTime Player` | `quicktime` | 340 × 230 (not resizable) |
| `resume` | `Résumé.pdf` | `pdf` | 400 × 240 (not resizable) |
| `guide` | `Macintosh Guide` | `guide` | 500 × 420 |
| `chooser` | `Chooser` | `chooser` | 460 × 320 |

- `windowsForRoute(route)` maps exactly as Y2K does but to Mac kinds:
  `/experience → work`, `/projects → projects`, `/about → about`,
  `/contact → mail`, `/projects/:slug → [projects, project(slug)]`,
  default `readme`.

### 4.3 `src/components/mac/MacWindow.tsx` — owner M1
Window chrome. Contract:

```tsx
type Props = {
  win: WindowState;
  active: boolean;
  children: React.ReactNode;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onCollapse: (id: string) => void;
  onZoom: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, w: number, h: number) => void;
  /** Optional Finder-style status strip along the bottom. */
  status?: React.ReactNode[];
};
export default MacWindow;
```

Anatomy, left to right along the title bar:
`[close box] ····· pinstripes ····· «Title» ····· pinstripes ····· [zoom box] [collapse box]`

- **Close box on the LEFT.** This is the single most recognisable difference
  from the Y2K tree. Small square, 1px frame, with an inner square that only
  appears on hover/active.
- **Zoom box** (square containing a smaller square, top-left aligned) and
  **collapse box** (square with a single horizontal bar) on the right.
- Boxes render only when the window is active — inactive windows show a flat
  grey bar with no controls. Keep them in the DOM with `aria-hidden` +
  `pointer-events: none` when inactive, so focus order is stable.
- Grow box in the bottom-right corner, drawn as two nested corner brackets, only
  when resizable and not zoomed.
- **Scroll bars are the Mac ones** and are visible on every scrollable content
  well: square arrow buttons at *both* ends, a hollow thumb, and a 50%-dithered
  track. Implement as CSS on `.mac-scroll` (`::-webkit-scrollbar*` plus a
  `scrollbar-width`/`scrollbar-color` fallback) — do not build a JS scrollbar.
- Reuse Y2K's drag mechanics *exactly*, including the `closest('button')` bail
  in `beginDrag` (see the long comment in `Y2kWindow.tsx` — that bug is real and
  it will recur here) and the arrow-key nudge on the focusable title text.
- Collapsed: render the header only, `height: auto`, body `display: none`.
- `data-chrome` on the title bar, the grow box and the status strip.

### 4.4 `src/components/mac/MenuBar.tsx` — owner M1
The primary navigation and the always-present chrome. Fixed to the top of the
viewport, 22px tall, `--mac-white` fill, 1px `--mac-ink` bottom border.

```tsx
type Props = {
  windows: WindowState[];
  activeId: string | null;
  onOpen: (req: OpenRequest) => void;
  onSelectWindow: (id: string) => void;
  onTheme: (theme: ThemeId) => void;
  onToggleMode: () => void;
  mode: 'light' | 'dark';
  onShutDown: () => void;
  onToggleBalloons: () => void;
  balloons: boolean;
  resumeAvailable: boolean;
};
```

Menus, left to right. **Every window on the desktop is reachable from here
(G10)** — including the ones with no desktop icon.

- **`◆` System menu** (the rainbow lozenge, §2): `About This Macintosh` ·
  `Macintosh Guide` · ─── · `Chooser…` · `Control Panels ▸` (→ `Appearance…`
  which toggles light/dark, `Extensions Manager`) · ─── · `Scrapbook` ·
  `Note Pad` (opens `readme`) · `QuickTime Player`
- **`File`**: `Open Projects` · `New Message…` · `Get Info ▸` (one entry per
  featured project, from `FEATURED`) · ─── · `Print…` (calls `window.print()`,
  which is a genuinely correct joke — `print.css` handles it) ·
  `Résumé.pdf` *(only when `resumeAvailable`)*
- **`Edit`**: authentically all-disabled (`Undo`, `Cut`, `Copy`, `Paste`,
  `Clear`) — greyed, `aria-disabled`, plus one live item at the bottom:
  `Select Another Theme…` → Chooser. The grey Edit menu is the joke; do not
  make its items live.
- **`View`**: `as Icons` / `as List` (switches the Finder window's view mode —
  wire through `onOpen({kind:'projects'})` and a module-level view preference is
  fine, or make it a no-op with a Balloon Help explanation; do NOT ship a
  broken-looking control) · ─── · `Read Me` · `Work History` ·
  `About Dylan Nagel` · `Extensions Manager` · `Trash`
- **`Special`**: `Empty Trash…` (opens a "are you sure" dialog whose punchline
  is that the archived projects are staying) · ─── · `Restart` · `Shut Down`
  (→ `onShutDown`)
- **`Help`**: `Show Balloons` / `Hide Balloons` (checkmark when on) ·
  `Macintosh Guide` · ─── · `About This Site` (→ `guide`)
- **Right side:** the clock (`useClock`), then the **Application menu** — an
  icon plus the active window's title, whose drop-down lists every open window
  with a checkmark beside the active one and dispatches `onSelectWindow`. When
  nothing is open it reads `Finder` and is disabled.

Behaviour: click a menu title to open, hover to move between open menus (classic
Mac behaviour), `Escape` or outside click closes, `ArrowDown`/`ArrowUp` move
within a menu, `Enter`/`Space` activates, `Home`/`End` jump. Menus render as
`role="menu"` with `role="menuitem"` children, hard 1px black border, no radius,
and a hard `2px 2px 0 rgba(0,0,0,.35)` shadow. Menu title strip items are
`role="menubar"`/`role="menuitem"` buttons with `aria-expanded`.

Dividers are `<li role="separator">` with a hairline, never a text `───`.

### 4.5 `src/components/mac/ControlStrip.tsx` — owner M1
The Control Strip: a small tabbed tray anchored bottom-left, pulled out by
default, collapsible to a grab-tab by clicking its end. Modules, each a real
button with a tooltip-ish `title`:

1. **Appearance** — sun/moon glyph, toggles light/dark (`onToggleMode`).
2. **Theme** — the rainbow lozenge; opens the Chooser window.
3. **Sound** — speaker glyph; opens QuickTime Player.
4. **Balloons** — a small balloon glyph; toggles Balloon Help.
5. **Back to the chooser** — calls `returnToChooser()` from `src/lib/theme.ts`.

`data-chrome`. This is the G8 always-visible switcher: it must never be behind a
menu, and it must not overlap the Stickies note.

```tsx
type Props = {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
  onOpen: (kind: WindowKind) => void;
  balloons: boolean;
  onToggleBalloons: () => void;
};
```

### 4.6 `src/components/mac/Icon.tsx` — owner M2
Inline-SVG icon set, in the **classic Mac idiom**: 32×32 viewBox, 1px black
outlines, flat fills from a restricted palette, a hard 1px white highlight on
the top-left face and a `#888` shade on the bottom-right. Chunkier and *flatter*
than the Y2K set, with more black line and less colour. Several should read as
genuinely 1-bit (black on white with 50% dither for grey) — the dithered ones
are the era's signature.

```tsx
export type IconName =
  | 'hd' | 'folder' | 'folderOpen' | 'doc' | 'simpletext' | 'pdf'
  | 'getinfo' | 'extension' | 'mail' | 'scrapbook' | 'notepad'
  | 'trash' | 'trashFull' | 'quicktime' | 'guide' | 'chooser'
  | 'sticky' | 'happymac' | 'sadmac' | 'bomb' | 'caution' | 'stop'
  | 'note' | 'grad' | 'briefcase' | 'person' | 'globe' | 'floppy' | 'watch';
type Props = { name: IconName; title?: string };
export default Icon;                          // <svg viewBox="0 0 32 32" …>
export const RainbowMark: () => JSX.Element;  // the menu-bar lozenge, §2
export const Pinstripe: () => JSX.Element;    // optional helper
```

`Icon` renders `<svg viewBox="0 0 32 32" class="mac-icon-svg" role="img"
aria-hidden={!title}>` with `<title>` when `title` is given — same contract as
`y2k/Icon.tsx`. **No apple shape in this file, ever** (§2); carry that comment.

`happymac` (a small CRT with a smiley), `sadmac` (same box, `:(` and a hex
code), and `bomb` (round bomb with a lit fuse) are load-bearing for the boot and
crash sequences — spend the detail there.

### 4.7 `src/components/mac/Boot.tsx` — owner M3
```tsx
const Boot = ({ resumeAvailable, onDone }: { resumeAvailable: boolean; onDone: () => void }) => …
export default Boot;
```
Same contract and same rules as `y2k/Boot.tsx`: plays on **every** entry, skippable
with any key/click/tap, and the skip path is the same `onDone` so a reboot still
lands on the chooser. Every line is machine fiction or a count read from the fact
layer (`FEATURED.length`, `SECONDARY.length`, `ROLES.length`) — it asserts
nothing new. Three beats:

1. **Happy Mac.** Grey field, the `happymac` icon centred, pixel-crisp. A
   silent "chime" is implied, never played — no audio.
2. **Welcome box.** A bevelled Platinum plaque: the rainbow lozenge, then
   `Welcome to Dylan OS 9`, then a status line that cycles: `Starting up…`,
   `Loading fact layer…`, `Mounting Projects…`, `Checking Résumé.pdf…`
   (`resumeAvailable ? 'found' : 'not installed'`), `Balloon Help…`,
   `QuickTime™…`, `Building the desktop…`.
3. **Extensions marching in.** A left-to-right row of small icons appearing one
   per status line along the bottom of the screen — the single most recognisable
   Mac boot detail. Cap the row so it never wraps.

~2.6–3.0s total. `role="status"`, `aria-label="Startup — press any key to skip"`.

### 4.8 `src/components/mac/Dialog.tsx` — owner M3
```tsx
export type DialogSpec = {
  title: string;              // rendered as bold lead text, NOT a title bar
  body: React.ReactNode;
  icon?: IconName;            // default 'caution'
  okLabel?: string;
  cancelLabel?: string;       // when present, renders a two-button dialog
  onConfirm?: () => void;
};
export const Dialog: (p: { spec: DialogSpec; onClose: () => void }) => JSX.Element;
export const SystemError: (p: { onReboot: () => void }) => JSX.Element;
```

Mac alerts have **no title bar** — a plain bevelled Platinum box, a 32px icon in
the top-left, text to its right, buttons bottom-right, and the default button
carries a 3px ring (`--mac-ink`, 2px offset, fully rounded corners at radius 8).
`Escape`/`Enter` behave as in Y2K's `Dialog`. Focus the default button on mount.

`SystemError` is the BSOD counterpart and inherits Y2K's honesty guarantee — it
is only reachable from **Special → Shut Down**, so it can never read as a real
crash. Sequence, inside the one component:

1. The **bomb dialog**: bomb icon, `Sorry, a system error occurred.`, then
   `Dylan OS 9  ID = 02` on its own line, then — in plain words, the way the
   Y2K BSOD does it — *you chose Shut Down; this was the plan; nothing is
   actually broken and your real computer is fine.* Buttons: `Restart` (default)
   and `Continue` (disabled, which is the authentic detail).
2. `Restart` → a black screen with the **Sad Mac** and a hex code, for ~1.2s.
3. Then `onReboot()`, which `App.tsx` wires to replay the boot and land on the
   theme chooser.

Any key or click during (1) or (2) advances. `role="alertdialog"`.

### 4.9 `src/components/mac/effects.tsx` — owner M3
```tsx
export const Screensaver:  (p: { onWake: () => void }) => JSX.Element;
export const ZoomRects:    () => JSX.Element | null;   // listens for an event, see below
export const BalloonLayer: (p: { active: boolean }) => JSX.Element | null;
export const zoomFrom:     (rect: DOMRect) => void;    // fire-and-forget
```

- **`Screensaver` — flying toasters.** Canvas, black field, chunky pixel-art
  toasters (drawn from rects: body, slot, lever, two flapping wings that
  alternate every ~8 frames) plus slices of toast, drifting from the top-right to
  the bottom-left with parallax by depth. ~14 sprites. Same wake contract as
  Y2K's `Screensaver`: `role="button"`, `tabIndex={0}`, wakes on pointerdown or
  keydown, `aria-label` explains how to dismiss. Resize-aware, `cancelAnimationFrame`
  on unmount. Drawn from scratch — no image assets, no logos.
- **`ZoomRects`** replaces the sparkle trail. `zoomFrom(rect)` dispatches a
  `mac:zoom` CustomEvent; the layer draws a 1px dotted rectangle that animates
  (via the Web Animations API, transform + opacity only) from that rect out to
  the centre of the desktop over ~180ms, then removes itself. Called by
  `App.tsx` when a desktop icon or menu item opens a window. Motion-only, so the
  caller does not render it under reduced motion.
- **`BalloonLayer`** — Balloon Help. When `active`, a single pointer listener
  finds the nearest ancestor carrying `data-balloon` and renders one yellow
  cartoon balloon near it: rounded rect, 1px black outline, a pointed tail aimed
  at the element, `--mac-sticky` fill, 11px text. Positioned with `transform`
  only, flipped to stay inside the viewport, `aria-hidden` (the text duplicates
  each control's accessible name — it is a visual gag, not an a11y mechanism),
  `data-decorative`. Every interactive chrome element in this tree should carry a
  `data-balloon="…"` string written in the calm Mac-manual voice, e.g.
  `data-balloon="Click here to close this window. Nothing is saved, because
  nothing here can be edited."`

### 4.10 `src/components/mac/deco.tsx` — owner M3
The Mac counterpart to `y2k/deco.tsx`. Restrained by design — this theme's
decoration is *structural* (pinstripes, bevels, dither), not ornamental.

```tsx
export const StickyNote:  (p: { children: React.ReactNode; className?: string }) => JSX.Element;
export const Pinstripes:  (p: { label?: string }) => JSX.Element;
export const Hairline:    () => JSX.Element;      // the Mac's 1px divider
export const Chiselled:   (p: { children: React.ReactNode }) => JSX.Element;  // engraved heading
export const KindLabel:   (p: { kind: string }) => JSX.Element;               // Finder "Kind" cell
export const DeskNote:    () => JSX.Element;      // the G10 desktop Stickies note, see below
export const ThemeRing:   (p: { onTheme: (t: ThemeId) => void }) => JSX.Element;
```

`DeskNote` is **required for G10** and is the counterpart to the Y2K banner: a
yellow Stickies note pinned top-left of the desktop that no window ever covers,
carrying `IDENTITY.name`, `IDENTITY.headline`, `IDENTITY.location` and
`IDENTITY.availability` in full, plus one calm line telling the visitor the
windows really move and the menu bar is the navigation. Sentence case. Marked
`data-decorative`? **No** — it carries real information, so it must survive
print and must not be marked decorative. Mark only its pushpin/tape flourish.

`ThemeRing` is the Y2K webring's opposite number: one quiet line offering the
other three themes as plain buttons. No `◄ PREV ►`, no caps.

### 4.11 Content windows — owners M4 and M5

All of them: read from `src/data` and `VOICES.mac` only. Root element is
`<div className="mac-client">` (add `mac-client--well` when the content should
sit in an inset scrollable well; add `mac-scroll` where it scrolls). Match the
Y2K content windows' comment density — each file opens with a docblock saying
what it is, what it reads, and which hard rule it is guarding.

**Owner M4**

| File | Kind | Treatment |
|---|---|---|
| `content/ReadMeWindow.tsx` | `readme` | SimpleText "Read Me" document. Monospace-ish plain document with a `Read Me — Dylan OS 9` heading rule. Carries the greeting, `heroSub`, availability, and a short "What's installed" list linking to every other window via buttons. Contract: `({ resume, onTheme, onOpen }: { resume: Resume; onTheme: (t: ThemeId) => void; onOpen: (k: WindowKind) => void })`. |
| `content/WorkWindow.tsx` | `work` | Work history. One block per role from `ROLES` (already sorted): company, title, `dates`, location + `arrangement`, `note`, then `bullets` **verbatim** or `description`. Tags as small chiselled pills. `COOP_TERMS` gets a calm summary line. **The Apple role renders plain** — `APPLE_DESCRIPTION` verbatim, no pills beyond `tags`, no logo, no flourish; mirror `.y2k-role--plain`. |
| `content/AboutWindow.tsx` | `about` | `About Dylan Nagel`. Portrait (§6) at 120px, `bioShort`, hairline, `bioLong` paragraphs, `INTERESTS` under `headings.interests`, availability, `SOCIALS` links, and a button to the mail window. Contract: `({ onContact }: { onContact: () => void })`. |
| `content/SystemWindow.tsx` | `system` | **`About This Macintosh`**, the era's most distinctive window, repurposed for education. Header row: the rainbow lozenge, `Dylan OS 9`, and a right-aligned `Built for the long term` line. Then the classic key/value block using `EDUCATION`: `School`, `Degree`, `Program`, `Location`, `Dates`, `GPA`. Then the "largest unused block" list → `coursework`, each row a name plus a **bar with no number on it** (R1: the bars are decorative and must be labelled as such). Graduation is **2028** (R4). |

**Owner M5**

| File | Kind | Treatment |
|---|---|---|
| `content/FinderWindow.tsx` | `projects` | A real Finder window. Header: `N items` + a decorative `zip available` cell. **List view** with sortable-looking columns `Name · Kind · Size · Last Modified` and a triangle disclosure per row that expands to the project's `summary` + `VOICES.mac.projectBlurbs[slug]`; double-click / Enter opens Get Info. `FEATURED` are folders, `SECONDARY` are documents in a nested `Archive` group. Sizes and dates are obvious machine fiction derived from the data (e.g. `stack.length` → `NNK`) and must not read as a metric. Also exports `export const TrashList = () => …` rendering `RECYCLE_BIN` in the same list view, for the `trash` window. Contract: `({ onOpenProject }: { onOpenProject: (slug: string) => void })`. |
| `content/GetInfoWindow.tsx` | `project` | The **Get Info** window, exactly: 32px icon + bold name at the top, a hairline, then `Kind` / `Where` / `Created` / `Modified` / `Version` / `Built` / `Team` / `Stack` rows, then a bordered **`Comments:`** well holding `VOICES.mac.projectBlurbs[slug]` and `highlights` as a list, then `links` as buttons, then `MotionMedia`-style media. **Use `src/components/shared/MotionMedia.tsx`** for `project.media` — it is theme-agnostic and exists precisely so a poster ships and the animation only loads on intent. `framing` must be honoured verbatim where present; FlowSense's `framing` is the R2 guard. Contract: `({ slug }: { slug: string })`. Unknown slug → a Mac-voiced "file not found" alert body, not a crash. |
| `content/ExtensionsWindow.tsx` | `extensions` | **Extensions Manager**, the perfect analogue for skills. A `Selected Set: All Skills` popup-looking header, then a list well with one row per item from `SKILLS`, grouped by `label`, each row: a checkbox (checked, `disabled`, `aria-disabled` — decorative, and say so once in a footnote), an icon, the name, and a `Kind` cell naming the group. A status strip counts groups and items (counts are structure, not performance — allowed). |
| `content/MailWindow.tsx` | `mail` | Contact as a classic mail compose window: `To:` prefilled with `IDENTITY.email`, `Subject:`, a message well, and a `Send` button. **Honesty is mandatory and follows `y2k/ContactWindow.tsx` exactly** — read that file first. `FEATURES.formSubmission` is false, so the form must say plainly, before submission, that nothing is sent anywhere and the real route is the mailto link. Include the mailto link and `SOCIALS`. Never imply a message was delivered. |
| `content/ScrapbookWindow.tsx` | `scrapbook` | Guestbook as the **Scrapbook** desk accessory: one "page" at a time with `◀ ▶` paging and a `Page N of M` footer. Pages hold the same era-flavoured entries as `y2k/GuestbookWindow.tsx` in Mac voice (calm, dated, signed) plus a `Sign` button that opens a Dialog explaining there is no database and nothing typed on this site is stored anywhere. Contract: `({ onSign }: { onSign: () => void })`. |
| `content/QuickTimeWindow.tsx` | `quicktime` | **QuickTime Player 4**: the silver rounded body, a display well, a badge-style time readout, transport buttons (`◀◀ ▶ ▶▶`), and the signature **thumbwheel** volume control on the left. Plays no audio — it says so, in one calm line, the way `y2k/WinampWindow.tsx` does. Read that file for the honesty pattern before writing this one. |
| `content/panels.tsx` | `guide`, `resume`, `chooser` | Three small windows: `GuideWindow` (Macintosh Guide — how this desktop works: the menu bar is the navigation, close is on the left, windows collapse rather than minimise, Balloon Help exists, the screensaver is idle-triggered, reduced motion is honoured; contract `({ onTheme }: { onTheme: (t: ThemeId) => void })`), `ResumeWindow` (`({ resume }: { resume: Resume })`, mirrors `y2k` panels), `ChooserWindow` (the **Chooser**, two-pane: a left list of "drivers" = the four themes, a right pane describing the selected one with a `Select` button; contract `({ onTheme }: { onTheme: (t: ThemeId) => void })`). |

Shared type both owners use, declared in `wm.ts` and imported:
```ts
export type Resume = { available: boolean; href: string; filename: string };
```

### 4.12 `src/components/mac/App.tsx` — owner M6
Mirrors `y2k/App.tsx` beat for beat — read it first, and carry over its docblock
structure including the "hard rules as they apply to this theme" section.

- `const App = ({ route, resume, mode: initialMode }: ThemeAppProps)`; default export.
- Imports both stylesheets:
  ```ts
  import '../../styles/theme-mac.css';
  import '../../styles/theme-mac-content.css';
  ```
  (Two files because the fleet split chrome from content; say so in a comment.)
- State: `booting` (true on every mount, same reasoning as Y2K — quote it),
  `rebooting`, `crashed`, `balloons`, `dialog`, `mode`, plus `wm`.
- `narrow` → returns `<MacMobile …/>`, and toggles a `mac-mobile` class on
  `<html>` exactly as Y2K toggles `y2k-mobile`.
- Desktop icons live in a **right-hand** column: `Macintosh HD` (→ `system`) at
  the top, then `Projects`, `Read Me`, `Work History`, `About Dylan Nagel`,
  `Extensions Manager`, `New Message`, `Scrapbook`, `QuickTime Player`,
  `Macintosh Guide`, `Résumé.pdf` (only when available), and **`Trash` pinned at
  the bottom of the column**. Single click selects (visible selection state,
  inverted label), double-click or Enter opens — that selection behaviour is
  the Mac's, and it is worth the extra state.
- Opening from an icon calls `zoomFrom(el.getBoundingClientRect())` unless
  reduced motion.
- Renders, in order: menu bar, desktop (dither, `DeskNote`, icon column,
  windows, balloons, dialog), control strip, screensaver when idle, boot,
  system error. `useIdle(70_000, !reducedMotion && !booting && !crashed && !narrow)`.
- `setTheme` dispatches `nagel:theme-change`; `toggleMode` writes
  `document.documentElement.dataset.mode`, `style.colorScheme`, and calls
  `persistMode`. Both identical to Y2K.
- Shut Down → `setCrashed(true)`; `SystemError`'s `onReboot` → `closeAll()`,
  `setRebooting(true)`, `setBooting(true)`, and `Boot`'s `onDone` calls
  `returnToChooser()` when `rebooting`. Same as Y2K; keep the comment.

### 4.13 `src/components/mac/Mobile.tsx` — owner M6
`MacMobile`, same props as `MobileY2k`
(`{ onTheme, onToggleMode, mode, resume }`), default export.

A simplified Mac **document**, not a shrunk desktop: a fake menu bar strip
pinned at top (non-functional except the mode toggle and theme buttons, and say
so), then one long single-column SimpleText-style page in document order —
hero + availability, portrait, about, work history (bullets verbatim, Apple
plain), projects, secondary projects, skills, education (2028), contact with the
honest mailto, socials, and the theme switcher. **G10 holds: everything the
desktop conveys is on this page.**

### 4.14 `src/data/voice.ts` and `src/data/identity.ts` — owner M7
See §5 and §6.

### 4.15 Plumbing — owner M8
See §7.

### 4.16 `src/styles/theme-mac.css` — owner C1 (workflow 2)
Tokens, light + dark; `.mac-root`, `.mac-desktop` and its dither; menu bar and
menus; Application menu; control strip; desktop icons + selection; window frame,
title bar pinstripes, close/zoom/collapse boxes, grow box, collapsed state,
status strip; Mac scroll bars; buttons, checkboxes, radio, popup menus, text
fields and wells; dialogs and the default-button ring; boot screen; screensaver
layer; zoom rects; balloons; sticky note; focus ring; reduced-motion overrides.

### 4.17 `src/styles/theme-mac-content.css` — owner C2 (workflow 2)
`.mac-client` typography and rhythm; Finder list view and disclosure rows; Get
Info layout; About This Macintosh key/value block and decorative bars;
Extensions Manager list; mail compose fields; Scrapbook pages; QuickTime body
and thumbwheel; Read Me / SimpleText document styling; Guide and Chooser panes;
role blocks and the plain Apple treatment; pills; portrait 1-bit treatment (§6);
`.mac-m*` mobile styles. Light + dark for all of it.

---

## 5. The Mac voice — owner M7

Add to `src/data/voice.ts`: widen `ThemeId` to include `'mac'`, add a `MAC:
Voice` const, add it to `VOICES`, and update the file's header docblock (it
currently says "Three copy sets" and "the Y2K voice is loud" — it now describes
four).

**Register: an Apple manual or Read Me file from 1997.** Calm, courteous, second
person where it addresses the reader. Short declarative sentences. Sentence case
throughout. At most one exclamation mark in the entire voice, and only if it
earns itself. Deadpan wit, never a wink you have to explain. It is the *same
enthusiasm as Y2K, at one tenth the volume* — the contrast is the joke, so
under-write rather than over-write.

Every underlying fact is **identical** to `PAPER`. Same rules: no metrics (R1),
FlowSense won nothing (R2), Apple gets the approved sentence only (R3),
graduation 2028 (R4), nothing invented (R5).

`headings` (Title Case, Mac-flavoured nouns):
```
work: 'Work',  experience: 'Work History',  projects: 'Projects',
about: 'Read Me',  contact: 'Get in Touch',  skills: 'Extensions',
education: 'System Information',  interests: 'Also Installed'
```

`greeting` should be a quiet startup line in the manual's voice — something a
Read Me would open with. `ctaPrimary` / `ctaSecondary` read as menu commands
(`'Open Projects'`, `'Send a message'`). `projectBlurbs` are one or two calm
sentences each; FlowSense's may say "Built at Hack the 6ix 2024" and no more
about placement.

Also add a `MAC_TICKER`-equivalent if `deco.tsx` needs shared microcopy — but
prefer keeping microcopy in the component, as Y2K does.

## 6. The portrait — owner M7

`PHOTOS` in `src/data/identity.ts` is keyed by theme and needs a `mac` entry.
**`assets-src/` is frozen and no new artwork can be produced here.** So `mac`
reuses the Y2K pixel portrait, and the *treatment* is what makes it Mac: 1-bit
black-and-white with a dither, done in CSS.

Add the entry with the paths written out, plus a comment saying plainly that it
intentionally shares the Y2K art because the asset directory is frozen, that
G9's one-portrait-per-theme rule is knowingly bent here, and that the 1-bit CSS
treatment lives in `theme-mac-content.css`. Do not pretend a `me-mac.webp`
exists. The README's asset table gets the same note (owner M8).

The CSS treatment (owner C2): `image-rendering: pixelated` (the Y2K note about
never smoothing that art still applies), `filter: grayscale(1) contrast(1.9)`,
and a `mix-blend-mode: multiply` dither overlay. `[data-mode='dark']` inverts.

## 7. Plumbing — owner M8

Every one of these is required; a miss here is a silent broken theme.

1. **`src/config.ts`** — `THEMES = ['paper', 'y2k', 'mac', 'chat']`.
2. **`src/data/voice.ts`** — owned by M7, not M8. Do not touch it.
3. **`src/lib/theme.ts`** — four places:
   - `themeFromUrl` alias map: add every §1 alias → `'mac'`.
   - `THEME_LABELS.mac = 'Classic Mac'`.
   - **`NO_FLASH_SCRIPT`** — the inline pre-paint script duplicates the alias map
     and has a hardcoded `s === 'paper' || s === 'y2k' || s === 'chat'` guard.
     **Both must gain `mac`.** This is the highest-risk line in the change: miss
     it and a returning Mac visitor gets a flash of paper, which is exactly the
     bug commit `900c415` fixed. The file already warns that the two copies must
     stay in sync.
   - `returnToChooser`'s docblock says "Y2K reaches it through Start → Shut
     Down; paper and chat use this directly" — update it for four themes.
4. **`src/lib/theme-mount.ts`** — `CLIENT_THEMES = ['y2k', 'mac', 'chat']`, and
   update the module docblock, which currently describes three themes and names
   the two client ones.
5. **`src/components/shared/ThemeBoot.astro`** — add
   `if (theme === 'mac') return (await import('../mac/App')).default;` to
   `loadApp`. It must be a **static specifier** so Vite splits the chunk.
6. **`src/components/shared/Splash.astro`** — a fourth panel.
   - Anchor: `<a class="panel panel--mac" href="?theme=mac" data-theme-choice="mac">`,
     placed **after Y2K and before chat** so the two retro-OS themes sit
     together and the order matches `THEMES`.
   - Preview art, self-contained CSS in this file only (the splash must not
     depend on any theme stylesheet — the existing docblock says so): a
     Platinum window with a **pinstriped** title bar and a **left-hand close
     box**, a menu-bar strip above it with the rainbow lozenge and `File Edit
     View`, a small HD icon top-right, over the dithered desktop. It must be
     distinguishable from the Y2K panel at a glance: pinstripes vs gradient,
     close-box side, menu bar vs taskbar.
   - `.splash-panels` grid becomes `repeat(4, 1fr)`; add a `repeat(2, 1fr)`
     breakpoint around 1024px and keep the existing single-column ≤720px.
     Re-check the preview heights at each breakpoint.
   - Dark-mode caption band already handled by `.panel-label`/`.panel-note`;
     make sure the mac panel's art reads against it.
7. **`src/layouts/BaseDocument.astro`** — the `theme` prop is
   `'paper' | 'y2k' | 'chat'`. Widen it (importing `ThemeId` from
   `src/data/voice` is cleanest) so a fourth theme cannot silently fail
   `astro check`.
8. **`README.md`** — it says "three themes" in several places, including the
   opening line, the architecture section, the asset table and the launch
   checklist. Update all of them to four, add `mac` to the presentation-layer
   list, add the portrait note from §6, and add one paragraph explaining the
   Classic Mac theme the way the Y2K one is explained.
9. **`package.json`** `description` also says "three themes". Update it.
10. Grep for other stale counts before finishing:
    `rg -n "three themes|all three|3 themes" --glob '!node_modules'`. Fix the
    ones that are now wrong; leave the ones that are genuinely about the three
    *voice* copy sets only if they are still true after §5 (they are not — M7
    updates `voice.ts`).

**Do not** touch `src/styles/print.css` or `src/styles/base.css`. Both are
theme-agnostic by design and already cover this tree via `data-chrome` /
`data-decorative` and the reduced-motion floor.

**Do not** add anything to `scripts/check-rules.mjs`. It walks
`src/components/**` and picks this tree up for free. If it flags something, the
copy is wrong, not the checker.

---

## 8. Definition of done

- `npm run check` — clean (types across `.astro` and `.tsx`).
- `npm run build` — clean, and `dist/` still contains the paper HTML for every
  route (the Mac theme must not become server-rendered).
- `npm run check:rules` — PASS.
- `?theme=mac` loads the theme directly with no splash and no flash of paper.
- Every route deep-links to the right window: `/experience` → Work History,
  `/projects/tanks` → Projects + Tanks Info, `/about` → About, `/contact` → New
  Message, `/` → Read Me.
- **G10:** every fact the paper site states is reachable in this theme, and the
  availability line is readable without opening anything (the Stickies note).
- **G8:** the theme switcher and the mode toggle are reachable by keyboard
  without opening a menu.
- Light and dark both work. Reduced motion kills the screensaver, zoom rects and
  every loop.
- A print preview of the Mac theme produces a plain document, not a screenshot.
- No new files in `assets-src/` or `public/`.
