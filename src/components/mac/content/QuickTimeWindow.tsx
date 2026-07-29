/**
 * QuickTime Player 4 — the silver player, and it now has something in it.
 *
 * ─── WHAT CHANGED, AND WHY THE OLD COMMENT HERE IS GONE ──────────────────────
 * This window's whole argument used to be that there was nothing to play: no
 * audio existed in the repo, so the honest version of a media player on a silent
 * desktop was QuickTime open with no movie, transport greyed, time showing
 * dashes. That was correct while it was true.
 *
 * `public/media/music/` now holds netBloc Vol. 24 — a free netlabel compilation
 * from 2009 — so the premise is void and the greyed controls would now be a
 * different small lie: a player refusing to play files that are right there.
 * The transport is live, the time readout counts, and the thumbwheel is wired to
 * the actual output rather than to nothing.
 *
 * ─── WHAT DID NOT CHANGE: THE TEMPERAMENT ────────────────────────────────────
 * §0 still says the Macintosh is the quiet one, and G9 still says these two
 * desktops share no code. `y2k/content/WinampWindow.tsx` plays the same twelve
 * files and is a different object doing it:
 *
 *   Winamp gets a twelve-row playlist editor, a green LCD, and a real spectrum
 *   analyser, because Winamp's entire personality is volume.
 *
 *   QuickTime gets a **popup menu**. That is the Macintosh's native selector —
 *   one control, closed until you ask it, showing the current choice — and it is
 *   the right answer for a player whose window is mostly a calm silver frame.
 *   There is no analyser here. Bars jumping in a Platinum window would be
 *   somebody else's idea of fun.
 *
 * The two share exactly one thing, `src/lib/music.ts`, which is a manifest of
 * filenames rather than code — the same exception `PHOTOS` already makes for the
 * portraits, and for the same reason: twelve paths duplicated across two trees is
 * twelve paths that can drift out of step with `public/`, and a 404 on an
 * `<audio src>` is silent.
 *
 * ─── NOTES FOR WHOEVER WRITES mac/content-apps.css ──────────────────────────
 * That stylesheet is still a stub, so nothing in this tree is styled yet and this
 * window is no exception. New classes it will need: `.mac-qt-art` (the cover, and
 * it wants the same 1-bit dither treatment `.mac-portrait` gets — the artwork is
 * a colour JPEG and this is a black-and-white desktop), `.mac-qt-scrub`,
 * `.mac-qt-select`, and `.mac-qt-credit`. Everything else reuses names the
 * window already had.
 *
 * Nothing autoplays and nothing is preloaded: `preload="none"` keeps 44 MB of
 * audio unfetched until a visitor presses a button, and the durations in the
 * popup come from the manifest so the menu can be read before anything is
 * fetched. Reads nothing from the fact layer.
 */
import { useEffect, useRef, useState } from 'react';
import Icon from '../Icon';
import { Hairline } from '../deco';
import { ALBUM, TRACKS, formatTime, trackAt } from '../../../lib/music';

