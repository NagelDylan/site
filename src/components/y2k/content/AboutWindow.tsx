/** ABOUT ME!! — Notepad-flavoured about window. */
import { IDENTITY, PHOTO, SOCIALS } from '../../../data';
import { COPY } from '../../../data/copy';
import { RainbowRule } from '../deco';

const AboutWindow = ({ onContact }: { onContact: () => void }) => (
  <div className="y2k-client">
    <h2>{COPY.headings.about}</h2>

    <div className="y2k-media" style={{ float: 'left', margin: '0 12px 8px 0' }}>
      <img
        className="y2k-portrait"
        src={PHOTO.small}
        alt={PHOTO.alt}
        width={120}
        height={120}
        style={{ width: 120, height: 'auto' }}
      />
    </div>

    <p>{COPY.bioShort}</p>
    <p style={{ clear: 'both' }} />

    <RainbowRule />

    {COPY.bioLong.map((paragraph) => (
      <p key={paragraph.slice(0, 24)}>{paragraph}</p>
    ))}

    <RainbowRule />
    <p>
      <strong>{IDENTITY.availability}.</strong>{' '}
      <button type="button" className="y2k-btn" onClick={onContact}>
        {COPY.ctaSecondary}
      </button>
    </p>
    <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <a href={SOCIALS.github} target="_blank" rel="noreferrer noopener">
        github.com/NagelDylan
      </a>
      <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer noopener">
        LinkedIn
      </a>
    </p>
  </div>
);

export default AboutWindow;
