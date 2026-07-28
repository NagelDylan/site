/**
 * Tool definitions — the rich-UI layer of the chat theme (spec §11.3).
 *
 * ─── WHY TOOLS INSTEAD OF MARKDOWN ──────────────────────────────────────────
 * The obvious way to get a project into a chat reply is to let the model write
 * markdown and render it. That gets you a link and a paragraph. This site
 * already has real project cards with poster-first media, the actual stack, and
 * verified links — so the model asks for the component instead, and the
 * component reads the fact layer directly.
 *
 * Two consequences worth stating, because they are the reason this is the right
 * shape and not just a fancier one:
 *
 *   1. The model cannot get a card's contents wrong. It supplies a slug; every
 *      other byte on the card comes from src/data. A hallucinated stack entry
 *      or a wrong link is structurally impossible (R5), which is a much
 *      stronger guarantee than asking a model nicely to be accurate.
 *   2. No markdown parser ships. Assistant text renders as plain text, so a
 *      stray backtick or a link the model invented in prose cannot become
 *      clickable UI.
 *
 * These schemas are the literal `tools` array for the Messages API request in
 * Phase B. Keep them in sync with the renderers in src/components/chat.
 */

/** Featured project slugs. Mirrors FEATURED in src/data/projects.ts. */
export type ProjectSlug = 'acronymize' | 'flowsense' | 'tanks';

export const TOOL_NAMES = [
  'render_project_card',
  'render_resume_button',
  'render_contact_card',
  'render_links',
  'capture_recruiter_email',
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

export function isToolName(value: unknown): value is ToolName {
  return typeof value === 'string' && (TOOL_NAMES as readonly string[]).includes(value);
}

type ToolSchema = {
  name: ToolName;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
};

/**
 * Passed verbatim as `tools` in Phase A only as documentation, and in Phase B as
 * the real request field. Descriptions are written for the model, not for us —
 * they carry the usage rules, because a tool description is the only place a
 * model reliably reads them at call time.
 */
export const CHAT_TOOLS: readonly ToolSchema[] = [
  {
    name: 'render_project_card',
    description:
      'Render the rich card for one of Dylan\'s featured projects. Use this whenever you mention a project by name instead of describing its stack or pasting its links in prose — the card carries the media, the real stack, and verified links from the site\'s fact layer. Call it once per project, after the sentence that introduces it.',
    input_schema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          enum: ['acronymize', 'flowsense', 'tanks'],
          description: 'Which featured project to render.',
        },
        note: {
          type: 'string',
          description:
            'Optional one short sentence shown on the card as your reason for surfacing it. No metrics.',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'render_resume_button',
    description:
      "Render the résumé download button. Use it when someone asks for a résumé or CV, or when a full work history is the real answer to their question. If the file is not published yet the button renders as an honest 'not posted — email him' state, so it is always safe to call.",
    input_schema: {
      type: 'object',
      properties: {
        label: { type: 'string', description: 'Optional button label override.' },
      },
    },
  },
  {
    name: 'render_contact_card',
    description:
      "Render Dylan's contact card: email, LinkedIn, GitHub, location, and co-op availability. Use it instead of typing his email into a sentence. There is no phone number and you must not offer one.",
    input_schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Optional short line explaining why you are surfacing this.',
        },
      },
    },
  },
  {
    name: 'render_links',
    description:
      'Render a small group of real, clickable links. Only use URLs that appear in the FACTS block — never construct or guess one. Prefer render_project_card when the links belong to a project.',
    input_schema: {
      type: 'object',
      properties: {
        links: {
          type: 'array',
          description: 'Two to four links at most.',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              href: { type: 'string' },
            },
            required: ['label', 'href'],
          },
        },
      },
      required: ['links'],
    },
  },
  {
    name: 'capture_recruiter_email',
    description:
      "Use this when a visitor offers their own contact details so Dylan can follow up, or asks you to pass a message along. Call it with whatever they gave you; call it with no arguments to render the short form that asks for the details. Never invent an address, and never use Dylan's own email here.",
    input_schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: "The visitor's email, exactly as they gave it." },
        name: { type: 'string' },
        company: { type: 'string' },
        message: { type: 'string', description: 'What they want passed on, in their words.' },
      },
    },
  },
];
