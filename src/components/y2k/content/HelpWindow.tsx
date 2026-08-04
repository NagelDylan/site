/**
 * Help — how the machine itself works, not a bio.
 *
 * The only content component whose text is genuinely UI-specific: the desktop's
 * instructions are about dragging title bars and the taskbar, and the handheld has
 * neither. Both machines still share the Start bullet, Shut Down, dark mode and
 * the reduced-motion note, so the branch is a middle section rather than a second
 * component.
 */
import { RainbowRule } from '../deco';

type Props = { platform?: 'desktop' | 'mobile' };

/** Windows: they move, they resize, they minimise, and idling starts the saver. */
const DESKTOP_STEPS = (
  <>
    <li>
      <strong>Drag a title bar</strong> to move a window. They really move — that is most of the
      point. Focus the title text and use the arrow keys if you would rather not drag.
    </li>
    <li>
      <strong>_ ▢ ✕</strong> minimise, maximise and close. Minimised windows live in the taskbar.
    </li>
    <li>
      <strong>Grab the bottom-right corner</strong> to resize.
    </li>
    <li>
      <strong>Leave it alone for a minute</strong> and the screensaver takes over. Any key or
      click brings it back.
    </li>
  </>
);

/** No windows to arrange: one program, two soft keys and a task list. */
const MOBILE_STEPS = (
  <>
    <li>
      <strong>One program at a time</strong> fills the screen. Nothing overlaps, so there is
      nothing to drag, resize or dig out from under anything else.
    </li>
    <li>
      <strong>Back</strong> and <strong>Today</strong> are the soft keys along the bottom. Back
      walks back down the trail you came in on; Today is home, and the program you left keeps
      running.
    </li>
    <li>
      <strong>Menu</strong> is the program&apos;s own menu — the same File / Edit / View strip its
      window wears on a desktop.
    </li>
    <li>
      <strong>Start &gt; Running Programs</strong> lists everything still open, switches between
      them, and quits the one you are done with.
    </li>
    <li>
      <strong>Start &gt; Suspend</strong> is the screensaver. Tap the screen or press a key to wake
      it.
    </li>
  </>
);

const HelpWindow = ({ platform = 'desktop' }: Props) => {
  const mobile = platform === 'mobile';
  return (
    <div className="y2k-client y2k-client--face">
      <h2>{mobile ? 'HOW THIS HANDHELD WORKS' : 'HOW THIS DESKTOP WORKS'}</h2>
      <ul className="y2k-bullets">
        <li>
          <strong>Start</strong> is the navigation. Everything on this site is in there.
        </li>

        {mobile ? MOBILE_STEPS : DESKTOP_STEPS}

        <li>
          <strong>Start &gt; Shut Down</strong> does exactly what you are afraid it does, and then
          reboots.
        </li>
        <li>
          Prefer something calmer? The tray has a dark-mode switch
          {mobile ? '.' : ', and so does the Start menu.'}
        </li>
      </ul>
      <RainbowRule />
      <p>
        Reduced motion is respected: if your system asks for less movement, the blinking, the
        marquee and the sparkle trail all stay switched off
        {mobile
          ? ", and Suspend's screensaver holds still instead of flying."
          : ', and the screensaver never arms itself.'}
      </p>
    </div>
  );
};

export default HelpWindow;
