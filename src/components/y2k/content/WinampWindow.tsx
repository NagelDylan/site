/**
 * WINAMP 2.9 — a real audio player over netBloc Vol. 24, a free netlabel
 * compilation. Manifest and transcode notes live in `src/lib/music.ts`.
 *
 * `preload="none"` and no `src` attribute: the playlist is ~44 MB, and the running
 * times in the list come from the manifest so it can render before anything is
 * fetched. Nothing autoplays; the AudioContext is built inside the first click.
 * The spectrum bars are a real AnalyserNode, so where WebAudio is missing they sit
 * flat rather than animating off a timer. Reduced motion stops the bars, not the
 * audio.
 *
 * The playlist is a real listbox (arrows, Home/End) and moving the selection is
 * loading the track — there is no separate confirm step.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ALBUM, TRACKS, formatTime, trackAt } from "../../../lib/music";
import { useReducedMotion } from "../hooks";

/** Analyser resolution. 32 bins in, twelve bars out. */
const FFT_SIZE = 64;
const BARS = 12;

const WinampWindow = () => {
  const reducedMotion = useReducedMotion();

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  // Not muted by default: nothing plays until the visitor presses ▶, so there is
  // no sound they did not ask for, and starting muted just makes the first press
  // look broken.
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
  /** The twelve bar elements, written to directly by the loop below. */
  const barsRef = useRef<(HTMLElement | null)[]>([]);

  const track = trackAt(index);
  /** The manifest's rounded time until the real one arrives. */
  const shownDuration = Number.isFinite(duration)
    ? duration
    : track.durationSec;

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = muted ? 0 : volume;
  }, [muted, volume]);

  /*
   * Wired to the <audio> element once and then left alone:
   * `createMediaElementSource` throws if called twice on the same element, so it
   * hangs off a ref rather than being rebuilt per track.
   */
  const ensureGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || ctxRef.current) return;
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    // No WebAudio: the element still plays, only the bars are lost, and they stay
    // flat.
    if (!Ctor) return;
    const ctx = new Ctor();
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = 0.75;
    // An AnalyserNode is a pass-through, so this both measures and plays.
    // Forgetting `.connect(destination)` is the classic way to make WebAudio
    // silence an element.
    source.connect(analyser).connect(ctx.destination);
    ctxRef.current = ctx;
    analyserRef.current = analyser;
  }, []);

  /*
   * The bar loop runs only while sound is coming out, and writes `style.height`
   * straight to the twelve nodes instead of going through state: sixty renders a
   * second of a component that also owns the playlist, for an identical result.
   * The bars carry no accessible content, so nothing outside this loop needs their
   * height.
   */
  useEffect(() => {
    const flatten = () => {
      for (const bar of barsRef.current) if (bar) bar.style.height = "3px";
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
   * Pausing the element matters as much as cancelling the frame loop: removing an
   * <audio> from the document does not stop it, so a window closed mid-song would
   * keep playing from a detached node with no UI left to stop it.
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
   * Roving-tabindex listbox: one tab stop for the whole playlist, arrows to move
   * within it. Twelve tab stops in a window that also has transport controls is
   * how a keyboard visitor gets stuck.
   */
  const onListKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const step =
      event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    if (step !== 0) {
      event.preventDefault();
      load(index + step, playing);
    } else if (event.key === "Home") {
      event.preventDefault();
      load(0, playing);
    } else if (event.key === "End") {
      event.preventDefault();
      load(TRACKS.length - 1, playing);
    }
  };

  return (
    <div className="y2k-client y2k-client--face y2k-winamp-frame">
      <div className="y2k-winamp">
        {/*
          No `src` attribute: on some browsers `preload="none"` is advisory enough
          that a bare src still costs a range request. It is assigned in
          `load`/`toggle`, which only run from a press.
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
          // The last track stops rather than looping back to the first.
          onEnded={() => {
            if (index < TRACKS.length - 1) load(index + 1, true);
            else setPlaying(false);
          }}
        />

        <div className="y2k-winamp-lcd">
          <span className="y2k-winamp-title">
            {failed ? "!" : playing ? "▶" : "■"}{" "}
            {String(index + 1).padStart(2, "0")}.{" "}
            {failed
              ? "file would not play"
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
                  height: "3px",
                  transition: reducedMotion ? "none" : "height 70ms linear",
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
          // Only real durations are seekable: before metadata arrives the max is
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
          <button
            type="button"
            onClick={() => load(index - 1, playing)}
            aria-label="Previous track"
          >
            ◀◀
          </button>
          <button
            type="button"
            onClick={toggle}
            data-pressed={playing || undefined}
          >
            {playing ? "▮▮ PAUSE" : "▶ PLAY"}
          </button>
          <button type="button" onClick={stop} aria-label="Stop">
            ■
          </button>
          <button
            type="button"
            onClick={() => load(index + 1, playing)}
            aria-label="Next track"
          >
            ▶▶
          </button>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            data-pressed={muted || undefined}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔊"}
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
                <span className="y2k-winamp-pl-num">
                  {String(i + 1).padStart(2, "0")}.
                </span>
                <span className="y2k-winamp-pl-name">
                  {item.artist} — {item.title}
                </span>
                <span className="y2k-winamp-pl-time">
                  {formatTime(item.durationSec)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="y2k-winamp-note">
          {ALBUM.title} —{" "}
          <a href={ALBUM.labelUrl} target="_blank" rel="noopener noreferrer">
            {ALBUM.label}
          </a>
          , {ALBUM.year}. A free netlabel compilation, not my music.
        </p>
      </div>
    </div>
  );
};

export default WinampWindow;
