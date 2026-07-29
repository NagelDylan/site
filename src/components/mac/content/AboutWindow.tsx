/**
 * About Dylan Nagel — the long introduction (spec §4.11).
 *
 * WHAT IT IS: a SimpleText page with a portrait floated into it. The Mac's
 * "About" box is a formal little thing, so this window states who he is, lets the
 * bio do the talking, and keeps its one flourish — a Stickies note carrying the
 * availability line — to the bottom.
 *
 * WHAT IT READS: `VOICES.mac.bioShort`, `bioLong` and `headings.interests` for
 * the prose, and IDENTITY / INTERESTS / PHOTOS / SOCIALS from the fact layer.
 * Every paragraph is the voice layer's, unedited; this file adds no sentence
 * about Dylan that is not already written somewhere in src/data (R5).
 *
 * §6: the portrait is the Y2K pixel art on purpose. `assets-src/` is frozen, so
 * no `me-mac.png` can be produced, and G9's one-portrait-per-theme rule is
 * knowingly bent here. What makes it Macintosh is the treatment, not the file:
 * `src/styles/mac/content-base.css` renders `.mac-portrait` as 1-bit black and white with a
 * dither overlay. `image-rendering: pixelated` is load-bearing there — smoothing
 * pixel art is the one thing that would make it look like a mistake.
 *
 * R4: the availability line is a Summer 2027 *co-op term*. Graduation is 2028 and
 * is stated in the About This Macintosh window.
 */
import { IDENTITY, INTERESTS, PHOTO, PHOTOS, SOCIALS } from '../../../data';
import { VOICES } from '../../../data/voice';
import { Hairline, StickyNote } from '../deco';

const voice = VOICES.mac;

const AboutWindow = ({ onContact }: { onContact: () => void }) => (
  // The long bio overflows 540 × 440, so the root is the scroll container and
  // carries `mac-scroll` for the era's scroll bars (§4.3).
  //
  // `mac-client--doc` puts it on document white rather than chrome grey. This is
  // a SimpleText document, the same as Read Me, and without the class the two
  // disagreed about their own stock — About rendered on the window face while
  // Read Me rendered on paper, which reads as one of them being unstyled.
  <div className="mac-client mac-client--doc mac-about mac-scroll">
    <h2>{IDENTITY.name}</h2>
    <p className="mac-about-meta">
      {IDENTITY.headline} · {IDENTITY.location}
    </p>

    {/* Float and margin are per-instance layout for this one image, which is the
        same reason the Y2K about window sets them inline. The look lives in CSS. */}
    <div className="mac-media" style={{ float: 'left', margin: '0 12px 8px 0' }}>
      <img
        className="mac-portrait"
        src={PHOTOS.mac.small}
        alt={PHOTO.alt}
        width={120}
        height={120}
        style={{ width: 120, height: 'auto' }}
      />
    </div>

    <p>{voice.bioShort}</p>
    {/* Clears the float before the hairline, so the rule spans the full column. */}
    <p style={{ clear: 'both' }} />

    <Hairline />

    {voice.bioLong.map((paragraph) => (
      <p key={paragraph.slice(0, 24)}>{paragraph}</p>
    ))}

    <h3>{voice.headings.interests}</h3>
    <ul className="mac-bullets">
      {INTERESTS.map((interest) => (
        <li key={interest}>{interest}</li>
      ))}
    </ul>

    <Hairline />

    {/* A Stickies note, because that is where a Mac user would put this line.
        It carries a real fact, so it is not marked decorative — print keeps it. */}
    <StickyNote className="mac-about-sticky">
      <p>{IDENTITY.availability}.</p>
      <button
        type="button"
        className="mac-btn"
        onClick={onContact}
        data-balloon="Click here to open a message window. The e-mail address below works too, and works better."
      >
        {voice.ctaSecondary}
      </button>
    </StickyNote>

    <p className="mac-links">
      <a href={SOCIALS.github} target="_blank" rel="noreferrer noopener">
        github.com/NagelDylan
      </a>
      <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer noopener">
        LinkedIn
      </a>
      <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a>
    </p>
  </div>
);

export default AboutWindow;
