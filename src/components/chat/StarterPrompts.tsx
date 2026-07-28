/**
 * Starter prompts (spec §11.3).
 *
 * The first four are the spec's, verbatim and in order — they are chosen to walk
 * a recruiter through exactly the four things they came to find out, and the
 * wording is not ours to improve.
 *
 * The second row is this build's own addition, and it earns its place: a
 * visitor's instinct with a portfolio bot is to test whether it will admit
 * anything. Putting the hostile question and the out-of-scope question on the
 * surface is a small act of confidence, and it means the honest paths get used
 * rather than sitting in the source untested.
 */
import { STARTER_PROMPTS } from '../../data/voice';

const PROBES = [
  'What are his weaknesses?',
  'Did FlowSense win the hackathon?',
  "What's his salary expectation?",
] as const;

const StarterPrompts = ({ onPick }: { onPick: (prompt: string) => void }) => (
  <div className="c-starters">
    <h2 className="c-starters__label" id="starters-label">
      Try one of these
    </h2>
    <ul className="c-starters__list" aria-labelledby="starters-label">
      {STARTER_PROMPTS.map((prompt) => (
        <li key={prompt}>
          <button className="c-starter" type="button" onClick={() => onPick(prompt)}>
            {prompt}
          </button>
        </li>
      ))}
    </ul>

    <p className="c-starters__label">Or test whether it will be straight with you</p>
    <ul className="c-starters__list">
      {PROBES.map((prompt) => (
        <li key={prompt}>
          <button className="c-starter c-starter--probe" type="button" onClick={() => onPick(prompt)}>
            {prompt}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default StarterPrompts;
