/**
 * VOICE LAYER (spec §8, layer 2).
 *
 * Same facts, three voices. SCOPE IS DELIBERATELY NARROW (§2): hero, about, and
 * project blurbs only. Experience bullets and education are shared verbatim from
 * the fact layer — precision matters more than flavour there, and three drifting
 * copies of a job history is how a date goes stale in exactly one place.
 *
 * Every string in this file is subject to §0. In particular, the Y2K voice is
 * loud, and loud copy is exactly where a hype claim sneaks in:
 *   - No performance metrics, in any voice (R1).
 *   - FlowSense won nothing, in any voice. "Built at Hack the 6ix 2024" is the
 *     ceiling. No "AWARD WINNING", no trophies, no "🏆" (R2).
 *   - Apple gets the approved sentence and no enthusiasm beyond it (R3).
 *   - Graduation 2028; the only 2027 is the co-op term (R4).
 */

export type ThemeId = 'paper' | 'y2k' | 'chat';

export type Voice = {
  /** Hero eyebrow/greeting line, above the name. Optional per theme. */
  greeting: string | null;
  /** Hero sub-line beneath name + headline. */
  heroSub: string;
  /** Primary and secondary hero CTA labels. */
  ctaPrimary: string;
  ctaSecondary: string;
  /** ~60 words. /about intro. */
  bioShort: string;
  /** ~150 words, as paragraphs. /about body. */
  bioLong: string[];
  /** Section headings, so each tree can label its own structure in voice. */
  headings: {
    work: string;
    experience: string;
    projects: string;
    about: string;
    contact: string;
    skills: string;
    education: string;
    interests: string;
  };
  /** One blurb per featured project slug. Facts identical across voices. */
  projectBlurbs: Record<'acronymize' | 'flowsense' | 'tanks', string>;
};

/**
 * Canonical copy, shared where voice must not vary: meta descriptions, OG
 * description, structured data. This is the paper register, which §2 names as
 * the baseline.
 */
export const CANONICAL = {
  metaDescription:
    "Dylan Nagel — full-stack developer and CS student at the University of Waterloo, building AI and LLM systems. Seeking a Summer 2027 software engineering co-op.",
  bioShort:
    "I'm a Computer Science student at the University of Waterloo, currently a software developer intern at Apple. I've built AI evaluation infrastructure, shipped LLM-powered features at Carta, and taken a startup's web platform from redesign through full-stack product work at Empathia.ai. I care about systems that are correct, measurable, and actually used.",
} as const;

const PAPER: Voice = {
  greeting: 'hello — thanks for stopping by',
  heroSub:
    'Computer Science student at the University of Waterloo. I build full-stack products and the AI infrastructure behind them — evaluation platforms, retrieval systems, and LLM-powered features that ship to real users.',
  ctaPrimary: 'See my work',
  ctaSecondary: 'Get in touch',
  bioShort: CANONICAL.bioShort,
  bioLong: [
    'I started out building games in C# and MonoGame — writing A* pathfinding and collision systems from scratch because I wanted to understand how they worked. That turned into full-stack web work, and then into AI systems.',
    "Across four co-op terms I've worked on retrieval-augmented generation, prompt-based classification replacing legacy ML models, and LLM evaluation infrastructure. The pattern I keep coming back to: AI features are easy to demo and hard to trust. Most of my recent work has been on the \u201chard to trust\u201d half — evaluation, measurement, and the plumbing that tells you whether a model change actually helped.",
    "I'm most useful where the frontend and the backend meet the model. I like owning a system end to end, and I like problems where the correct answer isn't obvious until you build something to measure it.",
    'Outside of code: reading, travel planning, and losing at squash and badminton.',
  ],
  headings: {
    work: 'work',
    experience: 'experience',
    projects: 'projects',
    about: 'about',
    contact: 'get in touch',
    skills: 'what I use',
    education: 'school',
    interests: 'off the clock',
  },
  projectBlurbs: {
    acronymize:
      'A word puzzle where the answers spell out an acronym. I wanted feedback that was kinder than right-or-wrong, so a sentence-transformer model grades how close your guess actually was.',
    flowsense:
      'A reading tool for dense PDFs — hover a term, get a definition that knows what page it is on. Four of us built it in a weekend.',
    tanks:
      'A from-scratch rebuild of Wii Play\u2019s "Tanks!" in C#. Every enemy has personality traits that change how it hunts you, which was the whole reason I wrote the pathfinding myself.',
  },
};

/**
 * Y2K: loud, exclamatory, period-accurate web-1.0 enthusiasm. Self-aware and
 * winking (§10 tone) — a few knowing jokes, not a straight-faced museum piece.
 * Every underlying fact is identical to PAPER.
 */
