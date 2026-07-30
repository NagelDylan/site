/**
 * Projects.
 *
 * FlowSense placed nowhere: it was built at Hack the 6ix 2024, and some of my
 * older writeups wrongly say 1st at Hack the North. This file is the right one.
 *
 * Tanks' tester counts and session figures are left out here — they live on the
 * résumé, along with every other number of that kind.
 */
import type { Project, SecondaryProject } from './types';

export const FEATURED: Project[] = [
  {
    slug: 'acronymize',
    name: 'Acronymize',
    summary:
      'Word puzzle game where you guess words that form an acronym from a theme and clues, with Wordle-style colour feedback.',
    team: 'Solo',
    stack: ['React 19', 'TypeScript', 'Vite', 'Django', 'PostgreSQL (Neon)', 'Clerk'],
    highlights: [
      'Three game modes — Level Up with par scoring, Endless for high scores, and a Daily Puzzle.',
      'Clerk authentication for cross-session progress tracking.',
      'An ML sentence-transformer model that scores semantic similarity between a guess and the answer, so players get graded feedback instead of just right/wrong.',
    ],
    framing: null,
    links: [{ label: 'GitHub', href: 'https://github.com/NagelDylan/Acronymize' }],
    // No live demo yet on purpose. Once acronymize.nagelbros.com is deployed,
    // one entry here makes the button appear everywhere.
    media: {
      animated: '/media/acronymize.webp',
      poster: '/media/acronymize-poster.webp',
      alt: 'Acronymize gameplay: guessing words that spell out an acronym, with colour-coded feedback',
      width: 800,
      height: 717,
    },
  },
  {
    slug: 'flowsense',
    name: 'FlowSense',
    summary:
      'Reading tool for dense documents: upload a PDF and get context-aware definitions inline, without leaving the page.',
    team: 'Team of 4',
    stack: ['React', 'Django', 'PostgreSQL', 'Python', 'OpenAI GPT API'],
    highlights: [
      'RAG pipeline feeding surrounding document text to the model, so explanations are contextual rather than dictionary definitions.',
      'Inline annotations and keyboard shortcuts to avoid breaking reading flow.',
      'PDF processing that preserves original formatting.',
      'Tab-based interface for multiple documents.',
    ],
    /** How it gets described, in full. No placement, and teammates are not named. */
    framing: 'Built at Hack the 6ix 2024.',
    links: [
      // My fork, not upstream.
      { label: 'GitHub', href: 'https://github.com/NagelDylan/FlowSense' },
      { label: 'Demo video', href: 'https://www.youtube.com/watch?v=2c1xXcaIki8' },
    ],
    media: {
      animated: '/media/flowsense.webp',
      poster: '/media/flowsense-poster.webp',
      alt: 'FlowSense: hovering a term in a PDF surfaces a context-aware definition inline',
      width: 390,
      height: 346,
    },
  },
  {
    slug: 'tanks',
    name: 'Tanks',
    summary: 'From-scratch recreation of "Tanks!" from Wii Play.',
    team: 'Solo',
    stack: ['C#', 'MonoGame', '.NET'],
    highlights: [
      'A* pathfinding where each enemy has personality traits that change how it moves and engages.',
      'Geometric auto-aim that leads moving targets.',
      'Collision detection across bullets, walls, tanks, and water.',
      'Persistent save state for stars, statistics, and unlocked levels.',
    ],
    framing: null,
    links: [
      { label: 'GitHub', href: 'https://github.com/NagelDylan/Tanks' },
      { label: 'Gameplay video', href: 'https://youtu.be/OBn8ILREHPM' },
    ],
    media: {
      animated: '/media/tanks.webp',
      poster: '/media/tanks-poster.webp',
      alt: 'Tanks gameplay: top-down arena with player and enemy tanks exchanging fire',
      width: 400,
      height: 360,
    },
  },
];

/** Older projects, in short form. */
export const SECONDARY: SecondaryProject[] = [
  {
    name: 'Ice Cold Butter Beer',
    stack: ['C#', 'MonoGame'],
    oneLiner: 'Retro arcade recreation with six modes and ball-physics simulation.',
    links: [
      { label: 'Repo', href: 'https://github.com/NagelDylan/IceColdButterBeer' },
      { label: 'Video', href: 'https://youtu.be/Z7evVo3lrIY' },
    ],
  },
  {
    name: 'Minecraft Mayhem',
    stack: ['C#', 'MonoGame'],
    oneLiner: 'Galaga-style shooter crossed with Minecraft.',
    links: [
      { label: 'Repo', href: 'https://github.com/NagelDylan/MinecraftMayhem' },
      { label: 'Video', href: 'https://youtu.be/z5gk4eCsG0k' },
    ],
  },
  {
    name: 'Sniper Assassin',
    stack: ['C#', 'MonoGame'],
    oneLiner: 'Sniper-scope shooter with a UAV recon system.',
    links: [
      { label: 'Repo', href: 'https://github.com/NagelDylan/SniperAssassin' },
      { label: 'Video', href: 'https://youtube.com/shorts/2V840XqLhFM' },
    ],
  },
  {
    name: 'Wordle',
    stack: ['C#', 'MonoGame'],
    oneLiner: 'Word puzzle clone with local statistics tracking.',
    links: [{ label: 'Repo', href: 'https://github.com/NagelDylan/Wordle' }],
  },
  {
    name: 'Recipe Finder',
    stack: ['HTML', 'JavaScript', 'REST API', 'Cloudflare'],
    oneLiner: 'Recipe search by available ingredients and dietary restrictions.',
    links: [{ label: 'Repo', href: 'https://github.com/NagelDylan/RecipeFinder' }],
  },
  {
    name: 'Whitby Medical Clinic',
    stack: ['JavaScript', 'HTML', 'CSS'],
    oneLiner: 'Responsive clinic site — freelance client work, 2023.',
    // Repo only: the live URL is served from a different repo.
    links: [{ label: 'Repo', href: 'https://github.com/NagelDylan/WhitbyMedical' }],
  },
];

/** Thrown away, and in the Recycle Bin for the joke. */
export const RECYCLE_BIN = ['SpotifAI', 'SpeakType', 'AdhdDoctor', 'TicTacToe'] as const;

/* BlinkTrack and ContextAI have no repos behind them yet, so they are not here. */
