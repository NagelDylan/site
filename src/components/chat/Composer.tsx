/**
 * The composer.
 *
 * Phone-first: a textarea that grows to a few lines and then scrolls, a send
 * button large enough to hit with a thumb, and `env(safe-area-inset-bottom)`
 * padding in the CSS so the last line is not under the home indicator. Enter
 * sends, Shift+Enter breaks a line — the convention every visitor already knows
 * from every other chat client.
 */
import { useEffect, useRef } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  busy: boolean;
  disabled: boolean;
  turnsRemaining: number;
};

const Composer = ({
  value,
  onChange,
  onSubmit,
  onStop,
  busy,
  disabled,
  turnsRemaining,
}: Props) => {
  const textarea = useRef<HTMLTextAreaElement>(null);

  // Auto-grow without a layout library: reset then measure. Capped in CSS.
  useEffect(() => {
    const el = textarea.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const submit = () => {
    if (busy || disabled || !value.trim()) return;
    onSubmit();
  };

  return (
    <form
      className="c-composer"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <label className="sr-only" htmlFor="chat-input">
        Ask something about Dylan
      </label>
      <textarea
        className="c-composer__input"
        id="chat-input"
        ref={textarea}
        rows={1}
        value={value}
        disabled={disabled}
        placeholder={disabled ? 'Chat is closed' : 'Ask about his work…'}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
      />

      {busy ? (
        <button className="c-composer__send" type="button" onClick={onStop}>
          <span aria-hidden="true">■</span>
          <span className="sr-only">Stop generating</span>
        </button>
      ) : (
        <button
          className="c-composer__send"
          type="submit"
          disabled={disabled || !value.trim()}
        >
          <span aria-hidden="true">↑</span>
          <span className="sr-only">Send message</span>
        </button>
      )}

      {/*
        Privacy notice (§11.4). The spec's wording is "conversations are logged so
        Dylan can see what people ask" — which will be true in Phase B, when the
        Worker exists to log them. In Phase A there is no chat backend and the
        conversation never leaves the browser, so the notice says that instead.
        Writing the Phase B sentence early would be a small lie about data
        handling, which is the worst category of small lie to ship.

        Scope matters in the wording. The *conversation* goes nowhere, but the
        recruiter-capture form the bot can render does now really submit (see
        src/lib/contact.ts), and it sits in this same pane. So this says "this
        conversation" rather than "nothing here" — an unqualified claim would read
        as covering that form too, and would be false about it.
      */}
      <p className="c-composer__privacy">
        This conversation isn't sent anywhere or stored — it lives in your browser tab and
        disappears when you close it. The contact form is the one thing here that does send, and
        only when you submit it.
        {turnsRemaining <= 4 && turnsRemaining > 0 ? (
          <span className="c-composer__count"> {turnsRemaining} questions left in this chat.</span>
        ) : null}
      </p>
    </form>
  );
};

export default Composer;
