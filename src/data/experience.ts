/**
 * Experience (spec §4). Reverse-chronological.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ALL COPY IN THIS FILE IS FINAL AND SHARED VERBATIM BY ALL THREE THEMES.
 * Do not rewrite it in a theme's voice. Spec §2 scopes the three-voice strategy
 * to hero / about / project blurbs only, precisely so job history cannot drift.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * On numbers in this file: R1 bans *performance* metrics — percentages, dollar
 * figures, user counts (the §14 list). It does not ban technical scope. Carta's
 * "roughly 60 destination categories" and "3,000+ line file" are approved
 * verbatim copy (§4.2, and both appear in the §19.3 and §19.8 wireframes).
 * Do not "clean" them out.
 */
import type { Role } from './types';

/**
 * Apple's description is a single swappable field, per the build note in §4.1.
 *
 * R3: this exact wording, nothing more. No project names, no internal tooling,
 * no internal URLs, no scale claims. Substantially more material exists and is
 * held OUTSIDE this repo pending manager approval; it must never be pasted
 * here, quoted in a commit, or fed to a model.
 *
 * When cleared, replace this one string. Nothing else needs to change.
 */
export const APPLE_DESCRIPTION =
  'Working in security engineering: developing dispatch software, building prompt evaluation platforms, enriching data pipelines, and running agentic performance evaluations to drive LLM improvements.';

export const ROLES: Role[] = [
  {
    slug: 'apple',
    company: 'Apple',
    title: 'Software Developer, Intern',
    dates: 'May 2026 – Aug 2026',
    datesShort: 'May–Aug 2026',
    startISO: '2026-05',
    location: 'Cupertino, CA',
    arrangement: 'Hybrid',
    current: true,
    coopTerm: 4,
    bullets: [],
    description: APPLE_DESCRIPTION,
    tags: ['Python', 'Django', 'React', 'TypeScript', 'LLM Evaluation', 'Agentic AI'],
    note: null,
    // Text treatment only — never the Apple logo (§13, trademark).
    logo: null,
    link: null,
  },
  {
    slug: 'carta',
    company: 'Carta',
    title: 'Software Development Intern',
    dates: 'Sep 2025 – Dec 2025',
    datesShort: 'Sep–Dec 2025',
    startISO: '2025-09',
    location: 'Waterloo, ON',
    arrangement: 'Hybrid',
    current: false,
    coopTerm: 3,
    bullets: [
      "Independently designed and built an AI email routing service (Python/Django) for Carta's AI-first Fund Admin platform, classifying inbound operational email by purpose and routing it to the correct internal team across roughly 60 destination categories. Delivered behind a feature flag, production-ready, and handed off.",
      'Replaced legacy ML classification with prompt-based categorization using GPT-4o, evaluated with Braintrust to compare against the model it replaced.',
      'Re-architected email dispatch rules from a 3,000+ line hardcoded file into a database-driven design, and built a CLI tool plus a Claude skill so teammates could author email filtering rules without touching application code.',
      'Designed a RESTful API and refactored the PostgreSQL schema to support AI prediction logging and surface model output in the frontend.',
      'Built React features for the Fund Admin dashboard and instrumented analytics with Snowplow and Amplitude, working with the analytics and frontend teams on event tracking.',
      'Built Metabase dashboards for workflow visibility; shipped within a Docker and Kubernetes CI/CD pipeline.',
      // Vendor names genericized by Dylan's decision (§4.2). Do not restore
      // Mercury Messenger, Coastal Bank, Justworks, or SVB.
      'Built automations for recurring notifications from banking and payroll providers.',
    ],
    description: null,
    tags: [
      'Python',
      'Django',
      'PostgreSQL',
      'React',
      'GPT-4o',
      'Braintrust',
      'Docker',
      'Kubernetes',
      'Snowplow',
      'Amplitude',
      'Metabase',
    ],
    note: null,
    logo: '/media/carta.webp',
    link: null,
  },
  {
    slug: 'empathia-fullstack',
    company: 'Empathia.ai',
    title: 'Full Stack Developer',
    dates: 'Jan 2025 – May 2025',
    datesShort: 'Jan–May 2025',
    startISO: '2025-01',
    location: 'Pasadena, CA',
    arrangement: 'Remote',
    current: false,
    coopTerm: 2,
    bullets: [
      'Built a full-stack retrieval-augmented generation system in Python and TypeScript that pulled context from user notes and prior interactions to improve the AI smart-edit feature.',
      'Developed API endpoints and optimized database queries across the React frontend and the Express and FastAPI backends.',
      'Launched a blog portal — images on S3, rich text in MongoDB — letting the marketing team publish SEO-optimized posts with full metadata control, independent of engineering.',
      'Rebuilt website notifications and the feature-request flow with backend automation, streamlining feature rollouts and enabling self-serve access requests.',
      'Refined prompt engineering for the smart-edit and AI-learning prompts to give the model richer context.',
    ],
    description: null,
    tags: ['React', 'TypeScript', 'Python', 'FastAPI', 'Express', 'Node.js', 'MongoDB', 'AWS S3', 'RAG'],
    note: null,
    logo: '/media/empathia.webp',
    link: null,
  },
  {
    slug: 'empathia-website',
    company: 'Empathia.ai',
    title: 'Website Developer',
    dates: 'May 2024 – Jan 2025',
    datesShort: 'May 2024 – Jan 2025',
    startISO: '2024-05',
    location: 'Pasadena, CA',
    arrangement: 'Remote',
    current: false,
    coopTerm: 1,
    bullets: [
      "Independently owned the design, development, and deployment of Empathia.ai's website in React and Node.js, consulting with marketing and engineering on performance and UX.",
      'Integrated Google Tag Manager and Google Analytics and implemented an SEO strategy that grew organic search traffic.',
      'Built and ran email marketing campaigns through Mailchimp and Mandrill.',
    ],
    description: null,
    tags: ['React', 'Node.js', 'SEO', 'Google Analytics', 'Google Tag Manager', 'Mailchimp'],
    /**
     * Required by §4.4. This span is a four-month co-op term followed by about
     * five months part-time alongside school; the site must not imply nine
     * continuous months of full-time work. Every theme must render this note.
     */
    note: 'Four-month co-op term (Summer 2024), then part-time alongside school through January.',
    logo: '/media/empathia.webp',
    // No outbound link — the site has since been replaced (§4.4).
    link: null,
  },
];

/**
 * Excluded from the experience section by Dylan's decision (§4.5).
 * Whitby Medical Walk In Clinic appears as a project card only — see projects.ts.
 */
export const EXPERIENCE_EXCLUSIONS = ['Whitby Medical Walk In Clinic'] as const;

/** Co-op term map (§3), used by the condensed timeline and the chatbot. */
export const COOP_TERMS = [
  { term: 1, company: 'Empathia.ai', season: 'Summer 2024' },
  { term: 2, company: 'Empathia.ai', season: 'Winter 2025' },
  { term: 3, company: 'Carta', season: 'Fall 2025' },
  { term: 4, company: 'Apple', season: 'Summer 2026' },
] as const;
