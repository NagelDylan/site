/**
 * ABOUT ME!! — Notepad-flavoured about window.
 *
 * bioShort, bioLong and the headings are the Y2K voice layer's, unedited.
 * Interests and the photo come from the fact layer.
 */
import { IDENTITY, INTERESTS, PHOTO, SOCIALS } from '../../../data';
import { VOICES } from '../../../data/voice';
import { RainbowRule, UnderConstruction } from '../deco';

const voice = VOICES.y2k;

const AboutWindow = ({ onContact }: { onContact: () => void }) => (
  <div className="y2k-client">
    <h2>{voice.headings.about}</h2>

    <div className="y2k-media" style={{ float: 'left', margin: '0 12px 8px 0' }}>
      <img src={PHOTO.small} alt={PHOTO.alt} width={120} height={120} style={{ width: 120, height: 'auto' }} />
    </div>

    <p>{voice.bioShort}</p>
    <p style={{ clear: 'both' }} />

    <RainbowRule />

    {voice.bioLong.map((paragraph) => (
      <p key={paragraph.slice(0, 24)}>{paragraph}</p>
    ))}

    <h3>{voice.headings.interests}</h3>
    <ul className="y2k-bullets">
      {INTERESTS.map((interest) => (
        <li key={interest}>{interest}</li>
      ))}
    </ul>

    <RainbowRule />
    <p>
      <strong>{IDENTITY.availability}.</strong>{' '}
      <button type="button" className="y2k-btn" onClick={onContact}>
        {voice.ctaSecondary}
      </button>
    </p>
    <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <a href={SOCIALS.github} target="_blank" rel="noreferrer noopener">
        github.com/NagelDylan
      </a>
      <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer noopener">
        LinkedIn
      </a>
      <UnderConstruction label="MORE HOBBIES COMING SOON™" />
    </p>
  </div>
);

export default AboutWindow;
