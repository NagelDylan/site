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
    'Application Development',
    'Algorithms',
    'Data Structures and Data Management',
    'User Interfaces',
    'Operating Systems',
    'Object-Oriented Software Development',
  ],
};

/** Grouped by how much I actually reach for each thing. No proficiency tiers. */
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
    label: 'Data & Cloud',
    items: ['PostgreSQL', 'MongoDB', 'SQLite', 'Redis/Valkey', 'AWS (S3)'],
  },
  {
    label: 'Infrastructure & Tooling',
    items: [
      'Docker',
      'Kubernetes',
      'Celery',
      'Git',
      'GitHub Actions',
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
