/**
 * One turn in the transcript.
 *
 * Rendering is markdown-free by design (§11.3). Assistant text goes through
 * paragraph splitting and nothing else — no bold, no code fences, and crucially
 * no auto-linking. Rich output arrives as tool calls, which is both a nicer
 * result and a tighter guarantee: the model cannot manufacture a clickable link
 * by writing one, because prose is never parsed.
 */
import { IDENTITY } from '../../data';
import ProjectCard from './ProjectCard';
import RecruiterCapture from './RecruiterCapture';
import { ContactCard, LinkList, ResumeButton } from './Widgets';
import type { UiMessage, Widget } from './model';

const renderWidget = (widget: Widget) => {
  switch (widget.kind) {
    case 'project_card':
      return <ProjectCard slug={widget.slug} note={widget.note} />;
    case 'resume_button':
      return <ResumeButton label={widget.label} />;
    case 'contact_card':
      return <ContactCard reason={widget.reason} />;
    case 'links':
      return <LinkList links={widget.links} />;
    case 'recruiter_capture':
      return (
        <RecruiterCapture
          email={widget.email}
          name={widget.name}
          company={widget.company}
          message={widget.message}
        />
      );
    default:
      return null;
  }
};

const Message = ({ message }: { message: UiMessage }) => {
  const isUser = message.role === 'user';

  return (
    <li className="c-msg" data-role={message.role} data-streaming={message.streaming || undefined}>
      <p className="c-msg__who">{isUser ? 'You' : "Dylan's assistant"}</p>

      <div className="c-msg__body">
        {message.blocks.map((block) =>
          block.type === 'text' ? (
            <div className="c-prose" key={block.id}>
              {block.text.split(/\n{2,}/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ) : (
            <div className="c-msg__widget" key={block.id}>
              {renderWidget(block.widget)}
            </div>
          ),
        )}

        {/*
          stop_reason 'refusal': the turn succeeded at the HTTP level and came
          back with nothing in it. Saying so is more useful than an empty bubble,
          and it is not an error state — nothing broke.
        */}
        {message.refused ? (
          <div className="c-prose c-prose--quiet">
            <p>
              No answer came back for that one — the turn completed but returned empty. That is a
              real thing that happens rather than a crash.
            </p>
            <p>
              Try asking it a different way, or go straight to the person who definitely knows:{' '}
              <a className="c-link" href={`mailto:${IDENTITY.email}`}>
                {IDENTITY.email}
              </a>
              .
            </p>
          </div>
        ) : null}

        {message.truncated ? (
          <p className="c-prose c-prose--quiet">
            <span>That answer hit its length limit and stopped mid-thought. Ask for the rest.</span>
          </p>
        ) : null}
      </div>
    </li>
  );
};

export default Message;
