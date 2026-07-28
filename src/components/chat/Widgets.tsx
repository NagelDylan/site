/**
 * The smaller tool-rendered components: résumé button, contact card, link group.
 *
 * All three exist so the assistant never has to paste a URL into prose. No
 * markdown parser ships with this theme, which means a link the model typed into
 * a sentence stays inert text — it can only produce a clickable thing by calling
 * a tool, and a tool can only render facts from src/data.
 */
import { IDENTITY, SOCIALS } from '../../data';
import { useChatContext } from './context';

/**
 * render_resume_button.
 *
 * The file's existence is resolved at build time (src/lib/resume.ts) and arrives
 * as a prop, so this is always safe for the model to call: with no résumé
 * published it degrades to an honest "not posted yet" rather than a 404 link.
 * Dropping public/resume.pdf in turns every one of these live at once.
 */
export const ResumeButton = ({ label }: { label?: string }) => {
  const { resume } = useChatContext();

  if (!resume.available) {
    return (
      <div className="c-card c-card--inline">
        <p className="c-card__text">
          His résumé is not posted on the site yet — he sends it directly. Email{' '}
          <a className="c-link" href={`mailto:${IDENTITY.email}`}>
            {IDENTITY.email}
          </a>{' '}
          and he will send the current one.
        </p>
      </div>
    );
  }

  return (
    <p className="c-actions">
      <a className="c-button c-button--primary" href={resume.href} download={resume.filename}>
        {label ?? 'Download his résumé'}
        <span className="c-button__hint">PDF</span>
      </a>
    </p>
  );
};

/**
 * render_contact_card.
 *
 * There is no phone number here and there must not be one: it is résumé-only
 * (§1), it is not in the fact pack, and the system prompt tells the model to
 * refuse if asked. This component is the last line of that same rule.
 */
export const ContactCard = ({ reason }: { reason?: string }) => (
  <article className="c-card c-card--contact" aria-label="How to reach Dylan Nagel">
    {reason ? <p className="c-card__note">{reason}</p> : null}
    <dl className="c-contact">
      <div className="c-contact__row">
        <dt>Email</dt>
        <dd>
          <a className="c-link" href={`mailto:${IDENTITY.email}`}>
            {IDENTITY.email}
          </a>
        </dd>
      </div>
      <div className="c-contact__row">
        <dt>LinkedIn</dt>
        <dd>
          <a className="c-link" href={SOCIALS.linkedin} target="_blank" rel="noopener noreferrer">
            /in/nageldylan
          </a>
        </dd>
      </div>
      <div className="c-contact__row">
        <dt>GitHub</dt>
        <dd>
          <a className="c-link" href={SOCIALS.github} target="_blank" rel="noopener noreferrer">
            NagelDylan
          </a>
        </dd>
      </div>
      <div className="c-contact__row">
        <dt>Based in</dt>
        <dd>{IDENTITY.location}</dd>
      </div>
      <div className="c-contact__row">
        <dt>Looking for</dt>
        <dd>{IDENTITY.availability}</dd>
      </div>
    </dl>
  </article>
);

/** render_links. Hrefs are validated in model.ts before they reach here. */
export const LinkList = ({ links }: { links: { label: string; href: string }[] }) => (
  <p className="c-actions">
    {links.map((link) => (
      <a
        className="c-button"
        key={link.href}
        href={link.href}
        target={link.href.startsWith('/') ? undefined : '_blank'}
        rel="noopener noreferrer"
      >
        {link.label}
      </a>
    ))}
  </p>
);
