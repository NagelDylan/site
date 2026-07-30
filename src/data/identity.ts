/** Identity and contact facts. Phone number stays on the résumé. */

export const IDENTITY = {
  name: "Dylan Nagel",
  headline: "Full-Stack Developer · AI & LLM Systems",
  location: "Waterloo, ON",
  email: "dylannagel05@gmail.com",
  /** A work-term claim, not a graduation claim: I graduate in 2028. */
  availability: "Seeking a Summer 2027 software engineering co-op",
  availabilityShort: "Seeking Summer 2027 co-op",
} as const;

export const SOCIALS = {
  linkedin: "https://www.linkedin.com/in/nageldylan/",
  github: "https://github.com/NagelDylan",
} as const;

/**
 * The portrait. `scripts/optimize-assets.sh` emits both WebPs from
 * `assets-src/me-y2k.png`.
 *
 * It is a 256px pixel grid scaled up, so it must render nearest-neighbour
 * (`image-rendering: pixelated` — see y2k.css) and must never be re-encoded
 * lossily: a lossy pass invents grey between the pixels and softens exactly the
 * hard edges the artwork is made of.
 */
export const PHOTO = {
  src: "/media/me-y2k.webp",
  small: "/media/me-y2k-small.webp",
  alt: "Dylan Nagel",
} as const;