const QuickTimeWindow = () => {
  const [volume, setVolume] = useState(0.5);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  /** The file's own duration, once its metadata lands. NaN until then. */
  const [duration, setDuration] = useState(Number.NaN);
  const [failed, setFailed] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const track = trackAt(index);
  /** The manifest's rounded time stands in until the real one arrives. */
  const shownDuration = Number.isFinite(duration) ? duration : track.durationSec;

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  /*
   * Stop on the way out. Removing an <audio> element from the document does not
   * pause it — closing this window mid-piece would leave a detached node playing
   * with nothing on screen able to stop it. ThemeBoot.astro sweeps every player
   * before a theme swap for the same reason; this covers the close box.
   */
  useEffect(() => {
    return () => audioRef.current?.pause();
  }, []);

  /**
   * Load a track. `resume` continues playback only when a press put us here.
   *
   * Clamped rather than wrapped, unlike Winamp: the transport buttons here are
   * disabled at the ends, so a wrap would be a jump the disabled state has
   * already told the visitor cannot happen.
   */
  const load = (next: number, resume: boolean) => {
    const audio = audioRef.current;
    const wanted = trackAt(Math.min(Math.max(next, 0), TRACKS.length - 1));
    setIndex(TRACKS.indexOf(wanted));
    setElapsed(0);
    setDuration(Number.NaN);
    setFailed(false);
    if (!audio) return;
    audio.src = wanted.src;
    if (resume) void audio.play().catch(() => setFailed(true));
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      return;
    }
    // First press of the session: the element has no src, which is what
    // preload="none" is protecting.
    if (!audio.src) audio.src = track.src;
    void audio.play().catch(() => setFailed(true));
  };

  return (
    <div className="mac-client mac-qt">
      <div className="mac-qt-body">
        <audio
          ref={audioRef}
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onError={() => {
            setFailed(true);
            setPlaying(false);
          }}
          // Plays the compilation in its order and stops at the end rather than
          // looping: a player that will not stop by itself has to be hunted down.
          onEnded={() => {
            if (index < TRACKS.length - 1) load(index + 1, true);
            else setPlaying(false);
          }}
        />

        {/*
          The display well. These are audio files, so what QuickTime showed for a
          sound-only movie was the poster frame — here, the compilation's own
          cover art. The player badge stays as the fallback for the moment before
          the image loads.
        */}
        <div className="mac-qt-screen">
          <img
            className="mac-qt-art"
            src={ALBUM.cover}
            alt={`Cover of ${ALBUM.title}`}
            width={120}
            height={120}
            loading="lazy"
            decoding="async"
          />
          <span className="mac-qt-screen-mark" aria-hidden="true" data-decorative>
            <Icon name="quicktime" />
          </span>
          {/* aria-live so changing the selection is announced without moving focus. */}
          <span className="mac-qt-screen-note" aria-live="polite">
            {failed
              ? 'This file would not play.'
              : `${track.title} — ${track.artist}`}
          </span>
        </div>

        {/*
          The scrub bar. Disabled until the real duration is known: before that
          the only length available is the manifest's rounded one, and dragging
          against a rounded length puts the playhead where nobody aimed it.
        */}
        <input
          type="range"
          className="mac-qt-scrub"
          data-print-hide
          min={0}
          max={Math.max(1, Math.floor(shownDuration))}
          step={1}
          value={Math.floor(elapsed)}
          disabled={!Number.isFinite(duration)}
          aria-label={`Scrub through ${track.title}`}
          data-balloon="Drag here to move through the piece. It becomes available once the file's length is known."
          onChange={(event) => {
            const audio = audioRef.current;
            const at = Number(event.target.value);
            setElapsed(at);
            if (audio) audio.currentTime = at;
          }}
        />

        <div className="mac-qt-controls" data-chrome>
          {/* The signature thumbwheel, on the left where QuickTime kept it. It is
              connected to the output now, so the old note about it turning for
              nothing has gone with the silence it described. */}
          <span className="mac-qt-wheel-wrap">
            <input
              type="range"
              className="mac-qt-wheel"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              aria-label="Volume"
              data-balloon="Turn this wheel to set the playback volume."
            />
          </span>

          <span className="mac-qt-time">
            {formatTime(elapsed)} / {formatTime(shownDuration)}
          </span>

          <span className="mac-qt-transport">
            <button
              type="button"
              className="mac-qt-btn"
              onClick={() => load(index - 1, playing)}
              disabled={index === 0}
              aria-label="Previous piece"
              data-balloon="Click here for the previous piece in the collection."
            >
              <span aria-hidden="true">◀◀</span>
            </button>
            <button
              type="button"
              className="mac-qt-btn"
              onClick={toggle}
              aria-label={playing ? 'Pause' : 'Play'}
              data-balloon="Click here to start or pause playback. Nothing plays until you do."
            >
              <span aria-hidden="true">{playing ? '❙❙' : '▶'}</span>
            </button>
            <button
              type="button"
              className="mac-qt-btn"
              onClick={() => load(index + 1, playing)}
              disabled={index >= TRACKS.length - 1}
              aria-label="Next piece"
              data-balloon="Click here for the next piece in the collection."
            >
              <span aria-hidden="true">▶▶</span>
            </button>
          </span>
        </div>

        {/*
          The selector, as a popup menu — the Macintosh's own way of offering a
          list of one-of-many. A native <select> is exactly the right element:
          it is what Platinum's popup menu was, it comes with keyboard handling
          and a screen-reader contract already written, and it stays closed until
          it is asked, which is the whole difference in manner between this window
          and Winamp's twelve permanently open rows.
        */}
        <label className="mac-qt-picker" data-print-hide>
          <span>Movie</span>
          <select
            className="mac-qt-select"
            value={track.id}
            onChange={(event) => {
              const next = TRACKS.findIndex((item) => item.id === event.target.value);
              // Selecting from the menu counts as a press, so it starts playing.
              if (next >= 0) load(next, true);
            }}
            data-balloon="Choose a piece from this collection. Choosing one starts it."
          >
            {TRACKS.map((item, i) => (
              <option key={item.id} value={item.id}>
                {i + 1}. {item.artist} — {item.title} ({formatTime(item.durationSec)})
              </option>
            ))}
          </select>
        </label>
      </div>

      <Hairline />

      <p className="mac-note mac-qt-credit">
        The collection is {ALBUM.title} ({ALBUM.label}, {ALBUM.year}), a free netlabel
        compilation — not Dylan's music, and included because it is very nearly the same
        age as the desktop it is playing on. Full credits are with the release at{' '}
        <a href={ALBUM.labelUrl} target="_blank" rel="noopener noreferrer">
          {ALBUM.label}
        </a>
        . Nothing plays, and nothing is downloaded, until you press play.
      </p>
    </div>
  );
};

export default QuickTimeWindow;
