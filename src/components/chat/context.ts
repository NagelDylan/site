/**
 * Shared context for the chat tree.
 *
 * Only two things are genuinely ambient: whether the résumé file exists (decided
 * server-side, needed by any turn that renders the download button) and which
 * transport is live (which decides whether the demo-mode notice shows). Passing
 * either as props through four levels of message rendering would be noise.
 */
import { createContext, useContext } from 'react';
import type { ChatTransport } from '../../lib/chat';

export type ChatContextValue = {
  resume: { available: boolean; href: string; filename: string };
  transportKind: ChatTransport['kind'];
  /** Injects a message into the composer flow, for in-card follow-up buttons. */
  ask: (question: string) => void;
};

export const ChatContext = createContext<ChatContextValue>({
  resume: { available: false, href: '/resume.pdf', filename: 'resume.pdf' },
  transportKind: 'stub',
  ask: () => {},
});

export const useChatContext = () => useContext(ChatContext);
