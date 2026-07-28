/**
 * The chat view model.
 *
 * Kept separate from the transport types on purpose: the wire format is a flat
 * list of role/text turns, while the UI needs ordered blocks so a project card
 * can sit between two paragraphs. Collapsing those two into one type would mean
 * either sending render instructions back to the model or losing the ordering.
 */
import type { ProjectSlug, ToolInput, ToolName } from '../../lib/chat';

export type Widget =
  | { kind: 'project_card'; slug: ProjectSlug; note?: string }
  | { kind: 'resume_button'; label?: string }
  | { kind: 'contact_card'; reason?: string }
  | { kind: 'links'; links: { label: string; href: string }[] }
  | {
      kind: 'recruiter_capture';
      email?: string;
      name?: string;
      company?: string;
      message?: string;
    };

/** Ordered content within one assistant turn. */
export type Block =
  | { id: string; type: 'text'; text: string }
  | { id: string; type: 'widget'; widget: Widget };

export type UiMessage = {
  id: string;
  role: 'user' | 'assistant';
  blocks: Block[];
  /** True while deltas are still arriving, so the caret and indicator show. */
  streaming?: boolean;
  /**
   * stop_reason was 'refusal': HTTP 200, empty content. Rendered as its own
   * state rather than as an error, because nothing actually failed.
   */
  refused?: boolean;
  /** stop_reason was 'max_tokens' — the answer is genuinely cut off. */
  truncated?: boolean;
};

const FEATURED_SLUGS: readonly ProjectSlug[] = ['acronymize', 'flowsense', 'tanks'];

/**
 * Converts a tool call into something renderable, or null.
 *
 * This is the validation boundary. A tool input is chosen by a model, so it is
 * treated as untrusted: an unknown slug, a missing link, or a `javascript:` href
 * yields null and the card silently does not render. Dropping a widget is a
 * cosmetic failure; rendering a model-supplied URL is not.
 */
export function widgetFromTool(name: ToolName, input: ToolInput): Widget | null {
  switch (name) {
    case 'render_project_card': {
      const slug = input.slug;
      if (!slug || !FEATURED_SLUGS.includes(slug as ProjectSlug)) return null;
      return { kind: 'project_card', slug: slug as ProjectSlug, note: input.note };
    }
    case 'render_resume_button':
      return { kind: 'resume_button', label: input.label };
    case 'render_contact_card':
      return { kind: 'contact_card', reason: input.reason };
    case 'render_links': {
      const links = (input.links ?? [])
        .filter(
          (l): l is { label: string; href: string } =>
            typeof l.label === 'string' && typeof l.href === 'string' && isSafeHref(l.href),
        )
        .slice(0, 4);
      return links.length ? { kind: 'links', links } : null;
    }
    case 'capture_recruiter_email':
      return {
        kind: 'recruiter_capture',
        email: input.email,
        name: input.name,
        company: input.company,
        message: input.message,
      };
    default:
      return null;
  }
}

function isSafeHref(href: string): boolean {
  return /^https:\/\//i.test(href) || /^mailto:/i.test(href) || href.startsWith('/');
}

/** Flattens a turn back to plain text, for the transport history. */
export function messageText(message: UiMessage): string {
  return message.blocks
    .filter((b): b is Extract<Block, { type: 'text' }> => b.type === 'text')
    .map((b) => b.text)
    .join('\n\n')
    .trim();
}
