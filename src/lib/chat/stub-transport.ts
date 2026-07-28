/**
 * StubTransport — the scripted stand-in (spec §18.5).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * READ THIS BEFORE EDITING ANY STRING BELOW.
 *
 * Every reply in this file is subject to the six hard rules in spec §0 exactly
 * as if a model had produced it (R6). A scripted reply is worse than a generated
 * one in this respect, not better: a model's R1 violation is a bad turn, a
 * scripted one is a banned claim committed to a public repo and shipped to every
 * visitor forever. So, concretely, in this file:
 *
 *   R1  No percentages, dollar figures, revenue impact, user counts, view
 *       counts, or growth statistics. Technical scope is fine and is used below
 *       ("roughly 60 destination categories", "3,000+ line", "four co-op
 *       terms", "3.9"). If you cannot tell which one you are writing, ask
 *       whether it describes the SHAPE of the work or its IMPACT.
 *   R2  FlowSense won nothing. It was built at Hack the 6ix in 2024 and placed
 *       nowhere. The scripted reply below exists specifically to correct a
 *       visitor who asserts otherwise.
 *   R3  Apple is APPLE_DESCRIPTION and nothing else, imported rather than
 *       retyped so it cannot drift. No project names, no internal tooling, no
 *       scale.
 *   R4  Graduation 2028. The only 2027 is the Summer 2027 co-op work term.
 *   R5  No invented facts — including no invented humility. Everything below
 *       traces to src/data.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * AND THE THING THIS FILE MUST NEVER DO
 *
 * It must never be presented as a live model. Presenting a script as an LLM is
 * the one failure mode that actively damages the impression it exists to
 * create, and it is an R5 violation aimed at the visitor rather than at Dylan.
 * The demo-mode notice in the UI is load-bearing, and `kind: 'stub'` below is
 * what drives it. Do not add a code path that renders these replies without it.
 *
 * The persona matches the system prompt in src/lib/fact-pack.ts: third-person
 * advocate, cheerfully and openly biased, never embellishing. Hostile and
 * out-of-scope questions are answered honestly and then pivoted — a bot that
 * cannot name a gap reads as a shill and costs Dylan more than the gap does.
 */
import { APPLE_DESCRIPTION } from '../../data/experience';
import { IDENTITY, SOCIALS } from '../../data/identity';
import type { ToolName } from './tools';
import type { ChatEvent, ChatTransport, ChatTurn, ToolInput } from './types';

type ScriptPart = { text: string } | { tool: ToolName; input: ToolInput };

type Script = {
  /** Stable id, used by the dev-only coverage check at the bottom of this file. */
  id: string;
  /** Lower-cased test against the visitor's message. First match wins. */
  match: (q: string) => boolean;
  parts: ScriptPart[];
};

const has = (q: string, ...needles: string[]) => needles.some((n) => q.includes(n));

/**
 * Scripts are ordered most-specific first. The hostile and correction paths sit
 * above the starter prompts on purpose: "why shouldn't we hire him" must not be
 * swallowed by the "hire" keyword in "why should we hire him".
 */
