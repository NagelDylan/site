/**
 * WINAMP 2.9 — it whips the DOM's behind.
 *
 * ─── ON AUDIO ────────────────────────────────────────────────────────────────
 * This window used to synthesise a chiptune with WebAudio, because the repo held
 * no audio assets and a broken `<audio src>` is the worst of both worlds. It now
 * holds twelve of them: netBloc Vol. 24, a free netlabel compilation from 2009,
 * which is period-correct to within about eighteen months of the machine this
 * desktop is pretending to be. See `src/lib/music.ts` for the manifest, the
 * transcode recipe, and the licence caveat that has to be settled before launch.
 *
 * So this is a real player now. The consequences worth knowing:
 *
 *   • `preload="none"`. The playlist is ~44 MB. A visitor who opens this window
 *     to look at it must not pay for a single byte of audio, and the running
 *     times in the list come from the manifest, not from the files, precisely so
 *     the list can render before anything is fetched.
 *   • Nothing autoplays, ever. The `AudioContext` is still built lazily inside
 *     the first click, both because browsers require a gesture and because a
 *     visitor who never touches the player should never pay for an audio graph.
 *   • It is no longer muted by default. That default existed to guarantee
 *     silence when the only thing to hear was a synthesised square wave; with
 *     real tracks it just means the play button appears broken. The guarantee it
 *     was protecting — no sound the visitor did not ask for — is now carried by
 *     the fact that playback only ever starts from an explicit press.
 *   • The spectrum analyser is genuinely an `AnalyserNode` on the audio element,
 *     so the bars are the music. Where WebAudio is unavailable the bars sit flat
 *     rather than animating off a timer: a fake analyser on real audio is a lie
 *     that is very easy to tell and very hard to justify.
 *   • G17: under `prefers-reduced-motion` the analyser loop never starts. The
 *     audio still plays — the preference is about movement, not sound.
 *
 * The playlist is the selector. It is a real listbox: arrow keys and Home/End move
 * through it, a click picks a row, and the current track is marked with
 * `aria-current` and `aria-selected` as well as with colour. Moving the selection
 * *is* loading the track — there is no separate confirm step, because a playlist
 * where the highlighted row is not the playing row is a playlist that has to
 * explain itself.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ALBUM, TRACKS, formatTime, trackAt } from '../../../lib/music';
import { useReducedMotion } from '../hooks';

/** Analyser resolution. 32 bins in, twelve bars out — the era's bar count. */
const FFT_SIZE = 64;
const BARS = 12;

