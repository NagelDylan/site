/**
 * The chat transport contract (spec §11, §18.5).
 *
 * ─── WHY THERE IS AN INTERFACE HERE AT ALL ──────────────────────────────────
 * Phase A has no Anthropic API key, so the chat is a SCRIPTED STUB. Phase B
 * points it at a Cloudflare Worker that talks to the real Messages API. Those
 * two things must be swappable without touching a single component, or the
 * "going live" task degenerates into a rewrite of the UI. So: one interface,
 * two implementations, selected by a flag in src/config.ts.
 *
 * ─── WHY ChatEvent LOOKS LIKE THE ANTHROPIC STREAM ──────────────────────────
 * The event union below is deliberately shaped like what the real streaming API
 * emits — text deltas, tool_use blocks, and a terminal event carrying a
 * stop_reason — rather than like whatever would be most convenient for the stub.
 * A stub with a comfortable, invented event shape is a stub that lies about the
 * work remaining. If StubTransport can drive the UI through this union, so can
 * the real one.
 */
import type { ProjectSlug, ToolName } from './tools';

/** A turn as it goes over the wire. Deliberately not the UI message type. */
export type ChatTurn = {
  role: 'user' | 'assistant';
  /** Plain text. No markdown — rich output arrives as tool calls (§11.3). */
  text: string;
};

/**
 * Terminal reasons, mirroring the Messages API.
 *
 * `refusal` is the one people forget. Opus 5's classifiers can decline a turn
 * and the request still returns HTTP 200 — with `stop_reason: "refusal"` and an
 * EMPTY content array. Code that reads `content[0]` without checking crashes on
 * a perfectly successful HTTP response. The refusal path is therefore a
 * first-class state in this union and is handled in the UI from day one, while
 * it is cheap to test against a stub, rather than discovered in production.
 */
export type StopReason =
  | 'end_turn'
  | 'tool_use'
  | 'max_tokens'
  | 'stop_sequence'
  | 'refusal'
  | 'pause_turn';

/** Why a conversation stopped being usable. Drives the honest offline panel. */
export type ChatFailureKind =
  /** Client-side conversation cap reached (§11.4 — the real ceiling is Worker-side). */
  | 'cap_reached'
  /** Per-IP rate limit from the Worker (Phase B). */
  | 'rate_limited'
  /** Spend ceiling hit; the Worker turns the bot off rather than overspending. */
  | 'budget_exhausted'
  /** Network or 5xx. */
  | 'unavailable';

/**
 * One event from a transport.
 *
 * Mapping to the real stream, for whoever wires Phase B:
 *   message_start   ← `message_start`
 *   text_delta      ← `content_block_delta` with `delta.type === 'text_delta'`
 *   tool_use        ← `content_block_stop` for an accumulated `tool_use` block
 *                     (input_json_delta fragments are joined before emitting,
 *                     so consumers never see partial JSON)
 *   done            ← `message_delta`'s `stop_reason`, or `message_stop`
 *   failed          ← transport-level problem, or a non-200 from the Worker
 */
export type ChatEvent =
  | { type: 'message_start' }
  | { type: 'text_delta'; text: string }
  | { type: 'tool_use'; id: string; name: ToolName; input: ToolInput }
  | { type: 'done'; stopReason: StopReason }
  | { type: 'failed'; kind: ChatFailureKind; message: string };

/**
 * Tool inputs, as the model would return them.
 *
 * Every field is optional-or-narrow on purpose: this is untrusted-ish data (a
 * model chose it), so the renderers validate before use. A card for a project
 * slug that does not exist renders nothing rather than throwing.
 */
export type ToolInput = {
  /** render_project_card */
  slug?: ProjectSlug | string;
  /** Optional one-line reason the card is being shown. */
  note?: string;
  /** render_resume_button */
  label?: string;
  /** render_contact_card */
  reason?: string;
  /** render_links */
  links?: { label?: string; href?: string }[];
  /** capture_recruiter_email */
  email?: string;
  name?: string;
  company?: string;
  message?: string;
};

export interface ChatTransport {
  /** Surfaced in the UI so the demo-mode notice can never drift from reality. */
  readonly kind: 'stub' | 'worker';
  /**
   * Streams one assistant turn. Consumers must tolerate the iterable ending
   * after a `failed` event with no `done`.
   */
  send(messages: readonly ChatTurn[], signal?: AbortSignal): AsyncIterable<ChatEvent>;
}

/**
 * Client-side conversation cap (§11.4).
 *
 * This is a courtesy limit, not a security control: it keeps a demo
 * conversation from sprawling and gives the offline panel something to
 * demonstrate. The limits that actually protect Dylan's wallet — the spend
 * ceiling, the per-IP rate limit, and max_tokens — are Worker-side in Phase B,
 * because anything enforced in a React bundle is enforced nowhere.
 */
export const MAX_USER_TURNS = 12;

/** How much history is sent upstream. Older turns drop off the front. */
export const HISTORY_WINDOW = 16;
