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
  /**
   * Mirrors ResumeState in src/lib/resume.ts. Widened to the full five fields so
   * the tree typechecks against ThemeAppProps; the chat theme uses only
   * `available`, `href` and `filename` — it offers the download and nothing else,
   * because a PDF embed inside a conversation transcript is not a thing a chat
   * client does.
   */
  resume: {
    available: boolean;
    href: string;
    viewHref: string;
    page: string;
    filename: string;
  };
  transportKind: ChatTransport['kind'];
};

export const ChatContext = createContext<ChatContextValue>({
  // Placeholder only. Every real mount passes the server-resolved object through
  // ThemeAppProps, so `available: false` is the honest default: if this literal is
  // ever what renders, nothing knows whether the file exists.
  resume: {
    available: false,
    href: '/resume.pdf',
    viewHref: '/resume.pdf#view=FitH',
    page: '/resume',
    filename: 'resume.pdf',
  },
  transportKind: 'stub',
});

export const useChatContext = () => useContext(ChatContext);
