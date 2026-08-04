/**
 * GeoCities decoration. All CSS/SVG-drawn or plain text, no era graphics, and
 * everything is marked data-decorative so print.css can drop it.
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

export const MARQUEE_TEXT = `★ WELCOME TO MY HOMEPAGE ★  ${IDENTITY.availability.toUpperCase()} ★  DRAG THE WINDOWS, THEY REALLY MOVE ★  NO POP-UPS EXCEPT THE ONES I MADE ON PURPOSE ★`;

/**
 * DYLAN CE's version. The desktop's line brags about dragging windows, which is
 * the one thing this machine cannot do — a handheld has no overlap and no mouse —
 * so the boast moves to what a thumb can actually verify.
 */
export const MOBILE_MARQUEE_TEXT = `★ WELCOME TO MY HOMEPAGE ★  ${IDENTITY.availability.toUpperCase()} ★  TAP A PROGRAM, IT REALLY OPENS ★  NO POP-UPS EXCEPT THE ONES I MADE ON PURPOSE ★`;

export const RainbowRule = () => <hr className="y2k-hr" data-decorative />;