const Y2K: Voice = {
  greeting: '★ WELCOME TO MY HOMEPAGE ★',
  heroSub:
    'CS @ Waterloo. I build products AND the AI infrastructure behind them!! Evaluation platforms, retrieval systems, and LLM features that ship to REAL USERS. (Best viewed in any browser, honestly.)',
  ctaPrimary: 'SEE MY WORK!!',
  ctaSecondary: 'E-MAIL ME',
  bioShort:
    "Computer Science student at the University of Waterloo — currently a software developer intern at Apple!! I've built AI evaluation infrastructure, shipped LLM-powered features at Carta, and taken a startup's web platform from redesign all the way through full-stack product work at Empathia.ai. I like systems that are correct, measurable, and ACTUALLY USED.",
  bioLong: [
    'IT ALL STARTED WITH VIDEO GAMES!! I wrote A* pathfinding and collision systems from scratch in C# and MonoGame because I wanted to know how they worked. That turned into full-stack web work, and then into AI systems.',
    'Across FOUR co-op terms: retrieval-augmented generation, prompt-based classification replacing legacy ML models, and LLM evaluation infrastructure. Here is the thing I keep running into — AI features are EASY TO DEMO and HARD TO TRUST. Most of my recent work is on the hard-to-trust half: evaluation, measurement, and the plumbing that tells you whether a model change actually helped.',
    "I'm most useful where the frontend and the backend meet the model. I like owning a system end to end, and problems where the right answer isn't obvious until you build something to measure it.",
    'WHEN NOT AT THE COMPUTER: reading, travel planning, and losing at squash and badminton. (Losing! I said it!)',
  ],
  headings: {
    work: 'MY WORK',
    experience: 'JOBS I HAVE HAD',
    projects: 'C:\\Projects\\',
    about: 'ABOUT ME!!',
    contact: 'CONTACT ME',
    skills: 'MY SKILLZ',
    education: 'SCHOOL',
    interests: 'HOBBIES',
  },
  projectBlurbs: {
    acronymize:
      'A WORD PUZZLE GAME where the answers spell an acronym!! Three modes, daily puzzles, and an actual ML model that grades HOW CLOSE you were instead of just buzzing at you. ★★★',
    flowsense:
      'UPLOAD A PDF, HOVER A WORD, GET A REAL EXPLANATION that knows what page you are on!! Built at Hack the 6ix 2024 with a team of 4. RAG pipeline doing the heavy lifting.',
    tanks:
      'WII PLAY TANKS, REBUILT FROM SCRATCH IN C#!! Every enemy has personality traits that change how it hunts you. A* pathfinding, auto-aim that LEADS YOUR TARGET, the works. 🚧 my magnum opus 🚧',
  },
};

/**
 * Chatbot: conversational, third-person advocate (§11.2). Talks *about* Dylan,
 * never as him — a synthetic first-person Dylan is uncanny and invites "did he
 * actually write this?". Openly, humorously transparent that its job is to make
 * him look good. It never lies; the humour comes from the obvious bias, not
 * from embellishment.
 */
const CHAT: Voice = {
  greeting: "Hi! I'm Dylan's assistant.",
  heroSub:
    "Full disclosure: my entire job is making Dylan look good, and I'm very committed to it. Ask me anything — I'll keep it true.",
  ctaPrimary: 'Ask about his work',
  ctaSecondary: 'How to reach him',
  bioShort:
    "Dylan is a Computer Science student at the University of Waterloo, currently a software developer intern at Apple. He's built AI evaluation infrastructure, shipped LLM-powered features at Carta, and taken a startup's web platform from redesign through full-stack product work at Empathia.ai. He cares about systems that are correct, measurable, and actually used.",
  bioLong: [
    'He started with games — C# and MonoGame, writing A* pathfinding and collision from scratch because he wanted to understand how they worked. That became full-stack web work, and then AI systems.',
    "Four co-op terms in, the through-line is retrieval-augmented generation, prompt-based classification replacing legacy ML models, and LLM evaluation infrastructure. His own framing: AI features are easy to demo and hard to trust, and most of his recent work is on the hard-to-trust half — evaluation, measurement, and the plumbing that tells you whether a model change actually helped.",
    "He's most useful where the frontend and the backend meet the model, he likes owning a system end to end, and he likes problems where the correct answer isn't obvious until you build something to measure it.",
    'Away from the keyboard: reading, travel planning, and — his word, not mine — losing at squash and badminton.',
  ],
  headings: {
    work: 'His work',
    experience: 'Where he has worked',
    projects: 'Projects',
    about: 'About Dylan',
    contact: 'Reaching him',
    skills: 'What he works with',
    education: 'School',
    interests: 'Outside of code',
  },
  projectBlurbs: {
    acronymize:
      "Acronymize — a word puzzle where the answers spell out an acronym. The part worth noticing: he trained semantic scoring into it with a sentence-transformer model, so players get graded feedback instead of a binary buzz. Solo build.",
    flowsense:
      'FlowSense — upload a dense PDF, hover a term, get an explanation grounded in the surrounding text rather than a dictionary definition. Built at Hack the 6ix 2024 on a team of four.',
    tanks:
      "Tanks — a from-scratch recreation of Wii Play's \u201cTanks!\u201d in C# and MonoGame. He wrote the A* pathfinding himself so each enemy could have personality traits that change how it engages. This is the one where you can see he wanted to understand the machinery.",
  },
};

export const VOICES: Record<ThemeId, Voice> = { paper: PAPER, y2k: Y2K, chat: CHAT };

/** The four starter prompts for the chat theme (§11.3). Exact wording. */
export const STARTER_PROMPTS = [
  "What's his strongest project?",
  'Walk me through his AI work',
  'Is he available?',
  'Why should we hire him?',
] as const;
