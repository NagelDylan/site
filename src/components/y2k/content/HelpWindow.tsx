/** Help — how the desktop itself works, not a bio. */
import { RainbowRule } from '../deco';

const HelpWindow = () => (
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
        Prefer something calmer? The tray has a dark-mode switch, and so does the Start menu.
      </li>
    </ul>
    <RainbowRule />
    <p>
      Reduced motion is respected: if your system asks for less movement, the blinking, the
      marquee, the sparkle trail and the screensaver all stay switched off.
    </p>
  </div>
);

export default HelpWindow;
