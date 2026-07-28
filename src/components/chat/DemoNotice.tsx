/**
 * The demo-mode notice (spec §18.5). THE MOST IMPORTANT COMPONENT IN THIS THEME.
 *
 * ─── WHY IT CANNOT BE SOFTENED ──────────────────────────────────────────────
 * There is no Anthropic API key in Phase A, so the chat is a scripted stub.
 * Presenting a script as a live model is the single failure mode that actively
 * damages the impression this whole theme exists to create: a recruiter who
 * works out that the "AI assistant" was a lookup table stops trusting the site,
 * and by extension the person. It is also an R5 violation — an invented fact
 * aimed at the visitor rather than at Dylan.
 *
 * So this notice is load-bearing honesty, and it is deliberately hard to erode:
 *   • It renders above the transcript, in the reading path, not in a footer.
 *   • It is not dismissible. There is no close button, because a dismissed
 *     notice is an absent notice for every subsequent turn.
 *   • It is not a tooltip, an info icon, or an asterisk. The words are visible.
 *   • It is driven by `transportKind`, not by its own copy switch, so it
 *     disappears the instant a real transport is in place and cannot linger or
 *     be faked in either direction.
 *
 * If you are here to make the page tidier: the tidy version of this component is
 * the dishonest version. Leave it alone.
 */
import { useChatContext } from './context';

const DemoNotice = () => {
  const { transportKind } = useChatContext();

  // Phase B: WorkerTransport is selected, this returns null, and the notice is
  // gone site-wide without a copy change anywhere.
  if (transportKind !== 'stub') return null;

  return (
    <aside className="c-demo" role="note" aria-label="Demo mode notice">
      <p className="c-demo__line">
        <span aria-hidden="true">⚠</span> demo mode — not connected to a live model{' '}
        <span className="c-demo__phase">(Phase A)</span>
      </p>
      <p className="c-demo__detail">
        Every reply below is written by hand, not generated. The interface, the streaming, and the
        cards are the real ones — the model behind them is not connected yet. Ask something it has
        no script for and it will tell you so rather than improvise.
      </p>
    </aside>
  );
};

export default DemoNotice;
