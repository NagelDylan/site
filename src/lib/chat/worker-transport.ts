/**
 * WorkerTransport — the Phase B implementation. NOT WIRED UP.
 *
 * The network call is deliberately unimplemented: there is no API key, no
 * deployed Worker, and a half-built fetch that silently returns nothing is worse
 * than an explicit one that says so. What IS built here is the shape — the
 * request body, the SSE frame parsing, the mapping onto ChatEvent, and the
 * failure branches — because that shape is what determines whether the UI needs
 * changing when the key arrives. It does not.
 *
 * ─── WHAT A PHASE B ENGINEER HAS TO DO ──────────────────────────────────────
 *  1. Write functions/api/chat.ts (Cloudflare Pages Function). It owns the API
 *     key, builds the Messages API request, and pipes the stream through as SSE.
 *     The key never reaches the browser.
 *  2. Fill in the single TODO below.
 *  3. Set FEATURES.liveChat = true in src/config.ts. The demo-mode notice
 *     disappears on its own because it is driven by transport.kind, not by a
 *     separate copy switch — see src/components/chat/DemoNotice.tsx.
 *
 * ─── TWO THINGS THE WORKER MUST GET RIGHT ───────────────────────────────────
 *
 * (1) THINKING STAYS ON, AT effort: "low". Never `thinking: { type: 'disabled' }`.
 *     On Opus 5, disabling thinking has a documented failure mode: the model
 *     writes what looks like a tool call into its VISIBLE TEXT instead of
 *     emitting a real tool_use block. The turn succeeds, no error is raised, and
 *     the tool simply never runs. This entire interface renders its cards from
 *     tool calls, so the symptom here would be project cards mysteriously
 *     failing to appear while the chat otherwise looks fine — one of the worse
 *     bugs to diagnose from the outside. Leave thinking enabled.
 *
 * (2) CHECK stop_reason BEFORE READING CONTENT. Opus 5's classifiers can decline
 *     a turn: HTTP 200, `stop_reason: "refusal"`, and an EMPTY content array.
 *     Any code doing `response.content[0].text` crashes on a successful
 *     response. In the streaming shape below that surfaces as a `done` event
 *     with no preceding deltas, which the UI already handles.
 */
import { ENDPOINTS } from '../../config';
import { isToolName } from './tools';
import type { ChatEvent, ChatFailureKind, ChatTransport, ChatTurn, StopReason } from './types';

/** Exactly the body functions/api/chat.ts should expect. */
export type ChatRequestBody = {
  messages: ChatTurn[];
};

/**
 * The Worker's SSE payloads, already flattened from the raw Anthropic stream.
 *
 * Doing the flattening Worker-side is the right split: the Worker joins
 * `input_json_delta` fragments into complete tool inputs and drops the events
 * the client has no use for, so the browser never has to reassemble partial JSON
 * and the client bundle stays small. The client's job is frame parsing only.
 */
type WirePayload =
  | { type: 'start' }
  | { type: 'text'; text: string }
  | { type: 'tool'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'done'; stop_reason: StopReason }
  | { type: 'error'; kind: ChatFailureKind; message: string };

const STOP_REASONS: readonly StopReason[] = [
  'end_turn',
  'tool_use',
  'max_tokens',
  'stop_sequence',
  'refusal',
  'pause_turn',
];

function asStopReason(value: unknown): StopReason {
  return typeof value === 'string' && (STOP_REASONS as readonly string[]).includes(value)
    ? (value as StopReason)
    : 'end_turn';
}

/** Maps an HTTP status from the Worker onto the honest offline copy. */
function failureFromStatus(status: number): ChatFailureKind {
  if (status === 429) return 'rate_limited';
  // The Worker returns 503 once the spend ceiling is reached: better to turn the
  // bot off and say so than to keep answering and hand Dylan the bill.
  if (status === 503) return 'budget_exhausted';
  return 'unavailable';
}

export class WorkerTransport implements ChatTransport {
  readonly kind = 'worker' as const;

  constructor(private readonly endpoint: string = ENDPOINTS.chat) {}

  async *send(messages: readonly ChatTurn[], signal?: AbortSignal): AsyncIterable<ChatEvent> {
    // ─────────────────────────────────────────────────────────────────────────
    // TODO(phase-b): the only unimplemented line in this file.
    //
    //   const response = await fetch(this.endpoint, {
    //     method: 'POST',
    //     headers: { 'content-type': 'application/json' },
    //     body: JSON.stringify({ messages } satisfies ChatRequestBody),
    //     signal,
    //   });
    //   if (!response.ok || !response.body) {
    //     yield { type: 'failed', kind: failureFromStatus(response.status),
    //             message: await response.text().catch(() => '') };
    //     return;
    //   }
    //   yield* this.parse(response.body, signal);
    //
    // Everything it needs already exists: failureFromStatus above, and parse()
    // below. Delete this block, uncomment that, done.
    // ─────────────────────────────────────────────────────────────────────────
    void messages;
    void signal;
    // Referenced so the pieces Phase B needs are not pruned as dead code, and so
    // a type error in either shows up in `astro check` today rather than on the
    // day someone is trying to ship the Worker.
    void failureFromStatus;
    void this.endpoint;
    void this.parse;
    yield {
      type: 'failed',
      kind: 'unavailable',
      message: 'Live chat is not wired up in this build.',
    };
  }

  /**
   * SSE frame parsing. Written and kept because it is the fiddly part, and it is
   * fiddly in ways that only show up under load: frames arrive split across
   * chunk boundaries mid-JSON, a `data:` line can be empty, and the last frame
   * may not be newline-terminated.
   */
  private async *parse(
    body: ReadableStream<Uint8Array>,
    signal?: AbortSignal,
  ): AsyncIterable<ChatEvent> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        if (signal?.aborted) return;
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Frames are separated by a blank line. Anything after the last blank
        // line is an incomplete frame and stays in the buffer.
        const frames = buffer.split('\n\n');
        buffer = frames.pop() ?? '';

        for (const frame of frames) {
          const event = this.frameToEvent(frame);
          if (event) yield event;
        }
      }
      const trailing = this.frameToEvent(buffer);
      if (trailing) yield trailing;
    } finally {
      reader.releaseLock();
    }
  }

  private frameToEvent(frame: string): ChatEvent | null {
    const data = frame
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .join('');
    if (!data || data === '[DONE]') return null;

    let payload: WirePayload;
    try {
      payload = JSON.parse(data) as WirePayload;
    } catch {
      // A malformed frame is not worth killing the turn over; the stream's own
      // terminal event still decides how this ends.
      return null;
    }

    switch (payload.type) {
      case 'start':
        return { type: 'message_start' };
      case 'text':
        return { type: 'text_delta', text: payload.text };
      case 'tool':
        // A tool name the client does not know about is dropped rather than
        // rendered — new tools can ship Worker-side without breaking old bundles.
        if (!isToolName(payload.name)) return null;
        return { type: 'tool_use', id: payload.id, name: payload.name, input: payload.input };
      case 'done':
        return { type: 'done', stopReason: asStopReason(payload.stop_reason) };
      case 'error':
        return { type: 'failed', kind: payload.kind, message: payload.message };
      default:
        return null;
    }
  }
}
