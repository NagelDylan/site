/**
 * Welcome.htm — the hero, framed as a Netscape window.
 *
 * Copy comes from VOICES.y2k (already written in this voice, §8 layer 2) and the
 * fact layer. Nothing here is rewritten locally: the greeting, sub-line and CTA
 * labels are the voice layer's, and the availability line is IDENTITY's.
 */
import { IDENTITY, SOCIALS } from '../../../data';
import { VOICES } from '../../../data/voice';
import { Blink, RainbowRule, UnderConstruction, WebRing } from '../deco';

const voice = VOICES.y2k;

type Props = {
  onOpen: (kind: 'projects' | 'contact' | 'about' | 'experience' | 'guestbook') => void;
  onTheme: (theme: 'paper' | 'chat') => void;
  resume: { available: boolean; href: string; filename: string };
};

const WelcomeWindow = ({ onOpen, onTheme, resume }: Props) => (
  <div className="y2k-client">
    <p style={{ textAlign: 'center', fontWeight: 700 }} className="y2k-rainbow">
      {voice.greeting}
    </p>
    <h2 style={{ textAlign: 'center' }}>{IDENTITY.name}</h2>
    <p style={{ textAlign: 'center' }}>
      <strong>{IDENTITY.headline}</strong>
      <br />
      {IDENTITY.location}
    </p>
    <p style={{ textAlign: 'center' }}>
      <span className="y2k-avail">
        <Blink>★</Blink> {IDENTITY.availability.toUpperCase()} <Blink>★</Blink>
      </span>
    </p>

    <RainbowRule />

    <p>{voice.heroSub}</p>

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '12px 0' }}>
      <button type="button" className="y2k-btn y2k-btn-lg" onClick={() => onOpen('projects')}>
        {voice.ctaPrimary}
      </button>
      <button type="button" className="y2k-btn y2k-btn-lg" onClick={() => onOpen('contact')}>
        {voice.ctaSecondary}
      </button>
      <button type="button" className="y2k-btn" onClick={() => onOpen('experience')}>
        {voice.headings.experience}
      </button>
      <button type="button" className="y2k-btn" onClick={() => onOpen('about')}>
        {voice.headings.about}
      </button>
    </div>

    {/* §13: the download exists only when the file does. The desktop reads fine without it. */}
    {resume.available ? (
      <p>
        <a className="y2k-btn" href={resume.href} download={resume.filename}>
          💾 DOWNLOAD MY RÉSUMÉ (.pdf)
        </a>
      </p>
    ) : null}

    <RainbowRule />

    <p style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <a href={SOCIALS.github} target="_blank" rel="noreferrer noopener">
        GitHub
      </a>
      <span aria-hidden="true">•</span>
      <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer noopener">
        LinkedIn
      </a>
      <span aria-hidden="true">•</span>
      <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a>
      <span aria-hidden="true">•</span>
      <button type="button" className="y2k-btn" onClick={() => onOpen('guestbook')}>
        SIGN MY GUESTBOOK
      </button>
    </p>

    <p style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
      <UnderConstruction label="THIS PAGE IS ETERNALLY UNDER CONSTRUCTION" />
    </p>

    <WebRing onTheme={onTheme} />
  </div>
);

export default WelcomeWindow;
