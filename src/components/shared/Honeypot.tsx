/**
 * The honeypot, shared by all four contact forms.
 *
 * A hidden checkbox named `botcheck`. Nobody using a browser can see or tab to
 * it, so a human never ticks it; a bot that fills every field in the DOM does.
 * Web3Forms rejects any submission where `botcheck` is truthy, and src/lib/contact.ts
 * bails before the request as well.
 *
 * It is a hook rather than a component because the four forms are all controlled
 * — they hold their fields in React state and never read a FormData — so the
 * honeypot has to be stateful in the same way to be seen at submit time.
 *
 * Why this is worth having: the access key ships in the bundle (it has to, on a
 * static site), so the endpoint is scrapeable. Until Turnstile is switched on,
 * this and Web3Forms' own rate limiting are the whole of the spam defence.
 *
 * Accessibility: `aria-hidden` and `tabIndex={-1}` keep it out of the accessible
 * tree and the tab order, so it is invisible to assistive technology too, not
 * just to sighted visitors. `display: none` alone would leave it focusable in
 * some engines.
 */
import { useState } from 'react';

export const useHoneypot = () => {
  const [tripped, setTripped] = useState(false);

  const field = (
    <input
      type="checkbox"
      name="botcheck"
      checked={tripped}
      onChange={(event) => setTripped(event.target.checked)}
      tabIndex={-1}
      aria-hidden="true"
      autoComplete="off"
      style={{ display: 'none' }}
    />
  );

  return { field, tripped };
};
