/**
 * Projects (spec §5 featured, §6 secondary).
 *
 * Two hard rules live in this file:
 *
 *   R2 — FlowSense won no award. It was built at Hack the 6ix 2024 and placed
 *        nowhere. Never add a placement, prize, trophy, or award badge. Two of
 *        Dylan's own public documents still wrongly claim 1st at Hack the North
 *        (§15); this site is the correct version, not a copy of them.
 *
 *   R1 — No performance metrics. Tanks' beta-tester count and session-duration
 *        figures are deliberately absent (§5) and belong on the résumé only.
 */
import type { Project, SecondaryProject } from './types';

export const FEATURED: Project[] = [
  {
    slug: 'acronymize',
    name: 'Acronymize',
    summary:
      'Word puzzle game where you guess words that form an acronym from a theme and clues, with Wordle-style colour feedback.',
    built: 'Oct – Nov 2025',
    team: 'Solo',
    stack: ['React 19', 'TypeScript', 'Vite', 'Django', 'PostgreSQL (Neon)', 'Clerk'],
    highlights: [
      'Three game modes — Level Up with par scoring, Endless for high scores, and a Daily Puzzle.',
      'Clerk authentication for cross-session progress tracking.',
      'An ML sentence-transformer model that scores semantic similarity between a guess and the answer, so players get graded feedback instead of just right/wrong.',
    ],
    framing: null,
    links: [{ label: 'GitHub', href: 'https://github.com/NagelDylan/Acronymize', verified: true }],
    // Live demo is deliberately ABSENT, not disabled (§5). Dylan will deploy
    // acronymize.nagelbros.com before applications; adding it is one entry here
    // and the button appears everywhere at once.
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
    built: 'Hack the 6ix, 2024',
    team: 'Team of 4',
    stack: ['React', 'Django', 'PostgreSQL', 'Python', 'OpenAI GPT API'],
    highlights: [
      'RAG pipeline feeding surrounding document text to the model, so explanations are contextual rather than dictionary definitions.',
      'Inline annotations and keyboard shortcuts to avoid breaking reading flow.',
      'PDF processing that preserves original formatting.',
      'Tab-based interface for multiple documents.',
    ],
    /**
     * R2. This is the only permitted framing. No placement, no trophy, no badge.
     * Teammates are not named, by request (§5).
     */
    framing: 'Built at Hack the 6ix 2024.',
    links: [
      // Dylan's fork, not upstream (§5).
      { label: 'GitHub', href: 'https://github.com/NagelDylan/FlowSense', verified: true },
      { label: 'Demo video', href: 'https://www.youtube.com/watch?v=2c1xXcaIki8', verified: true },
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
    built: '2023 – 2024',
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
      { label: 'GitHub', href: 'https://github.com/NagelDylan/Tanks', verified: true },
      { label: 'Gameplay video', href: 'https://youtu.be/OBn8ILREHPM', verified: true },
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

/**
 * Secondary projects (§6). Six items; everything else is excluded.
 *
 * LINK PROVENANCE: the spec gives these as "repo" without full URLs, so the
 * repo paths below are inferred from the folder names in the §19.9 wireframe
 * and are marked `verified: false`. The launch pass must confirm each one by
 * hand (spec Appendix: outbound links were unreachable when the spec was
 * compiled). Anything still unverified can be hidden via LINK_AUDIT in config.
 */
export const SECONDARY: SecondaryProject[] = [
  {
    name: 'Ice Cold Butter Beer',
    stack: ['C#', 'MonoGame'],
    oneLiner: 'Retro arcade recreation with six modes and ball-physics simulation.',
    links: [
      { label: 'Repo', href: 'https://github.com/NagelDylan/IceColdButterBeer', verified: false },
      { label: 'Video', href: 'https://youtu.be/Z7evVo3lrIY', verified: true },
    ],
  },
  {
    name: 'Minecraft Mayhem',
    stack: ['C#', 'MonoGame'],
    oneLiner: 'Galaga-style shooter crossed with Minecraft.',
    links: [
      { label: 'Repo', href: 'https://github.com/NagelDylan/MinecraftMayhem', verified: false },
      { label: 'Video', href: 'https://youtu.be/z5gk4eCsG0k', verified: true },
    ],
  },
  {
    name: 'Sniper Assassin',
    stack: ['C#', 'MonoGame'],
    oneLiner: 'Sniper-scope shooter with a UAV recon system.',
    links: [
      { label: 'Repo', href: 'https://github.com/NagelDylan/SniperAssassin', verified: false },
      { label: 'Video', href: 'https://youtube.com/shorts/2V840XqLhFM', verified: true },
    ],
  },
  {
    name: 'Wordle',
    stack: ['C#', 'MonoGame'],
    oneLiner: 'Word puzzle clone with local statistics tracking.',
    links: [{ label: 'Repo', href: 'https://github.com/NagelDylan/Wordle', verified: false }],
  },
  {
    name: 'Recipe Finder',
    stack: ['HTML', 'JavaScript', 'REST API', 'Cloudflare'],
    oneLiner: 'Recipe search by available ingredients and dietary restrictions.',
    links: [{ label: 'Repo', href: 'https://github.com/NagelDylan/RecipeFinder', verified: false }],
  },
  {
    name: 'Whitby Medical Clinic',
    stack: ['JavaScript', 'HTML', 'CSS'],
    oneLiner: 'Responsive clinic site — freelance client work, 2023.',
    /**
     * Repo ONLY (§6). Do not link or embed the live clinic site: the
     * nageldylan.github.io/WhitbyMedical/ URL is registered on a different repo
     * (MedicalClinic) and must not be surfaced.
     */
    links: [{ label: 'Repo', href: 'https://github.com/NagelDylan/WhitbyMedical', verified: true }],
  },
];

/**
 * Excluded entirely (§6): SpotifAI, SpeakType, AdhdDoctor, TicTacToe,
 * MedicalClinic, and the old portfolio repo.
 *
 * These four — and ONLY these four — appear in the Y2K Recycle Bin as a joke
 * (§10, §19.9). MedicalClinic and the old portfolio repo must not be surfaced
 * anywhere, including the gag.
 */
export const RECYCLE_BIN = ['SpotifAI', 'SpeakType', 'AdhdDoctor', 'TicTacToe'] as const;

/**
 * BlinkTrack and ContextAI are omitted (§6): both are announced on Dylan's
 * GitHub README with no repos behind them, and a "currently building" section
 * that links nowhere reads as vapour. Ship one and it becomes a featured
 * project. Do not add a "coming soon" section.
 */