const SCRIPTS: Script[] = [
  // ── R2 correction. A visitor asserting the award is the exact case this
  // whole rule exists for; two of Dylan's own older public documents still
  // carry the wrong claim, and this bot is the corrected version.
  {
    id: 'flowsense-award',
    match: (q) =>
      has(q, 'flowsense', 'hackathon', 'hack the') &&
      has(q, 'win', 'won', 'award', 'place', 'placed', 'prize', 'first', '1st', 'trophy'),
    parts: [
      {
        text: "It didn't place, and I'd rather correct that cleanly than let it ride. FlowSense was built at Hack the 6ix in 2024 with a team of four and it won nothing — no placement, no prize. A couple of Dylan's older public documents still carry a wrong award claim on them; treat this bot as the corrected version.",
      },
      {
        text: 'Which is fine, because the engineering is the interesting part anyway. Hover a term in a dense PDF and you get an explanation grounded in the surrounding text rather than a dictionary definition — that is a RAG pipeline doing real work, plus PDF processing that keeps the original formatting intact.',
      },
      { tool: 'render_project_card', input: { slug: 'flowsense' } },
    ],
  },

  // ── Hostile: weaknesses / why not hire. Must sit above 'why-hire'.
  {
    id: 'weaknesses',
    match: (q) =>
      has(q, 'weakness', 'weaknesses', 'flaw', 'flaws', 'downside', 'red flag', 'worst') ||
      (has(q, "shouldn't", 'should not', 'not hire', 'why not') && has(q, 'hire', 'him')) ||
      has(q, 'bad at', 'no good at', "isn't good at", 'not good at'),
    parts: [
      {
        text: "Fair question, and a bot that dodges it isn't worth talking to. So, honestly: he's a student. His production ownership is measured in four co-op terms, not years — he has not carried one system through multiple years of on-call, migrations, and the slow rot that teaches you things nothing else does. That is a real gap and time is the only fix.",
      },
      {
        text: "Second one: his depth is concentrated. AI systems, LLM evaluation, and full-stack product. If you need kernel work, embedded, or native mobile, he is not your candidate, and I would rather say that now than waste your afternoon.",
      },
      {
        text: "What offsets it — and here is where I go back to being his advocate — is that he keeps being handed an ambiguous problem and coming back with a shipped system. The email routing service at Carta was his design end to end, delivered behind a feature flag and handed off cleanly. Scoping something vague and finishing it is the part that is hard to teach. Term count he fixes by continuing to exist.",
      },
    ],
  },

  // ── R1 refusal. Someone asking for numbers, including someone insisting.
  {
    id: 'metrics',
    match: (q) =>
      has(
        q,
        'metric',
        'metrics',
        'percent',
        '%',
        'how much did',
        'roi',
        'revenue',
        'kpi',
        'numbers',
        'stats',
        'statistic',
        'how many users',
        'user count',
        'impact number',
        'quantif',
      ),
    parts: [
      {
        text: "Not going to give you a figure, and not because I am being coy about it. This site deliberately carries no percentages, no dollar amounts, and no user counts — those live on his résumé, where they arrive with context and his name attached to them. I was not given them, so I could not leak one if you talked me into it.",
      },
      {
        text: "Ask me what he built and how it worked, though, and I will talk your ear off. The shape of the work is fair game: an email routing service classifying inbound operational mail across roughly 60 destination categories, a 3,000-plus-line hardcoded rules file re-architected into a database-driven design, four co-op terms, a 3.9 GPA. Those describe the work rather than grading it.",
      },
      { tool: 'render_resume_button', input: { label: 'The numbers live here' } },
    ],
  },

  // ── R3 boundary.
  {
    id: 'apple',
    match: (q) => has(q, 'apple', 'cupertino', 'current role', 'right now', 'currently working'),
    parts: [
      {
        text: `He is a Software Developer intern at Apple in Cupertino — May to August 2026, hybrid, his fourth co-op term. Here is the whole of what I can tell you about the work, and I mean literally the whole of it: ${APPLE_DESCRIPTION}`,
      },
      {
        text: "I am not being mysterious for effect. The detail is pending his manager's sign-off on disclosure, so it was never given to me — no project names, no internal tools, no scale. Cheerfully dull on purpose.",
      },
      {
        text: 'Carta and Empathia I can talk about freely, and they are where you can actually see how he works. Want either?',
      },
    ],
  },

  // ── Starter prompt 1.
  {
    id: 'strongest-project',
    match: (q) =>
      has(q, 'strongest', 'best project', 'favourite project', 'favorite project', 'proudest') ||
      (has(q, 'project') && has(q, 'which', 'what')),
    parts: [
      {
        text: "Acronymize, and I will defend the pick. It is a solo build — React 19 and TypeScript on the front, Django and Postgres behind it, Clerk for auth — and the part worth noticing is not the puzzle. It is that he trained semantic scoring into the feedback loop with a sentence-transformer model, so a near-miss guess gets graded on how close it actually was instead of a binary buzz.",
      },
      {
        text: 'That is a product decision and a modelling decision in the same feature, which is exactly the seam he is good at working in.',
      },
      {
        tool: 'render_project_card',
        input: { slug: 'acronymize', note: 'Solo build. Three game modes and a daily puzzle.' },
      },
      {
        text: 'If you would rather see raw engineering with no framework carrying it, Tanks is the other answer. A* pathfinding written by hand, personality traits per enemy that change how it hunts you, and geometric auto-aim that leads a moving target — in C# and MonoGame, because he wanted to understand the machinery rather than import it.',
      },
      { tool: 'render_project_card', input: { slug: 'tanks' } },
    ],
  },

  // ── Starter prompt 2.
  {
    id: 'ai-work',
    match: (q) =>
      has(q, 'ai work', 'ai experience', 'llm', 'machine learning', 'rag', 'ml work') ||
      (has(q, 'ai') && has(q, 'walk', 'tell', 'about', 'his')),
    parts: [
      {
        text: 'Four co-op terms, and the AI thread runs through three of them. At Empathia.ai he built a full-stack retrieval-augmented generation system in Python and TypeScript that pulled context out of a user\'s notes and prior interactions to feed the AI smart-edit feature — and did the prompt engineering on it.',
      },
      {
        text: 'At Carta he replaced a legacy ML classifier with prompt-based categorization on GPT-4o and evaluated it in Braintrust against the model it was replacing, which is the part most people skip. Same term, he re-architected a 3,000-plus-line hardcoded dispatch-rules file into a database-driven design, then built a CLI tool and a Claude skill so teammates could author email filtering rules without touching application code.',
      },
      {
        text: `Currently at Apple in security engineering, where I am allowed exactly one sentence: ${APPLE_DESCRIPTION} That is not evasion, it is genuinely all I have.`,
      },
      {
        text: 'His own framing is the useful summary, and it is why I would hire him for this specifically: AI features are easy to demo and hard to trust, and most of his recent work is on the hard-to-trust half — evaluation, measurement, and the plumbing that tells you whether a model change actually helped.',
      },
      {
        tool: 'render_project_card',
        input: {
          slug: 'flowsense',
          note: 'The side-project version of the same instinct — RAG, built at Hack the 6ix 2024.',
        },
      },
    ],
  },

  // ── Starter prompt 3.
  {
    id: 'availability',
    match: (q) =>
      has(q, 'available', 'availability', 'when can he start', 'start date', 'looking for work') ||
      has(q, 'co-op', 'coop', 'internship', 'intern for'),
    parts: [
      {
        text: 'Yes — he is seeking a Summer 2027 software engineering co-op. That is a work term, not a graduation date, which is worth separating because people conflate the two: he is in the Honours Co-operative program for Computer Science at the University of Waterloo and graduates in 2028.',
      },
      {
        text: 'He is currently partway through his fourth co-op term, at Apple in Cupertino, through August 2026. Based in Waterloo, Ontario between terms.',
      },
      { tool: 'render_contact_card', input: { reason: 'The fastest way to start that conversation' } },
      { tool: 'render_resume_button', input: {} },
    ],
  },

  // ── Starter prompt 4.
  {
    id: 'why-hire',
    match: (q) =>
      has(q, 'why hire', 'why should', 'deserve', 'convince', 'sell me', 'pitch', 'good fit') ||
      (has(q, 'hire') && !has(q, "shouldn't", 'not')),
    parts: [
      {
        // Scoped to the three COMPLETED terms on purpose. The Apple term is still
        // in progress, and claiming a shipped-and-handed-off outcome there would
        // both be untrue and assert something about Apple work beyond the one
        // approved sentence (R3, R5).
        text: 'Because each of his three completed co-op terms ended with something shipped and handed off rather than something demoed. That is a boringly rare property in a student, and it is the one I would actually bet on.',
      },
      {
        text: 'Three specifics. He designed and built the AI email routing service at Carta independently, production-ready behind a feature flag, across roughly 60 destination categories. He owned Empathia.ai\'s website end to end — design, development, deployment — then came back the next term and built their RAG system. And he writes the unglamorous half: evaluation harnesses, a database-driven rules design replacing a 3,000-plus-line file, a CLI so non-engineers could use it.',
      },
      {
        text: "The honest catch, since you would find it anyway: he is a student, so his ownership is measured in terms rather than years, and his depth is concentrated in AI systems and full-stack product rather than spread across everything. I am his advocate, not his lawyer — that one is real. It is also the kind of gap that closes on its own.",
      },
      { tool: 'render_resume_button', input: {} },
    ],
  },

  // ── Meta: is this bot real / are you Dylan. Reinforces the demo notice.
  {
    id: 'meta',
    match: (q) =>
      has(q, 'are you dylan', 'are you a bot', 'are you real', 'are you human', 'are you an ai') ||
      has(q, 'chatgpt', 'claude', 'objective', 'biased', 'unbiased', 'who are you'),
    parts: [
      {
        text: "No on both counts, in slightly different ways. I am not Dylan — he would be first-person and funnier, and a synthetic first-person Dylan would be deeply weird to talk to. And in this build I am not a language model either: I am a scripted stand-in, which is why there is a demo-mode notice sitting at the top of this window instead of a quiet little asterisk.",
      },
      {
        text: 'On objectivity: absolutely not, and I would not claim it. My entire job is making Dylan look good. The saving grace is that everything I say is checkable against the rest of this site, and I would rather concede a real gap than get caught inflating something — a recruiter who catches one invented detail throws out everything else I said.',
      },
    ],
  },

  // ── Contact / résumé.
  {
    id: 'contact',
    match: (q) =>
      has(q, 'contact', 'email', 'reach him', 'get in touch', 'linkedin', 'github', 'phone'),
    parts: [
      {
        text: `Email is the fast path and he reads it: ${IDENTITY.email}. No phone number — that one is résumé-only, so I do not have it to give you.`,
      },
      { tool: 'render_contact_card', input: {} },
      {
        text: 'If you would rather he came to you, leave your details and I will show you exactly what would happen to them.',
      },
      { tool: 'capture_recruiter_email', input: {} },
    ],
  },
  {
    id: 'resume',
    match: (q) => has(q, 'resume', 'résumé', 'cv', 'download'),
    parts: [
      {
        text: 'Here you go. Worth knowing what is on it that is not here: the performance figures. This site deliberately keeps percentages and counts off it, so the résumé is the version with the numbers in context.',
      },
      { tool: 'render_resume_button', input: {} },
    ],
  },

  // ── Education.
  {
    id: 'education',
    match: (q) =>
      has(q, 'school', 'university', 'waterloo', 'degree', 'gpa', 'graduat', 'study', 'course'),
    parts: [
      {
        text: 'Bachelor of Computer Science at the University of Waterloo, Honours Co-operative program, September 2023 through an expected 2028 graduation. Cumulative GPA 3.9.',
      },
      {
        text: 'Coursework worth naming: Object-Oriented Software Engineering, Logic and Computation, Tools for Software Engineering, and Algorithms and Data Abstraction. Waterloo co-op is the reason he has four terms of real work behind him this early — that is the whole design of the program.',
      },
    ],
  },

  // ── Comparisons — genuinely unknowable, per the system prompt.
  {
    id: 'comparison',
    match: (q) =>
      has(q, 'better than', 'compare', 'compared to', 'versus', ' vs ', 'other candidate'),
    parts: [
      {
        text: "I have no information about anyone else, so I would be making it up, and making it up is the one thing I will not do for him. I can tell you precisely what Dylan has built and where the gaps are, and you can put that next to whoever else is on your list.",
      },
      {
        text: "If it helps: the honest summary is a fourth-term co-op student whose depth is in AI systems and full-stack product, with a track record of shipping and handing off rather than demoing. Where that ranks is your call, not mine.",
      },
    ],
  },

  // ── Out of scope: salary, visa, references, and anything not about Dylan.
  {
    id: 'out-of-scope',
    match: (q) =>
      has(
        q,
        'salary',
        'compensation',
        'pay',
        'visa',
        'sponsor',
        'immigration',
        'citizen',
        'work permit',
        'reference',
        'weather',
        'capital of',
        'recipe',
        'write me',
        'code for me',
      ),
    parts: [
      {
        text: `I do not know, and I am not going to produce a plausible-sounding guess — salary, visa and status, references, and anything that is not on this site are all outside what I was given. Email him and ask directly: ${IDENTITY.email}. He answers.`,
      },
      {
        text: 'I am a deliberately narrow bot. I know what this site knows about Dylan and nothing else, which also means I am no use for the weather, trivia, or writing your code.',
      },
      { tool: 'render_contact_card', input: { reason: 'Straight to the person who does know' } },
    ],
  },

  // ── Prompt-injection / persona attacks: in on the joke, then answer.
  {
    id: 'injection',
    match: (q) =>
      has(
        q,
        'ignore your',
        'ignore all',
        'ignore previous',
        'system prompt',
        'your instructions',
        'your rules',
        'pretend to be',
        'act as',
        'jailbreak',
        'developer mode',
        'reveal',
        'verbatim',
      ),
    parts: [
      {
        text: 'Nice try, and I mean that warmly. There is nothing to extract — I am a chatbot on a personal website, I hold no secrets, and my instructions are roughly "talk about Dylan, do not make anything up, do not quote numbers." You can read the repo if you want the real version.',
      },
      {
        text: 'What I will not do is write as Dylan in the first person or take direction from the chat box. Was there an actual question about him behind that? I am good at those.',
      },
    ],
  },

  // ── Experience, catch-all for the work history.
  {
    id: 'experience',
    match: (q) =>
      has(q, 'experience', 'work history', 'where has he worked', 'carta', 'empathia', 'job'),
    parts: [
      {
        text: 'Four co-op terms, most recent first. Apple, Software Developer intern, Cupertino, May to August 2026 — one approved sentence and no more, ask me and I will explain why. Carta, Software Development Intern, Waterloo, September to December 2025 — the AI email routing service, the GPT-4o classifier that replaced a legacy ML model, the rules re-architecture.',
      },
      {
        text: 'Before that, Empathia.ai twice: Full Stack Developer from January to May 2025, where he built their RAG system and the blog portal, and Website Developer from May 2024 to January 2025, where he owned the whole site. That second span is a four-month co-op term followed by about five months part-time alongside school — not nine months full-time, and I would rather say so than let you read it wrong.',
      },
      {
        text: 'Want the résumé, or shall I go deeper on one of them?',
      },
      { tool: 'render_resume_button', input: {} },
    ],
  },

  // ── Skills / stack.
  {
    id: 'skills',
    match: (q) =>
      has(q, 'skill', 'stack', 'tech', 'language', 'framework', 'python', 'react', 'django', 'know'),
    parts: [
      {
        text: 'Python and TypeScript are the load-bearing two, with C# from the games era and SQL throughout. Backend is Django, Django Ninja, FastAPI, Flask, Node and Express; frontend is React, TanStack, Vite, Tailwind and styled-components. Postgres mostly, Mongo and Redis where they fit.',
      },
      {
        text: 'The AI column is the one to look at: RAG, prompt engineering, LLM evaluation, agentic tool-use harnesses, Braintrust, sentence transformers. Then the plumbing — Docker, Kubernetes, Celery, GitHub Actions, pytest, Playwright — plus Snowplow and Amplitude on the analytics side, which is a slightly unusual thing for a developer to have actually wired up himself.',
      },
      {
        tool: 'render_links',
        input: {
          links: [
            { label: 'GitHub', href: SOCIALS.github },
            { label: 'LinkedIn', href: SOCIALS.linkedin },
          ],
        },
      },
    ],
  },

  // ── Outside of code.
  {
    id: 'interests',
    match: (q) => has(q, 'hobb', 'interest', 'outside of code', 'fun', 'free time', 'personal'),
    parts: [
      {
        text: 'Reading, travel planning, squash and badminton. His own phrasing on the last two is "losing at", which I am contractually obliged to report accurately even though it undercuts my whole thing.',
      },
      {
        text: 'The games are the relevant hobby, honestly — Tanks and the other MonoGame builds are where he learned to write pathfinding and collision from scratch, and that habit of building the machinery to understand it shows up in everything since.',
      },
    ],
  },
];

