/**
 * GeoCities decoration.
 *
 * Everything here is either CSS/SVG-drawn or pure text, because no era graphics
 * can be downloaded into this repo (§18.2) and none could be licensed anyway.
 *
 * All of it is marked data-decorative so print.css removes it (G15), and none of
 * it asserts a fact about Dylan that is not already in the fact layer — the
 * counter says outright that it counts nothing, the webring links to the site's
 * own themes, and the marquee only ever restates the availability line.
 */
import { IDENTITY } from '../../data';

/** Blink, as an animation rather than the tag, so reduced motion can kill it. */
export const Blink = ({ children }: { children: React.ReactNode }) => (
  <span className="y2k-blink">{children}</span>
);

export const Marquee = ({ text, label }: { text: string; label?: string }) => (
  <div className="y2k-marquee" data-decorative aria-label={label}>
    <span>{text}</span>
  </div>
);

export const MARQUEE_TEXT = `★ WELCOME TO MY HOMEPAGE ★  ${IDENTITY.availability.toUpperCase()} ★  DRAG THE WINDOWS, THEY REALLY MOVE ★  THIS SITE IS BEST VIEWED WITH YOUR EYES ★  NO POP-UPS EXCEPT THE ONES I MADE ON PURPOSE ★`;

/**
 * Decorative visitor counter. Wired to nothing — there is no analytics service
 * behind this site (FEATURES.analytics is false) and a number pretending
 * otherwise would be a small lie in a large font.
 */
export const HitCounter = ({ value = '0000ID10T' }: { value?: string }) => (
  <span className="y2k-counter" data-decorative>
    <span>You are visitor no.</span>
    <b>
      {value.split('').map((char, i) => (
        <i key={i}>{char}</i>
      ))}
    </b>
    <span>(decorative — counts nothing)</span>
  </span>
);

export const UnderConstruction = ({ label = 'UNDER CONSTRUCTION' }: { label?: string }) => (
  <span className="y2k-construction" data-decorative>
    <span>▲</span>
    {label}
    <span>▲</span>
  </span>
);

export const RainbowRule = () => <hr className="y2k-hr" data-decorative />;

export const NetscapeBadge = () => (
  <span className="y2k-badge" data-decorative title="Purely nostalgic. It works everywhere.">
    Best viewed in <b>Netscape&nbsp;4</b> 800×600
  </span>
);

/**
 * The webring goes nowhere except back into this same site, which is the joke:
 * one homepage, three completely different homepages.
 */
export const WebRing = ({ onTheme }: { onTheme: (theme: 'paper' | 'chat') => void }) => (
  <div className="y2k-webring" data-decorative>
    <span>◄ THE &ldquo;ONE GUY, THREE WEBSITES&rdquo; RING ►</span>
    <button type="button" className="y2k-btn" onClick={() => onTheme('paper')}>
      ◄ PREV (paper)
    </button>
    <button type="button" className="y2k-btn" onClick={() => onTheme('chat')}>
      NEXT (the bot) ►
    </button>
  </div>
);
