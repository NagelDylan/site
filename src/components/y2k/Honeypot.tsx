/**
 * Hidden `botcheck` checkbox for the contact form. Nobody using a browser can
 * see or tab to it, so a human never ticks it; a bot that fills every field in
 * the DOM does. Web3Forms rejects submissions where it is truthy, and
 * src/lib/contact.ts bails before the request too.
 *
 * A hook rather than a component because the form is controlled and never reads
 * a FormData, so the honeypot has to be stateful the same way.
 *
 * `aria-hidden` plus `tabIndex={-1}` keep it out of the accessible tree and the
 * tab order; `display: none` alone leaves it focusable in some engines.
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
