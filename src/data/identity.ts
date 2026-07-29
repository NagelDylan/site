/**
 * Identity and contact facts (spec §1).
 *
 * Deliberately absent, and not to be added:
 *   - Phone number. 647-960-9920 is résumé-only (§1).
 *   - Any social account other than LinkedIn and GitHub (§1: "Other socials: None").
 */

export const IDENTITY = {
  name: 'Dylan Nagel',
  /** Spec §2. Used as the site-wide headline in all three themes. */
  headline: 'Full-Stack Developer · AI & LLM Systems',
  location: 'Waterloo, ON',
  email: 'dylannagel05@gmail.com',
  /**
   * The single most actionable fact on the site (§2). Required in the hero,
   * the contact page, the footer, and the splash.
   *
   * Note this is a *term* claim, not a graduation claim. Graduation is 2028
   * (R4) and the two must never be conflated — recruiters screen on term
   * availability, which is what this line states.
   */
  availability: 'Seeking a Summer 2027 software engineering co-op',
  availabilityShort: 'Seeking Summer 2027 co-op',
} as const;

export const SOCIALS = {
  linkedin: 'https://www.linkedin.com/in/nageldylan/',
  github: 'https://github.com/NagelDylan',
} as const;

/** Interests, for /about (spec §2 long bio closer). */
export const INTERESTS = ['reading', 'travel planning', 'squash', 'badminton'] as const;

/**
 * The portrait, one per theme (§8/G9 — the themes share facts, not artwork).
 * `scripts/optimize-assets.sh` emits a large and a small WebP for each from
 * `assets-src/me-<theme>.png`.
 *
 * PHOTO is the paper/canonical portrait, and is what OG tags, structured data
 * and the print stylesheet use. Theme components should reach for the matching
 * entry in PHOTOS instead.
 */
export const PHOTOS = {
  paper: {
    src: '/media/me-paper.webp',
    small: '/media/me-paper-small.webp',
  },
  y2k: {
    src: '/media/me-y2k.webp',
    small: '/media/me-y2k-small.webp',
  },
  /**
   * MAC DELIBERATELY SHARES THE Y2K ARTWORK, and the paths are written out rather
   * than referencing PHOTOS.y2k because an object literal cannot read itself.
   *
   * Why the duplication: `assets-src/` is frozen (see README) — no new source
   * artwork can be produced for this repo, so there is no `me-mac.png` to
   * optimise and there is no `me-mac.webp`. Do not add one to this entry hoping
   * it appears; nothing generates it. This knowingly bends G9's one portrait per
   * theme rule, and it is the only place in the four themes where that rule is
   * bent.
   *
   * What makes it read as Macintosh is the *treatment*, not the file: a 1-bit
   * black-and-white dither applied in `src/styles/mac/content-base.css`
   * (grayscale + contrast + a multiply dither overlay, inverted in dark mode).
   *
   * Two constraints follow from sharing pixel art:
   *   - The Y2K note in `theme-y2k.css` still applies in full — this image is a
   *     256px pixel grid scaled up, so rendering must stay nearest-neighbour
   *     (`image-rendering: pixelated`). Let the browser smooth it and it erases
   *     the hard pixel edges the artwork is made of, and the dither on top turns
   *     to mush.
   *   - Never re-encode it lossily. A lossy pass invents grey between the
   *     pixels, which is precisely what a 1-bit treatment then amplifies.
   */
  mac: {
    src: '/media/me-y2k.webp',
    small: '/media/me-y2k-small.webp',
  },
  chat: {
    src: '/media/me-chat.webp',
    small: '/media/me-chat-small.webp',
  },
} as const;

export const PHOTO = {
  src: PHOTOS.paper.src,
  small: PHOTOS.paper.small,
  /** For print (G15) and any context without WebP. */
  fallback: '/media/me.jpeg',
  alt: 'Dylan Nagel',
} as const;