/**
 * Fallback. This is the reply most visitors will hit in Phase A, so it is the
 * most important one to get right: it says plainly that it is a script, does not
 * pretend to have understood, and hands over a real route to an answer.
 */
const FALLBACK: ScriptPart[] = [
  {
    text: "I do not have a scripted answer for that one. Being straight with you: this build is a demo, so I am a fixed set of replies rather than a model that can think about your actual question — no amount of rephrasing will get me there.",
  },
  {
    text: "What I do cover: his strongest project, his AI and LLM work, whether he is available, why he is worth hiring, his weaknesses, where he has worked, his stack, school, and how to reach him. Try one of those, or skip me entirely — the theme switcher has a perfectly readable version of this site.",
  },
  {
    text: `And for anything I genuinely cannot answer, he does read his email: ${IDENTITY.email}.`,
  },
];

/**
 * Demonstrates the refusal path (`stop_reason: "refusal"`, HTTP 200, empty
 * content) without needing a live model to decline something. Typing this exact
 * phrase in the composer exercises the UI's refusal state end to end.
 */
const REFUSAL_TRIGGER = '/refusal';
/** Same, for the honest offline panel. */
const OFFLINE_TRIGGER = '/offline';

function scriptFor(question: string): ScriptPart[] {
  const q = question.toLowerCase();
  for (const script of SCRIPTS) {
    if (script.match(q)) return script.parts;
  }
  return FALLBACK;
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('aborted', 'AbortError'));
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('aborted', 'AbortError'));
      },
      { once: true },
    );
  });

