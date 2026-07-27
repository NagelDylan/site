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

export const PHOTO = {
  src: '/media/me.webp',
  small: '/media/me-small.webp',
  /** For print (G15) and any context without WebP. */
  fallback: '/media/me.jpeg',
  alt: 'Dylan Nagel',
} as const;
