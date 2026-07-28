/**
 * Paper-theme sound effects, synthesized.
 *
 * §9 asks for paper rustle, pencil scratch, and pin push, muted by default with a
 * visible toggle. There are no audio assets in this project and no way to fetch
 * any (the sandbox blocks CDNs), so rather than reference files that don't exist,
 * these are generated with WebAudio: filtered noise bursts for rustle and
 * scratch, a short pitched click for the pin. A few hundred bytes of code instead
 * of a few hundred kilobytes of samples, and nothing 404s.
 *
 * Muted by default regardless of preference — browsers block autoplay anyway, and
 * §9 is explicit that unrequested sound reads as a bug.
 */

let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  // Autoplay policy: the context starts suspended until a gesture resumes it.
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** White-noise buffer, cached — the basis of both paper sounds. */
let noise: AudioBuffer | null = null;
function noiseBuffer(ac: AudioContext): AudioBuffer {
  if (noise && noise.sampleRate === ac.sampleRate) return noise;
  const length = Math.floor(ac.sampleRate * 0.4);
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  noise = buffer;
  return buffer;
}

type Shape = { duration: number; freq: number; q: number; gain: number };

const SHAPES: Record<'rustle' | 'scratch' | 'pin', Shape> = {
  // Broad, soft, quick — a sheet being set down.
  rustle: { duration: 0.17, freq: 2600, q: 0.7, gain: 0.05 },
  // Narrower and grittier — graphite dragging.
  scratch: { duration: 0.09, freq: 4200, q: 2.2, gain: 0.04 },
  // Short and low — a pin going into cork.
  pin: { duration: 0.06, freq: 900, q: 5, gain: 0.07 },
};

export function play(kind: keyof typeof SHAPES): void {
  const ac = context();
  if (!ac) return;
  const { duration, freq, q, gain } = SHAPES[kind];

  const source = ac.createBufferSource();
  source.buffer = noiseBuffer(ac);

  const filter = ac.createBiquadFilter();
  filter.type = kind === 'pin' ? 'lowpass' : 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = q;

  const envelope = ac.createGain();
  const now = ac.currentTime;
  envelope.gain.setValueAtTime(0, now);
  envelope.gain.linearRampToValueAtTime(gain, now + 0.008);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  source.connect(filter).connect(envelope).connect(ac.destination);
  source.start(now);
  source.stop(now + duration + 0.02);
}

export const SOUND_STORAGE_KEY = 'nagel-paper-sound';
