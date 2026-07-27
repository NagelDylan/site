/**
 * Education (spec §3) and skills (spec §7).
 */
import type { Education, SkillGroup } from './types';

/**
 * R4: graduation year is 2028. Never write 2027 here.
 *
 * 2027 appears on this site in exactly one context — the Summer 2027 co-op
 * availability line — and that is a term, not a degree date. A false degree
 * date on a public page is not acceptable, and co-op recruiters screen on term
 * availability anyway.
 */
export const EDUCATION: Education = {
  school: 'University of Waterloo',
  degree: 'Bachelor of Computer Science',
  program: 'Honours Cooperative Program',
  location: 'Waterloo, ON',
  dates: 'Sep 2023 – Expected 2028',
  gpa: '3.9',
  coursework: [
    'Object-Oriented Software Engineering',
    'Logic and Computation',
    'Tools for Software Engineering',
    'Algorithms and Data Abstraction',
  ],
};

/**
 * No proficiency tiers (§7) — grouped lists, ordered by centrality to actual
 * work. Do not add star ratings, percentages, or "expert/intermediate" labels.
 *
 * Cut by Dylan's decision — DO NOT REINSTATE: Kafka, Java, C, C++.
 */
export const SKILLS: SkillGroup[] = [
  { label: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'C#', 'SQL', 'Bash'] },
  {
    label: 'Frontend',
    items: ['React', 'TanStack', 'Vite', 'Tailwind CSS', 'styled-components', 'HTML/CSS'],
  },
  {
    label: 'Backend',
    items: ['Django', 'Django Ninja', 'FastAPI', 'Flask', 'Node.js', 'Express', 'Celery', '.NET'],
  },
  {
    label: 'AI & LLM',
    items: [
      'RAG',
      'prompt engineering',
      'LLM evaluation',
      'agentic AI and tool-use harnesses',
      'OpenAI API',
      'GPT-4o',
      'Braintrust',
      'sentence transformers',
    ],
  },
  {
    label: 'Data & Cloud',
    items: ['PostgreSQL', 'MongoDB', 'MySQL', 'SQLite', 'Redis', 'AWS (S3)', 'GCP'],
  },
  {
    label: 'Infrastructure & Tooling',
    items: [
      'Docker',
      'Kubernetes',
      'Celery',
      'Redis',
      'Git',
      'GitHub Actions',
      'Jenkins',
      'Jira',
      'Figma',
      'Cloudflare',
      'n8n',
      'pytest',
      'Playwright',
    ],
  },
  {
    label: 'Analytics',
    items: ['Snowplow', 'Amplitude', 'Metabase', 'Google Analytics', 'Google Tag Manager'],
  },
];
