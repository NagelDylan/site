/**
 * Transport selection (spec §18.4).
 *
 * One flag decides which implementation the chat UI talks to, and the UI never
 * branches on it — it reads `transport.kind` to decide whether to show the
 * demo-mode notice, so the notice cannot get out of step with reality. Flipping
 * FEATURES.liveChat with nothing behind it is exactly the dishonesty §18.5
 * forbids, so the flag and the Worker have to land together.
 */
import { FEATURES } from '../../config';
import { StubTransport, type StubOptions } from './stub-transport';
import { WorkerTransport } from './worker-transport';
import type { ChatTransport } from './types';

export function createTransport(options: StubOptions = {}): ChatTransport {
  return FEATURES.liveChat ? new WorkerTransport() : new StubTransport(options);
}

export { StubTransport } from './stub-transport';
export { WorkerTransport } from './worker-transport';
export { CHAT_TOOLS, TOOL_NAMES, isToolName } from './tools';
export type { ProjectSlug, ToolName } from './tools';
export { MAX_USER_TURNS, HISTORY_WINDOW } from './types';
export type {
  ChatEvent,
  ChatFailureKind,
  ChatTransport,
  ChatTurn,
  StopReason,
  ToolInput,
} from './types';
