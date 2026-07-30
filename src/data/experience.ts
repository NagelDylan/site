/**
 * Experience, reverse-chronological, rendered verbatim.
 *
 * Percentages, dollar figures and user counts stay on the résumé. The scope
 * numbers that are here (60 destination categories, a 3,000-line file) are scope,
 * not results.
 */
import type { Role } from './types';

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
    bullets: [
      'Independently designed and built an internal platform for evaluating prompts and agentic workflows end to end, scoring single-turn prompts against labeled datasets and agents on their full tool-call trajectories, with sandboxed custom graders and LLM-as-judge scoring. Python, Django Ninja, Celery, React, and TypeScript.',
      'Built the LLM assistant layer for an internal security dashboard, where a plain-English request rewrites filters, rearranges panels, or updates records through typed tools, each one confirmed by the user and permission-checked before it runs.',
      "Contributed to the security organization's work on Project Glasswing, Anthropic's early-access program for its Mythos model.",
      'Automated recurring leadership reporting, from the data model through server-side chart rendering to scheduled digest emails.',
    ],
    description: null,
    tags: [
      'Python',
      'Django',
      'Django Ninja',
      'Celery',
      'React',
      'TypeScript',
      'LLM Evaluation',
      'Agentic AI',
    ],
    note: null,
    // Text treatment only, never the Apple logo (trademark).
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
      // Vendors stay generic here on purpose.
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
     * This span is a four-month co-op term plus about five months part-time
     * alongside school, so the note has to render: nine continuous months of
     * full-time work would be wrong.
     */
    note: 'Four-month co-op term (Summer 2024), then part-time alongside school through January.',
    logo: '/media/empathia.webp',
    // No outbound link — the site has since been replaced.
    link: null,
  },
];

/** Co-op term map, used by the condensed timeline. */
export const COOP_TERMS = [
  { term: 1, company: 'Empathia.ai', season: 'Summer 2024' },
  { term: 2, company: 'Empathia.ai', season: 'Winter 2025' },
  { term: 3, company: 'Carta', season: 'Fall 2025' },
  { term: 4, company: 'Apple', season: 'Summer 2026' },
] as const;
