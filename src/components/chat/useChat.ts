/**
 * The conversation state machine.
 *
 * One reducer-ish hook so the components stay dumb, and so the four states that
 * actually matter — idle, streaming, refused, unavailable — are all visible in
 * one file rather than emergent from scattered booleans.
 *
 * The event loop below is written against ChatTransport, not against the stub.
 * It never checks which transport it has. That is the property that makes Phase
 * B a config change: if this loop needed to know, the swap would be a rewrite.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  HISTORY_WINDOW,
  MAX_USER_TURNS,
  createTransport,
  type ChatFailureKind,
  type ChatTurn,
} from '../../lib/chat';
import { messageText, widgetFromTool, type Block, type UiMessage } from './model';

export type ChatStatus = 'idle' | 'waiting' | 'streaming';

let counter = 0;
const nextId = (prefix: string) => `${prefix}-${++counter}`;

function appendText(blocks: Block[], text: string): Block[] {
  const last = blocks[blocks.length - 1];
  if (last && last.type === 'text') {
    return [...blocks.slice(0, -1), { ...last, text: last.text + text }];
  }
  return [...blocks, { id: nextId('t'), type: 'text', text }];
}

export type UseChatOptions = {
  /** Seeded as the first assistant turn. Never sent upstream. */
  greeting: Block[];
  /** prefers-reduced-motion: collapses the stub's artificial delays (G17). */
  reducedMotion: boolean;
};

export function useChat({ greeting, reducedMotion }: UseChatOptions) {
  const [messages, setMessages] = useState<UiMessage[]>(() => [
    { id: 'greeting', role: 'assistant', blocks: greeting },
  ]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [failure, setFailure] = useState<ChatFailureKind | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const transport = useMemo(
    () => createTransport({ instant: reducedMotion }),
    [reducedMotion],
  );

  const userTurns = messages.filter((m) => m.role === 'user').length;
  const capReached = userTurns >= MAX_USER_TURNS;
  const busy = status !== 'idle';

  const send = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (!text || busy || failure) return;

      const userMessage: UiMessage = {
        id: nextId('u'),
        role: 'user',
        blocks: [{ id: nextId('t'), type: 'text', text }],
      };
      const assistantId = nextId('a');

      // Read history off the state we are about to commit rather than off
      // `messages`, which is a render-scoped snapshot.
      let history: ChatTurn[] = [];
      setMessages((prev) => {
        const next = [...prev, userMessage];
        history = next
          .filter((m) => m.id !== 'greeting')
          .slice(-HISTORY_WINDOW)
          .map((m) => ({ role: m.role, text: messageText(m) }))
          .filter((t) => t.text.length > 0);
        return [...next, { id: assistantId, role: 'assistant', blocks: [], streaming: true }];
      });

      setStatus('waiting');
      const controller = new AbortController();
      abortRef.current = controller;

      const patch = (fn: (m: UiMessage) => UiMessage) =>
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? fn(m) : m)));

      try {
        for await (const event of transport.send(history, controller.signal)) {
          switch (event.type) {
            case 'message_start':
              break;
            case 'text_delta':
              setStatus('streaming');
              patch((m) => ({ ...m, blocks: appendText(m.blocks, event.text) }));
              break;
            case 'tool_use': {
              setStatus('streaming');
              const widget = widgetFromTool(event.name, event.input);
              if (widget) {
                patch((m) => ({
                  ...m,
                  blocks: [...m.blocks, { id: nextId('w'), type: 'widget', widget }],
                }));
              }
              break;
            }
            case 'done':
              /**
               * The refusal branch. `stop_reason: 'refusal'` arrives with an
               * empty content array on an HTTP 200, so this is the point where
               * naive code would already have crashed reading content[0]. Here
               * it is simply a turn with no blocks, flagged so the UI can say so
               * plainly instead of showing an empty bubble.
               */
              patch((m) => ({
                ...m,
                streaming: false,
                refused: event.stopReason === 'refusal' || m.blocks.length === 0,
                truncated: event.stopReason === 'max_tokens',
              }));
              break;
            case 'failed':
              // Drop the empty assistant bubble; the offline panel replaces it.
              setMessages((prev) => prev.filter((m) => m.id !== assistantId));
              setFailure(event.kind);
              break;
          }
        }
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') {
          patch((m) => ({ ...m, streaming: false, refused: m.blocks.length === 0 }));
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          setFailure('unavailable');
        }
      } finally {
        abortRef.current = null;
        setStatus('idle');
      }
    },
    [busy, failure, transport],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  /** The offline panel's "start over" affordance. Keeps the greeting. */
  const reset = useCallback(() => {
    abortRef.current?.abort();
    setFailure(null);
    setStatus('idle');
    setMessages([{ id: 'greeting', role: 'assistant', blocks: greeting }]);
  }, [greeting]);

  return {
    messages,
    status,
    busy,
    failure: capReached && !failure ? ('cap_reached' as ChatFailureKind) : failure,
    userTurns,
    turnsRemaining: Math.max(0, MAX_USER_TURNS - userTurns),
    transportKind: transport.kind,
    send,
    stop,
    reset,
  };
}
