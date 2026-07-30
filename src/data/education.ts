/**
 * Education and skills.
 */
import type { Education, SkillGroup } from './types';

/**
 * Graduation is 2028. The Summer 2027 in the availability line is a work term, not
 * a degree date, and the two are easy to conflate.
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
 * Grouped by how central each thing is to real work, and with no proficiency
 * tiers — no stars, no percentages, no "expert/intermediate".
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
