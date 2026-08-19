/**
 * Copy for the desktop: hero, bio and project blurbs. Loud and self-aware, but
 * never a source of new facts — experience bullets and education come straight
 * from src/data, where precision matters more than flavour.
 */
export type Copy = {
  /** Hero eyebrow, above the name. */
  greeting: string;
  /** Hero sub-line beneath name + headline. */
  heroSub: string;
  ctaPrimary: string;
  ctaSecondary: string;
  bioShort: string;
  bioLong: string[];
  headings: {
    experience: string;
    projects: string;
    about: string;
    contact: string;
    skills: string;
    education: string;
  };
  projectBlurbs: Record<"acronymize" | "flowsense" | "tanks" | "breadcrumbs", string>;
};

/**
 * The plain-voice versions, for places a search engine or a social card reads:
 * meta description, Open Graph, structured data.
 */
export const CANONICAL = {
  metaDescription:
    "Dylan Nagel — full-stack developer and CS student at the University of Waterloo, building AI and LLM systems. Seeking a Summer 2027 software engineering co-op.",
  bioShort:
    "I'm a Computer Science student at the University of Waterloo, currently a software developer intern at Apple. I've built AI evaluation infrastructure, shipped LLM-powered features at Carta, and taken a startup's web platform from redesign through full-stack product work at Empathia.ai. I care about systems that are correct, measurable, and actually used.",
} as const;

export const COPY: Copy = {
  greeting: "★ WELCOME TO MY HOMEPAGE ★",
  heroSub:
    "CS @ Waterloo. I build products AND the AI infrastructure behind them!! Evaluation platforms, retrieval systems, and LLM features that ship to REAL USERS.",
  ctaPrimary: "SEE MY WORK!!",
  ctaSecondary: "E-MAIL ME",
  bioShort:
    "Computer Science student at the University of Waterloo — currently a software developer intern at Apple!! I've built AI evaluation infrastructure, shipped LLM-powered features at Carta, and taken a startup's web platform from redesign all the way through full-stack product work at Empathia.ai. I like systems that are correct, measurable, and ACTUALLY USED.",
  bioLong: [
    "IT ALL STARTED WITH VIDEO GAMES!! I wrote A* pathfinding and collision systems from scratch in C# and MonoGame because I wanted to know how they worked. That turned into full-stack web work, and then into AI systems.",
    "Across FOUR co-op terms: retrieval-augmented generation, prompt-based classification replacing legacy ML models, and LLM evaluation infrastructure. Here is the thing I keep running into — AI features are EASY TO DEMO and HARD TO TRUST. Most of my recent work is on the hard-to-trust half: evaluation, measurement, and the plumbing that tells you whether a model change actually helped.",
    "I'm most useful where the frontend and the backend meet the model. I like owning a system end to end, and problems where the right answer isn't obvious until you build something to measure it.",
  ],
  headings: {
    experience: "JOBS I HAVE HAD",
    projects: "C:\\Projects\\",
    about: "ABOUT ME!!",
    contact: "CONTACT ME",
    skills: "MY SKILLZ",
    education: "SCHOOL",
  },
  projectBlurbs: {
    acronymize:
      "A WORD PUZZLE GAME where the answers spell an acronym!! Three modes, daily puzzles, and an actual ML model that grades HOW CLOSE you were instead of just buzzing at you. ★★★",
    flowsense:
      "UPLOAD A PDF, HOVER A WORD, GET A REAL EXPLANATION that knows what page you are on!! Built at Hack the 6ix 2024 with a team of 4. RAG pipeline doing the heavy lifting.",
    tanks:
      "WII PLAY TANKS, REBUILT FROM SCRATCH IN C#!! Every enemy has personality traits that change how it hunts you. A* pathfinding, auto-aim that LEADS YOUR TARGET, the works. 🚧 my magnum opus 🚧",
    breadcrumbs:
      "TURN YOUR TRIP PHOTOS INTO A MAP!! Pan around and Postgres hands back exactly the stops and routes in view, at the zoom level you're at. I owned the DATABASE and the MAP end to end — PostGIS, RLS, the whole Mapbox integration.",
  },
};
