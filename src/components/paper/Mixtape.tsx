/**
 * The mixtape — the paper theme's music, and the smallest player on this site.
 *
 * WHAT IT IS: the theme's sound switch, plus one arrow. There is no separate play
 * button. The ♪ chip that already existed in this cluster *is* the control: ♪ on
 * starts the music, ♪ off stops it, and the arrow beside it moves to the next
 * song. Two chips, no third state to reason about.
 *
 * There is no visible song title anywhere. The name and artist are on the ♪ chip's
 * `title`, so they surface on hover, and on its `aria-label`, so they surface for a
 * screen reader. That is the right shape as well as the ask: the Y2K desktop gets
 * a twelve-row playlist editor and the Macintosh gets a popup menu, and a document
 * pinned to a corkboard gets a tape you turn on without reading the label. A track
 * title printed in the site header would also be the one piece of chrome that
 * changed width every time the tape moved on, shoving the rest of the row sideways.
 *
 * ─── WHY THIS COMPONENT OWNS THE ♪ SWITCH, AND NOT PaperControls ─────────────
 * That chip used to be a preference toggle for `sounds.ts` — the synthesised
 * rustle, scratch and pin-push the other controls fire off — and PaperControls
 * owned it. Now that the same chip starts and stops real audio, it has to live
 * wherever the `<audio>` element lives, for a reason that is not tidiness:
 * `audio.play()` must be called from inside the click handler itself. Routed
 * through a parent's state and down again, the call lands after React has
 * committed and painted, and Safari has by then decided the user gesture is over
 * and refuses to play. So the switch and the element are in one component, and
 * PaperControls is told about changes rather than making them.
 *
 * ─── THE SWITCH READS THE ELEMENT. IT DOES NOT REMEMBER WHAT IT WAS TOLD. ────
 * `on` comes from the element's own `play` and `pause` events, never from the
 * click handler setting a boolean. That is load-bearing, and it is the fix for a
 * real bug: paper is the server-rendered page and is never unmounted, so switching
 * to Y2K only *hides* it — the music went on playing into the other theme, and
 * coming back you found a chip that said `on` with nothing behind it.
 * `ThemeBoot.astro` now pauses every player before a theme swap, and because this
 * switch follows the element rather than its own memory, that pause flips the chip
 * to `off` on its own. This component does not need to know themes exist.
 *
 * The same is true of anything else that can stop playback without asking —
 * the OS media keys, a Bluetooth device disconnecting, the browser suspending a
 * background tab. All of them fire `pause`, and all of them therefore leave the
 * chip telling the truth.
 *
 * One switch governs both kinds of sound, which is the honest reading of a control
 * labelled ♪ on a page that now has music on it: off means this page is silent.
 * The explicit choice is still persisted under the same `SOUND_STORAGE_KEY`, so a
 * visitor who turned sound off before this existed stays off — but the persisted
 * value drives only the rustle/scratch effects, never the chip's label, and it
 * never starts music at load. Unrequested sound on page load is the one thing
 * every player on this site refuses to do.
 *
 * WHAT IT READS: `MIXTAPE` from `src/lib/music.ts`, which is where the five files
 * live along with the two things about them that are NOT settled — the licence,
 * and three artists the files do not name. Read that comment before touching the
 * copy here. Those three tracks hover as a title alone, because the manifest has
 * no artist to show and R5 forbids inventing one.
 *
 * ─── HOW IT BEHAVES, AND WHY ─────────────────────────────────────────────────
 *   • Nothing plays until the switch is thrown, and `preload="none"` with no `src`
 *     means nothing is even fetched until then. That matters more here than in the
 *     two desktops: paper is the server-rendered theme every crawler and every
 *     no-JS visitor lands on, and it must not become a page that pulls megabytes
 *     of audio to render. A persisted ♪ on does NOT resume the music on load, and
 *     the chip therefore opens as `off` on every load, because that is what is
 *     true — nothing is playing.
 *   • Next while playing keeps playing; next while off stays off.
 *   • It wraps. Five songs and a single forward arrow means the fifth has to lead
 *     back to the first or the arrow dies silently at the end of the tape.
 *   • The end of a song rolls into the next one, which is what a tape does. Only
 *     the last one stops, so the thing can be left alone.
 *
 * G8/A11Y: both chips are real buttons in the tab order, and with no visible label
 * the `aria-label`s are doing all the work — a screen reader hears "Turn the music
 * on — Olson" rather than an unnamed glyph. Keep them accurate if the copy changes.
 */
