/**
 * WINAMP 2.9 — it whips the DOM's behind.
 *
 * ─── ON AUDIO ────────────────────────────────────────────────────────────────
 * There are no audio assets in this repo and none can be downloaded (§18.2), so
 * rather than reference a file that does not exist — a broken <audio src> is the
 * worst of both worlds — the player synthesises its own chiptune with WebAudio:
 * two square-wave voices and a triangle bass over a fixed sixteen-step pattern.
 * Nothing is fetched, and the track name says outright that it is generated.
 *
 * Muted by default, per the spec. The AudioContext is created lazily inside the
 * click handler, because browsers require a user gesture and because a visitor
 * who never touches the player should never pay for an audio graph.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

/** Sixteen steps, A-minor-ish. Nulls are rests. Values are MIDI note numbers. */
const LEAD: (number | null)[] = [69, null, 72, 76, 74, null, 72, 69, 67, null, 69, 72, 71, null, 67, null];
const BASS: (number | null)[] = [45, null, 45, null, 41, null, 41, null, 43, null, 43, null, 40, null, 40, null];
const STEP_MS = 145;

const midiToHz = (note: number) => 440 * Math.pow(2, (note - 69) / 12);

const WinampWindow = () => {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.35);
  const [step, setStep] = useState(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const timerRef = useRef(0);
  const stepRef = useRef(0);

  const stop = useCallback(() => {
    window.clearInterval(timerRef.current);
    timerRef.current = 0;
    setPlaying(false);
  }, []);

  useEffect(() => () => window.clearInterval(timerRef.current), []);

  useEffect(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.value = muted ? 0 : volume * 0.22;
    }
  }, [muted, volume]);

  const voice = (
    ctx: AudioContext,
    out: GainNode,
    note: number,
    type: OscillatorType,
    length: number,
    level: number,
  ) => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.value = midiToHz(note);
    const now = ctx.currentTime;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(level, now + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, now + length);
    osc.connect(env).connect(out);
    osc.start(now);
    osc.stop(now + length + 0.02);
  };

  const play = () => {
    if (playing) {
      stop();
      return;
    }
    let ctx = ctxRef.current;
    if (!ctx) {
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) {
        // No WebAudio: the UI still works, it just makes no sound. Say nothing false.
        setPlaying(true);
        return;
      }
      ctx = new Ctor();
      const gain = ctx.createGain();
      gain.gain.value = muted ? 0 : volume * 0.22;
      gain.connect(ctx.destination);
      ctxRef.current = ctx;
      gainRef.current = gain;
    }
    void ctx.resume();
    setPlaying(true);
    timerRef.current = window.setInterval(() => {
      const context = ctxRef.current;
      const gain = gainRef.current;
      const index = stepRef.current % 16;
      stepRef.current += 1;
      setStep(index);
      if (!context || !gain) return;
      const lead = LEAD[index];
      const bass = BASS[index];
      if (lead != null) voice(context, gain, lead, 'square', 0.16, 0.5);
      if (bass != null) voice(context, gain, bass, 'triangle', 0.2, 0.7);
      if (index % 4 === 0) voice(context, gain, 84, 'square', 0.03, 0.18);
    }, STEP_MS);
  };

  return (
    <div className="y2k-client y2k-client--face" style={{ padding: 4 }}>
      <div className="y2k-winamp">
        <div className="y2k-winamp-lcd">
          <span className="y2k-winamp-title">
            {playing ? '▶' : '■'} 01. chiptune_no_1 — synthesised live
          </span>
          <span className="y2k-winamp-viz" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <i
                key={i}
                style={{
                  height: playing ? `${4 + ((step * 3 + i * 5) % 7) * 2.2}px` : '3px',
                  transition: 'height 90ms linear',
                }}
              />
            ))}
          </span>
        </div>

        <div className="y2k-winamp-row">
          <button type="button" onClick={play} data-pressed={playing || undefined}>
            {playing ? '■ STOP' : '▶ PLAY'}
          </button>
          <button type="button" onClick={() => setMuted((m) => !m)} data-pressed={muted || undefined}>
            {muted ? '🔇 MUTED' : '🔊 ON'}
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

        <p className="y2k-winamp-note">
          No audio files exist on this server. This is two square waves and a triangle bass,
          generated in your browser with WebAudio. Muted until you say otherwise.
        </p>
      </div>
    </div>
  );
};

export default WinampWindow;
