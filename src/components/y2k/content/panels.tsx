/**
 * Help and the webring.
 *
 * Grouped in one file because each is a short panel and they are both about the
 * desktop itself rather than about Dylan. The résumé window used to live here too
 * and moved to content/ResumeWindow.tsx when it stopped being short — it now
 * carries a three-state machine and a timer, which is nobody's idea of a panel.
 */
import type { ThemeId } from '../../../data/voice';
import { HitCounter, NetscapeBadge, RainbowRule, UnderConstruction, WebRing } from '../deco';

export const HelpWindow = ({ onTheme }: { onTheme: (theme: ThemeId) => void }) => (
  <div className="y2k-client y2k-client--face">
    <h2>HOW THIS DESKTOP WORKS</h2>
    <ul className="y2k-bullets">
      <li>
        <strong>Start</strong> is the navigation. Everything on this site is in there.
      </li>
      <li>
        <strong>Drag a title bar</strong> to move a window. They really move — that is most of
        the point. Focus the title text and use the arrow keys if you would rather not drag.
      </li>
      <li>
        <strong>_ ▢ ✕</strong> minimise, maximise and close. Minimised windows live in the
        taskbar.
      </li>
      <li>
        <strong>Grab the bottom-right corner</strong> to resize.
      </li>
      <li>
        <strong>Leave it alone for a minute</strong> and the screensaver takes over. Any key or
        click brings it back.
      </li>
      <li>
        <strong>Start &gt; Shut Down</strong> does exactly what you are afraid it does, and then
        reboots.
      </li>
      <li>
        Prefer something calmer? The tray has a theme switcher, and so does the Start menu.
      </li>
    </ul>
    <RainbowRule />
    <p>
      Reduced motion is respected: if your system asks for less movement, the blinking, the
      marquee, the sparkle trail and the screensaver all stay switched off.
    </p>
    <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button type="button" className="y2k-btn" onClick={() => onTheme('paper')}>
        Switch to the Paper theme
      </button>
      <button type="button" className="y2k-btn" onClick={() => onTheme('mac')}>
        Switch to the Macintosh
      </button>
    </p>
  </div>
);

export const WebringWindow = ({ onTheme }: { onTheme: (theme: 'paper' | 'mac') => void }) => (
  <div className="y2k-client">
    <h2>THE WEB RING</h2>
    <p>
      A ring of one. Same facts, three completely different websites — that is the whole
      experiment.
    </p>
    <WebRing onTheme={onTheme} />
    <RainbowRule />
    <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <NetscapeBadge />
      <span className="y2k-badge">Made with Notepad*</span>
      <span className="y2k-badge">100% hand-coded windows</span>
      <UnderConstruction />
    </p>
    <p style={{ fontSize: 11 }}>
      *not really — it is Astro and React 19, and the window manager is about six hundred lines
      of pointer events.
    </p>
    <HitCounter />
  </div>
);