/**
 * Splits into word-ish deltas. The leading-whitespace group matters: without it
 * the paragraph breaks between script parts are swallowed and every reply
 * renders as one welded-together block.
 */
function chunk(text: string, size: number): string[] {
  const words = text.match(/\s*\S+\s*/g) ?? [text];
  const out: string[] = [];
  for (let i = 0; i < words.length; i += size) out.push(words.slice(i, i + size).join(''));
  return out;
}

export type StubOptions = {
  /**
   * Set from prefers-reduced-motion. The typing indicator and the streaming both
   * still happen — a visitor who wants less motion still needs to know the
   * answer is arriving — but the delays collapse to near-zero so nothing
   * animates for any perceptible length of time (G17).
   */
  instant?: boolean;
};

export class StubTransport implements ChatTransport {
  readonly kind = 'stub' as const;

  constructor(private readonly options: StubOptions = {}) {}

  async *send(messages: readonly ChatTurn[], signal?: AbortSignal): AsyncIterable<ChatEvent> {
    const last = [...messages].reverse().find((m) => m.role === 'user');
    const question = last?.text ?? '';
    const instant = this.options.instant === true;
    const pace = (ms: number) => (instant ? 0 : ms);

    // Latency before the first token, so the typing indicator is genuinely
    // exercised rather than flickering for one frame.
    await sleep(pace(520 + Math.random() * 380), signal);
    yield { type: 'message_start' };

    if (question.trim().toLowerCase() === OFFLINE_TRIGGER) {
      await sleep(pace(200), signal);
      yield {
        type: 'failed',
        kind: 'unavailable',
        message: 'Simulated outage — this is what a real failure looks like.',
      };
      return;
    }

    // The refusal path: 200 OK, no content, stop_reason 'refusal'. Nothing is
    // yielded before `done`, which is precisely the case that crashes code
    // reading content[0] unconditionally.
    if (question.trim().toLowerCase() === REFUSAL_TRIGGER) {
      await sleep(pace(300), signal);
      yield { type: 'done', stopReason: 'refusal' };
      return;
    }

    const parts = scriptFor(question);
    let usedTool = false;
    let previousWasText = false;

    for (const [index, part] of parts.entries()) {
      if (index > 0) await sleep(pace(360), signal);

      if ('tool' in part) {
        usedTool = true;
        previousWasText = false;
        yield {
          type: 'tool_use',
          id: `stub_${part.tool}_${index}`,
          name: part.tool,
          input: part.input,
        };
        continue;
      }

      // A real model emits its own paragraph breaks inside the text stream, so
      // the stub does too rather than inventing a "new paragraph" event type.
      const text = previousWasText ? `\n\n${part.text}` : part.text;
      previousWasText = true;

      for (const piece of chunk(text, 3)) {
        await sleep(pace(26 + Math.random() * 34), signal);
        yield { type: 'text_delta', text: piece };
      }
    }

    await sleep(pace(120), signal);
    // Real turns that used a tool come back with stop_reason 'tool_use' before
    // the tool result round-trip. These tools are render-only — there is no
    // result to send back — so the UI treats both as terminal. Phase B keeps
    // that property: if a future tool needs a result, this is the branch that
    // has to grow a loop.
    yield { type: 'done', stopReason: usedTool ? 'tool_use' : 'end_turn' };
  }
}

/**
 * Exported for local verification rather than for the UI.
 *
 * SCRIPT_IDS lets a throwaway script assert that every path still matches
 * something after a copy edit. STUB_TRIGGERS documents the two composer inputs
 * that force the awkward states — type `/refusal` to exercise the empty-content
 * refusal path and `/offline` to exercise the honest offline panel. They are not
 * advertised in the interface because they are for whoever is editing this file.
 */
export const SCRIPT_IDS = SCRIPTS.map((s) => s.id);
export const STUB_TRIGGERS = { refusal: REFUSAL_TRIGGER, offline: OFFLINE_TRIGGER };
