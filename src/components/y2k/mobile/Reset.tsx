/**
 * The hard reset: DYLAN CE's stop screen.
 *
 * Reachable only from Start → Shut Down, exactly like the desktop's Bsod, which
 * is why the copy has to break character and say so — an unexplained crash screen
 * on a phone reads as a site that has genuinely fallen over, and a visitor's next
 * move is to leave rather than to tap Reboot.
 *
 * Dressed as a Windows CE hard reset rather than a 640x480 stop screen, because a
 * handheld never had a 640x480 anything: no VXD, no lost unsaved work, just the
 * device dumping RAM and starting over. Every line is kept under ~34 characters so
 * the console does not wrap into prose.
 */
import { useEffect } from 'react';

const Reset = ({ onReboot }: { onReboot: () => void }) => {
  useEffect(() => {
    const go = () => onReboot();
    /*
     * Armed late for the same reason Bsod is: this screen opens on a tap, and on a
     * touch screen that tap's pointerdown would otherwise land on the listener
     * being registered and dismiss the screen before it has been read.
     */
    const armed = window.setTimeout(() => {
      window.addEventListener('keydown', go);
      window.addEventListener('pointerdown', go);
    }, 400);
    return () => {
      window.clearTimeout(armed);
      window.removeEventListener('keydown', go);
      window.removeEventListener('pointerdown', go);
    };
  }, [onReboot]);

  return (
    <div className="y2k-ce-reset" role="alertdialog" aria-label="Hard reset — tap to reboot">
      <h2>DYLAN CE</h2>
      <p style={{ margin: 0 }}>A fatal exception 0E has</p>
      <p style={{ margin: 0 }}>
        occurred at 0028:C001CAFE in
        <br />
        module TODAY.HTM(01)+00010E36.
      </p>
      <ul style={{ margin: 0, paddingLeft: '2ch', listStyle: 'none' }}>
        <li>* Tap the screen to reset.</li>
        <li>* All programs will close.</li>
        <li>* Unsaved data will be lost.</li>
        <li>&nbsp;&nbsp;(There was never any.)</li>
      </ul>
      <p style={{ margin: 0 }}>
        (You chose Shut Down. This was
        <br />
        the plan. Nothing is actually
        <br />
        broken, and your real phone is
        <br />
        completely fine.)
      </p>
      <p style={{ margin: 0 }}>
        Tap to continue <span className="y2k-blink">_</span>
      </p>
      <p style={{ margin: 0 }}>
        <button type="button" className="y2k-btn y2k-btn-lg" onClick={onReboot}>
          Reboot
        </button>
      </p>
    </div>
  );
};

export default Reset;
