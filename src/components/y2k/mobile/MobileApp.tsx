/**
 * DYLAN CE: the same site as a Pocket PC 2002 handheld.
 *
 * The desktop shell (App.tsx) hands narrow viewports over to this one. It is not
 * a responsive version of that desktop — it is a different machine. One program
 * owns the screen, the title bar and the soft keys are fixed to the top and
 * bottom, and Start is top-left because Windows CE really did put it there.
 *
 * What it is *not* is a second copy of the content: every program here renders
 * the identical component the desktop window renders (see AppFrame), so a bio or
 * a job date can only be edited in one place. This file is the machine — boot,
 * suspend, shut down, the assistant and the one dialog — and nothing else.
 */
import { useCallback, useEffect, useState } from 'react';
import '../../../styles/mobile/base.css';
import '../../../styles/mobile/chrome.css';
import '../../../styles/mobile/today.css';
import '../../../styles/mobile/apps.css';
import '../../../styles/mobile/states.css';

import Clippy from '../Clippy';
import { Dialog, GUESTBOOK_FULL, type DialogSpec } from '../Dialog';
import { Screensaver } from '../effects';
import { useReducedMotion } from '../hooks';
import { WINDOW_MENUS, type Resume, type WindowKind } from '../wm';
import AppFrame from './AppFrame';
import CommandBar from './CommandBar';
import Post from './Post';
import Reset from './Reset';
import TapSparkle from './TapSparkle';
import Today from './Today';
import TopBar from './TopBar';
import { useShell } from './shell';

type Props = {
  onToggleMode: () => void;
  mode: 'light' | 'dark';
  resume: Resume;
};

const MobileApp = ({ onToggleMode, mode, resume }: Props) => {
  const reducedMotion = useReducedMotion();
  const shell = useShell();
  /* The BIOS post is the opening joke on both machines, so it plays on every
     visit rather than once per session. Skippable with a tap. */
  const [booting, setBooting] = useState(true);
  const [crashed, setCrashed] = useState(false);
  /* The desktop's screensaver arms itself on idle; a handheld's is a menu item,
     because a phone that has been idle has usually locked itself already. */
  const [suspended, setSuspended] = useState(false);
  const [assistant, setAssistant] = useState(false);
  const [dialog, setDialog] = useState<DialogSpec | null>(null);

  const { open, quitAll } = shell;
  const openKind = useCallback(
    (kind: WindowKind, arg?: string | null) => open(kind, arg ?? null),
    [open],
  );

  /** The paperclip introduces himself once the boot is out of the way. */
  useEffect(() => {
    if (booting) return;
    const timer = window.setTimeout(() => setAssistant(true), 1200);
    return () => window.clearTimeout(timer);
  }, [booting]);

  /*
   * No program opens on arrival, unlike the desktop: there, Welcome.htm exists so
   * nobody lands on a bare desktop, and here the Today screen is already the
   * loudest page on the site.
   */
  const current = shell.current;
  const menu = current ? WINDOW_MENUS[current.kind] ?? [] : [];

  /*
   * The document is the scroller here (a program flows to its natural height —
   * see apps.css), and swapping what fills it does not move it. Without this, a
   * program tapped from the launcher two screens down the Today page opens
   * already scrolled into the middle of itself.
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [current?.id]);

  /*
   * Suspend is a menu item rather than the desktop's idle timer, so nothing
   * resets on a key the way useIdle does — and the screensaver's own key handler
   * can only fire if the overlay happens to hold focus. A window listener is what
   * makes "press any key to wake" true for an external keyboard.
   */
  useEffect(() => {
    if (!suspended) return;
    const wake = () => setSuspended(false);
    window.addEventListener('keydown', wake);
    return () => window.removeEventListener('keydown', wake);
  }, [suspended]);

  return (
    <div className="y2k-ce">
      <TopBar
        title={current?.title ?? 'Today'}
        shell={shell}
        mode={mode}
        onToggleMode={onToggleMode}
        resumeAvailable={resume.available}
        onSuspend={() => setSuspended(true)}
        onShutDown={() => setCrashed(true)}
        onAssistant={() => setAssistant(true)}
      />

      <div className="y2k-ce-screen">
        {/*
         * Every running program stays mounted and the ones off screen are hidden,
         * which is the desktop's minimised-window behaviour and the only reading of
         * "Running Programs" that is true: a half-typed message survives a glance
         * at Today, Winamp keeps playing, and the résumé's install does not replay.
         * Keyed by id, so switching between two projects cannot hand the second one
         * the first one's playing media.
         *
         * A plain wrapper takes the `hidden`: apps.css sets `display: flex` on
         * .y2k-ce-app, which would outrank the UA rule for [hidden].
         */}
        {shell.running.map((app) => (
          <div key={app.id} hidden={app.id !== current?.id}>
            <AppFrame
              app={app}
              resume={resume}
              onOpen={openKind}
              onSign={() => setDialog(GUESTBOOK_FULL)}
            />
          </div>
        ))}

        {current ? null : <Today resume={resume} onOpen={openKind} />}
      </div>

      <CommandBar shell={shell} menu={menu} onAssistant={() => setAssistant(true)} />

      {/* Sparkles are motion-only decoration, so reduced motion removes them
          outright rather than freezing them mid-burst. */}
      {!reducedMotion ? <TapSparkle /> : null}

      {booting ? <Post resumeAvailable={resume.available} onDone={() => setBooting(false)} /> : null}

      {suspended ? <Screensaver onWake={() => setSuspended(false)} /> : null}

      {/*
       * Only ever reachable from Start → Shut Down, so it can never be mistaken
       * for a real crash, and it recovers the way an actual hard reset does: every
       * program gone, the boot console again, and the Today screen behind it. Not
       * the desktop's reopen-Welcome.htm, because arriving here does not open a
       * program either — see the note above.
       */}
      {crashed ? (
        <Reset
          onReboot={() => {
            setCrashed(false);
            quitAll();
            setBooting(true);
          }}
        />
      ) : null}

      {dialog ? <Dialog spec={dialog} onClose={() => setDialog(null)} /> : null}

      {assistant ? (
        <Clippy platform="mobile" onDismiss={() => setAssistant(false)} onOpen={openKind} />
      ) : null}
    </div>
  );
};

export default MobileApp;