const WinampWindow = () => {
  const reducedMotion = useReducedMotion();

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [elapsed, setElapsed] = useState(0);
  /** Real duration, once the file's metadata lands. NaN before that. */
  const [duration, setDuration] = useState(Number.NaN);
  /** Set when the browser refuses or fails a file, so the LCD can say so. */
  const [failed, setFailed] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const frameRef = useRef(0);
  /** The twelve bar elements, written to directly — see the loop below. */
  const barsRef = useRef<(HTMLElement | null)[]>([]);

  const track = trackAt(index);
  /** The manifest's rounded time until the real one arrives (see music.ts). */
  const shownDuration = Number.isFinite(duration) ? duration : track.durationSec;

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = muted ? 0 : volume;
  }, [muted, volume]);

  /*
   * The analyser is wired to the <audio> element exactly once and then left
   * alone. `createMediaElementSource` can only be called once per element, and
   * calling it twice throws — which is why this hangs off a ref rather than
   * being rebuilt per track. Everything downstream of it survives track changes
   * because the element does.
   */
  const ensureGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || ctxRef.current) return;
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    // No WebAudio: the element still plays. Only the bars are lost, and they
    // stay flat rather than pretending.
    if (!Ctor) return;
    const ctx = new Ctor();
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = 0.75;
    // Through the analyser to the speakers: an AnalyserNode is a pass-through,
    // so this both measures and plays. Forgetting `.connect(destination)` here
    // is the classic way to make WebAudio silence an element.
    source.connect(analyser).connect(ctx.destination);
    ctxRef.current = ctx;
    analyserRef.current = analyser;
  }, []);

  /*
   * The bar loop. Runs only while sound is actually coming out, and writes
   * `style.height` straight to the twelve nodes rather than going through state.
   *
   * This is the same decision wm.ts makes for a window drag, for the same reason:
   * sixty React renders a second — even of a twelve-element list — is sixty
   * reconciliations of a component that also owns a playlist, and the visible
   * result is identical. The bars are decoration with no accessible content, so
   * nothing outside this loop needs to know their height.
   */
  useEffect(() => {
    const flatten = () => {
      for (const bar of barsRef.current) if (bar) bar.style.height = '3px';
    };
    if (!playing || reducedMotion) {
      flatten();
      return;
    }
    const analyser = analyserRef.current;
    if (!analyser) return;
    const bins = new Uint8Array(analyser.frequencyBinCount);
    const step = Math.max(1, Math.floor(bins.length / BARS));
    const tick = () => {
      analyser.getByteFrequencyData(bins);
      for (let bar = 0; bar < BARS; bar += 1) {
        const node = barsRef.current[bar];
        if (!node) continue;
        let sum = 0;
        for (let i = 0; i < step; i += 1) sum += bins[bar * step + i] ?? 0;
        node.style.height = `${3 + (sum / step / 255) * 15}px`;
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };
    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frameRef.current);
      flatten();
    };
  }, [playing, reducedMotion]);

  /*
   * Teardown. Pausing the element matters as much as cancelling the frame loop:
   * removing an <audio> from the document does NOT stop it, so a Winamp window
   * closed mid-song would go on playing from a detached node with no UI left to
   * stop it. ThemeBoot.astro sweeps every player before a theme swap for the same
   * reason; this covers closing the window, and the desktop being torn down by
   * anything that is not a theme switch.
   */
  useEffect(() => {
    return () => {
      window.cancelAnimationFrame(frameRef.current);
      audioRef.current?.pause();
      void ctxRef.current?.close();
    };
  }, []);

  /** Load a track. `autoplay` is true only when a press put us here. */
  const load = useCallback(
    (next: number, autoplay: boolean) => {
      const audio = audioRef.current;
      const wanted = trackAt(next);
      setIndex(TRACKS.indexOf(wanted));
      setElapsed(0);
      setDuration(Number.NaN);
      setFailed(false);
      if (!audio) return;
      audio.src = wanted.src;
      if (autoplay) {
        ensureGraph();
        void ctxRef.current?.resume();
        void audio.play().catch(() => setFailed(true));
      }
    },
    [ensureGraph],
  );

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      return;
    }
    ensureGraph();
    void ctxRef.current?.resume();
    // First press of the session: the element has no src yet, because
    // preload="none" plus an empty src is what keeps the 44 MB unfetched.
    if (!audio.src) audio.src = track.src;
    void audio.play().catch(() => setFailed(true));
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setElapsed(0);
  };

  /*
   * Roving-tabindex listbox. One tab stop for the whole playlist, arrows to move
   * within it — a twelve-stop tab trap inside a window that also has transport
   * controls is how a keyboard visitor gets stuck.
   */
  const onListKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
    if (step !== 0) {
      event.preventDefault();
      load(index + step, playing);
    } else if (event.key === 'Home') {
      event.preventDefault();
      load(0, playing);
    } else if (event.key === 'End') {
      event.preventDefault();
      load(TRACKS.length - 1, playing);
    }
  };

  return (
    <div className="y2k-client y2k-client--face y2k-winamp-frame">
      <div className="y2k-winamp">
        {/*
          Not rendered with a `src` attribute: React would then set it on mount
          and, on some browsers, `preload="none"` is advisory enough that a bare
          src still costs a range request. The src is assigned in `load`/`toggle`,
          which only ever run from a press.
        */}
        <audio
          ref={audioRef}
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onError={() => {
            setFailed(true);
            setPlaying(false);
          }}
          // Advance the compilation in its own order. The last track stops
          // rather than looping back to the first: a player that will not stop
          // on its own is a player you have to go and find.
          onEnded={() => {
            if (index < TRACKS.length - 1) load(index + 1, true);
            else setPlaying(false);
          }}
        />

        <div className="y2k-winamp-lcd">
          <span className="y2k-winamp-title">
            {failed ? '!' : playing ? '▶' : '■'} {String(index + 1).padStart(2, '0')}.{' '}
            {failed
              ? 'file would not play'
              : `${track.artist} — ${track.title}`}
          </span>
          <span className="y2k-winamp-clock">
            {formatTime(elapsed)} / {formatTime(shownDuration)}
          </span>
          <span className="y2k-winamp-viz" aria-hidden="true">
            {Array.from({ length: BARS }, (_, i) => (
              <i
                key={i}
                ref={(node) => {
                  barsRef.current[i] = node;
                }}
                style={{
                  height: '3px',
                  transition: reducedMotion ? 'none' : 'height 70ms linear',
                }}
              />
            ))}
          </span>
        </div>

        <input
          type="range"
          className="y2k-winamp-seek"
          min={0}
          max={Math.max(1, Math.floor(shownDuration))}
          step={1}
          value={Math.floor(elapsed)}
          aria-label={`Seek within ${track.title}`}
          // Only real durations are seekable. Before metadata arrives the max is
          // the manifest's rounded guess, and dragging against a guess lands the
          // playhead somewhere the visitor did not aim for.
          disabled={!Number.isFinite(duration)}
          onChange={(e) => {
            const audio = audioRef.current;
            const at = Number(e.target.value);
            setElapsed(at);
            if (audio) audio.currentTime = at;
          }}
        />

        <div className="y2k-winamp-row">
          <button type="button" onClick={() => load(index - 1, playing)} aria-label="Previous track">
            ◀◀
          </button>
          <button type="button" onClick={toggle} data-pressed={playing || undefined}>
            {playing ? '▮▮ PAUSE' : '▶ PLAY'}
          </button>
          <button type="button" onClick={stop} aria-label="Stop">
            ■
          </button>
          <button type="button" onClick={() => load(index + 1, playing)} aria-label="Next track">
            ▶▶
          </button>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            data-pressed={muted || undefined}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            aria-label="Volume"
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </div>

        <div className="y2k-winamp-pl">
          <p className="y2k-winamp-pl-head" id="y2k-pl-label">
            PLAYLIST EDITOR — {TRACKS.length} TRACKS
          </p>
          <ul
            className="y2k-winamp-pl-list"
            role="listbox"
            tabIndex={0}
            aria-labelledby="y2k-pl-label"
            aria-activedescendant={`y2k-pl-${track.id}`}
            onKeyDown={onListKeyDown}
          >
            {TRACKS.map((item, i) => (
              <li
                key={item.id}
                id={`y2k-pl-${item.id}`}
                role="option"
                aria-selected={i === index}
                aria-current={i === index || undefined}
                data-current={i === index || undefined}
                onClick={() => load(i, true)}
              >
                <span className="y2k-winamp-pl-num">{String(i + 1).padStart(2, '0')}.</span>
                <span className="y2k-winamp-pl-name">
                  {item.artist} — {item.title}
                </span>
                <span className="y2k-winamp-pl-time">{formatTime(item.durationSec)}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="y2k-winamp-note">
          {ALBUM.title} —{' '}
          <a href={ALBUM.labelUrl} target="_blank" rel="noopener noreferrer">
            {ALBUM.label}
          </a>
          , {ALBUM.year}. A free netlabel compilation, not my music. Nothing plays until you
          press play.
        </p>
      </div>
    </div>
  );
};

export default WinampWindow;