import { useRef, useState } from 'react';
import { MIXTAPE, mixtapeAt, trackLabel } from '../../lib/music';
import { SOUND_STORAGE_KEY } from './sounds';

type Props = {
  /**
   * Reports an explicit choice to PaperControls, which still needs to know whether
   * the synthesised rustle/scratch effects are allowed to fire.
   *
   * Fired from the click handler only, NOT from the element's pause event. A theme
   * swap silencing the music must not also wipe the visitor's effects preference —
   * they never asked for that, and they would come back to a page where the paper
   * had stopped rustling for no reason they could see.
   */
  onSoundChange: (on: boolean) => void;
};

const Mixtape = ({ onSoundChange }: Props) => {
  const [index, setIndex] = useState(0);
  /**
   * Whether audio is actually running, derived from the element's own events —
   * see the header. Never set speculatively by a click handler.
   */
  const [on, setOn] = useState(false);
  /** Set if the browser refuses or fails a file, so a dead switch says why. */
  const [failed, setFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  /**
   * False until the first time the switch is turned on. While it is false the
   * element has no `src` at all, which is what makes `preload="none"` mean
   * something — an element with a src set on mount still costs a request on some
   * browsers.
   */
  const started = useRef(false);

  const track = mixtapeAt(index);
  const label = trackLabel(track);

  const toggle = () => {
    const audio = audioRef.current;
    // Reads the element, not `on`, so the switch is correct even in the frame
    // after something external paused it.
    const next = audio ? audio.paused : !on;
    onSoundChange(next);
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, next ? 'on' : 'off');
    } catch {
      /* private mode */
    }
    if (!audio) return;
    if (!next) {
      audio.pause();
      return;
    }
    if (!started.current) {
      started.current = true;
      audio.src = track.src;
    }
    setFailed(false);
    // Called straight from the click, not from an effect — see the header. `on`
    // flips when the element's play event lands, not here.
    void audio.play().catch(() => setFailed(true));
  };

  /** Move to `next`, continuing to play if the music is running. */
  const load = (next: number) => {
    const audio = audioRef.current;
    setIndex(next);
    setFailed(false);
    if (!audio || !started.current) return;
    const wasPlaying = !audio.paused;
    audio.src = mixtapeAt(next).src;
    if (wasPlaying) void audio.play().catch(() => setFailed(true));
  };

  const upNext = trackLabel(mixtapeAt(index + 1));

  return (
    /*
      data-print-hide is the documented hook (print.css header) for things that are
      real on screen and meaningless on paper. Two transport glyphs on a printed
      résumé are exactly that — and a hover tooltip prints as nothing at all, so on
      paper this cluster would be two bare symbols with no explanation. `audio` is
      already hidden in print; .ctrl buttons in general are not.
    */
    <div className="mixtape" role="group" aria-label="Music" data-print-hide>
      <audio
        ref={audioRef}
        preload="none"
        // These two are the switch's only source of truth. Anything that starts or
        // stops this element — this component, a theme swap, the OS media keys —
        // moves the chip through here.
        onPlay={() => setOn(true)}
        onPause={() => setOn(false)}
        onError={() => {
          setFailed(true);
          setOn(false);
        }}
        // Roll on to the next song, and stop at the end of the tape. `ended` does
        // not fire a `pause` event even though it leaves the element paused, so
        // the last song is the one case where the switch has to be set by hand.
        onEnded={() => {
          if (index < MIXTAPE.length - 1) load(index + 1);
          else setOn(false);
        }}
      />

      <button
        type="button"
        className="ctrl mixtape-switch"
        onClick={toggle}
        aria-pressed={on}
        // The song's name and artist live in these two attributes and nowhere
        // else: hover for a pointer, aria-label for everyone else.
        aria-label={
          failed
            ? `${label} would not play`
            : on
              ? `Turn the music off — ${label}`
              : `Turn the music on — ${label}`
        }
        title={failed ? `${label} would not play` : label}
      >
        ♪ {failed ? 'error' : on ? 'on' : 'off'}
      </button>

      <button
        type="button"
        className="ctrl mixtape-next"
        // Wraps, so the last song leads back to the first rather than to a dead
        // arrow — see the header.
        onClick={() => load((index + 1) % MIXTAPE.length)}
        aria-label={`Next song — ${upNext}`}
        title={`Next — ${upNext}`}
      >
        <span aria-hidden="true">↷</span>
      </button>
    </div>
  );
};

export default Mixtape;
