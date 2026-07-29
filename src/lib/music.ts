/**
 * THE PLAYLIST — twelve real audio files, shared by the two retro desktops.
 *
 * ─── WHY THIS FILE EXISTS AT ALL ──────────────────────────────────────────────
 * `y2k/content/WinampWindow.tsx` and `mac/content/QuickTimeWindow.tsx` used to
 * open on the same apology: there were no audio assets in this repo, so Winamp
 * synthesised a chiptune with WebAudio and QuickTime showed an empty movie well.
 * Both windows said so outright, which was the right call while it was true.
 *
 * It is no longer true. `public/media/music/` now holds the whole compilation,
 * so both players play it and neither window has to explain itself.
 *
 * ─── WHY IT LIVES IN lib/ AND NOT data/ ───────────────────────────────────────
 * `src/data/` is the fact layer: things that are true about Dylan, compiled into
 * the chatbot's system prompt by `fact-pack.ts`. A netlabel compilation is not a
 * fact about Dylan, and the bot has no business reciting a tracklist, so this is
 * a lib module and is deliberately not re-exported from `src/data/index.ts`.
 *
 * ─── WHY IT IS SHARED, WHEN G9 SAYS THE DESKTOPS SHARE NOTHING ────────────────
 * G9 keeps the two trees structurally independent — no shared hook, icon, or
 * window manager — and that still holds: Winamp and QuickTime below share no
 * component, no CSS, and no playback code. What they share is a *manifest of
 * files on disk*, which is the same exception `PHOTOS` in `data/identity.ts`
 * already makes for the portraits. Twelve filenames copied into two trees is
 * twelve filenames that can drift out of sync with `public/`, and a 404 on an
 * `<audio src>` is silent — the player just never starts.
 *
 * ─── ON THE FILES ─────────────────────────────────────────────────────────────
 * Sources were 320 kbps MP3, 106 MB for 44 minutes, which is not a thing to put
 * in a git repo for a novelty player. They ship as 128 kbps AAC in an MP4
 * container (`.m4a`, ~44 MB), which every current browser decodes natively — no
 * codec shim, no second format. Regenerate with macOS `afconvert`:
 *
 *   afconvert -f m4af -d aac -b 128000 -q 127 -s 3 in.mp3 out.m4a
 *
 * `durationSec` is transcribed from `afinfo` at import time rather than measured
 * in the browser, so a playlist can render its running times before a single
 * byte of audio is fetched. It is display metadata only — every seek bar reads
 * the real `HTMLAudioElement.duration` once the metadata event lands, because
 * these numbers are rounded and a seek bar that lies is worse than a slow one.
 *
 * ─── ON THE LICENCE, WHICH IS NOT FULLY VERIFIED ──────────────────────────────
 * netBloc Vol. 24 is a free netlabel compilation from blocSonic, and the whole
 * netBloc series is Creative Commons. The exact clause per track is *not*
 * recorded in the files — the ID3 frames carry artist, title, album, year and
 * genre ("Netlabel") and no copyright or licence frame — so this file does not
 * assert one, and neither does any UI string. Both players credit the artist,
 * the compilation and blocSonic, which is the part that is certain.
 *
 * BEFORE LAUNCH: confirm the per-artist terms on blocSonic and, if they require
 * it, put the specific licence and a link beside the credit. Same standard as
 * the `verified: false` outbound links in `data/projects.ts` — an unconfirmed
 * claim is flagged, not quietly published.
 */

export type Track = {
  /** Stable id, and the basename of the file. */
  id: string;
  title: string;
  /** Empty string where the file does not name one — see MIXTAPE below. */
  artist: string;
  /** Absolute, from public/. */
  src: string;
  /** From `afinfo`, rounded to the second. Display only — see the header. */
  durationSec: number;
};

/** The compilation itself, for the credit line each player renders in its own voice. */
export const ALBUM = {
  title: 'netBloc Vol. 24: tiuqottigeloot',
  label: 'blocSonic',
  year: 2009,
  /** Cover art, 300 px — the era's own artwork, not something generated here. */
  cover: '/media/music/netbloc24-cover.webp',
  labelUrl: 'https://blocsonic.com',
} as const;

/**
 * Track one, named rather than inlined below, for one reason: it gives `trackAt`
 * a *definite* Track to fall back on. `noUncheckedIndexedAccess` is on, so
 * `TRACKS[i]` is `Track | undefined` for any computed index — and nothing else in
 * this repo reaches for a non-null assertion to get out of that, so this doesn't
 * either. Every consumer gets a real Track and no player has to render a
 * "no track" state that cannot happen.
 */
const OPENING_TRACK: Track = {
  id: '01-diablo-swing-orchestra-heroines',
  title: 'Heroines',
  artist: 'Diablo Swing Orchestra',
  src: '/media/music/01-diablo-swing-orchestra-heroines.m4a',
  durationSec: 323,
};

/** Track order is the compilation's order. Do not sort these alphabetically. */
export const TRACKS: Track[] = [
  OPENING_TRACK,
  {
    id: '02-eclectek-we-are-going-to-eclecfunk-your-ass',
    title: 'We Are Going To Eclecfunk Your Ass',
    artist: 'Eclectek',
    src: '/media/music/02-eclectek-we-are-going-to-eclecfunk-your-ass.m4a',
    durationSec: 190,
  },
  {
    id: '03-auto-pilot-seventeen',
    title: 'Seventeen',
    artist: 'Auto-Pilot',
    src: '/media/music/03-auto-pilot-seventeen.m4a',
    durationSec: 215,
  },
  {
    id: '04-muha-microphone',
    title: 'Microphone',
    artist: 'Muha',
    src: '/media/music/04-muha-microphone.m4a',
    durationSec: 182,
  },
  {
    id: '05-just-plain-ant-stumble',
    title: 'Stumble',
    artist: 'Just Plain Ant',
    src: '/media/music/05-just-plain-ant-stumble.m4a',
    durationSec: 86,
  },
  {
    id: '06-sleaze-god-damn',
    title: 'God Damn',
    artist: 'Sleaze',
    src: '/media/music/06-sleaze-god-damn.m4a',
    durationSec: 227,
  },
  {
    id: '07-juanitos-hola-hola-bossa-nova',
    title: 'Hola Hola Bossa Nova',
    artist: 'Juanitos',
    src: '/media/music/07-juanitos-hola-hola-bossa-nova.m4a',
    durationSec: 207,
  },
  {
    id: '08-entertainment-for-the-braindead-resolutions-chris-summer-remix',
    title: 'Resolutions (Chris Summer Remix)',
    artist: 'Entertainment For The Braindead',
    src: '/media/music/08-entertainment-for-the-braindead-resolutions-chris-summer-remix.m4a',
    durationSec: 314,
  },
  {
    id: '09-nobara-hayakawa-trail',
    title: 'Trail',
    artist: 'Nobara Hayakawa',
    src: '/media/music/09-nobara-hayakawa-trail.m4a',
    durationSec: 204,
  },
  {
    id: '10-paper-navy-tongue-tied',
    title: 'Tongue Tied',
    artist: 'Paper Navy',
    src: '/media/music/10-paper-navy-tongue-tied.m4a',
    durationSec: 201,
  },
  {
    id: '11-60-tigres-garage',
    title: 'Garage',
    artist: '60 Tigres',
    src: '/media/music/11-60-tigres-garage.m4a',
    durationSec: 245,
  },
  {
    id: '12-cm-aka-creative-the-cycle-featuring-mista-mista',
    title: 'The Cycle (Featuring Mista Mista)',
    artist: 'CM aka Creative',
    src: '/media/music/12-cm-aka-creative-the-cycle-featuring-mista-mista.m4a',
    durationSec: 221,
  },
];

/**
 * The track at `i`, wrapped into range, always defined.
 *
 * Both players hold a numeric index in state, and `noUncheckedIndexedAccess`
 * makes every read of `TRACKS[i]` a `Track | undefined` that has to be narrowed
 * at each use site. Narrowing it once, here, is what keeps a "there is no track"
 * branch — a state neither player can actually reach — out of both windows.
 *
 * Wrapping is not clamping: Winamp's ◀◀ on track one goes to track twelve, which
 * is what that button did.
 */
export function trackAt(i: number): Track {
  const wrapped = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
  return TRACKS[wrapped] ?? OPENING_TRACK;
}

/**
 * ═══ THE PAPER MIXTAPE ════════════════════════════════════════════════════════
 *
 * A separate, unrelated set: five songs Dylan chose, for the paper theme's
 * always-visible control cluster (`paper/Mixtape.tsx`). Not a compilation, not
 * period dressing, no selector — one play button and one that moves to the next,
 * which is the whole interaction a mixtape offers.
 *
 * Deliberately a second list rather than more entries in TRACKS. The two desktops
 * play a 2009 netlabel compilation *because it is 2009 dressing*; this is a
 * personal shelf on a document that has no era. Merging them would put Diablo
 * Swing Orchestra in the paper header and Broadcast in the Winamp playlist, and
 * neither belongs where the other lives.
 *
 * ─── TWO THINGS ABOUT THIS SET ARE NOT SETTLED. READ BOTH. ────────────────────
 *
 * 1. THE LICENCE, WHICH IS A DIFFERENT PROBLEM FROM netBloc's.
 *    netBloc Vol. 24 is a free netlabel release, so publishing it needs only
 *    correct credit. These five are commercial recordings, and the files are
 *    stream rips — the encoder tags read `Lavf`/`dash`, i.e. they came out of a
 *    muxed stream, not off a disc. Serving them from a public site is
 *    distribution, and nothing in this repo has permission to do it. That is
 *    Dylan's call and he has made it; this file's job is to make sure the
 *    decision is written down where the next person reads the code rather than
 *    discovered by a takedown notice. If it needs undoing later, it is one
 *    component and one directory: delete `public/media/music-paper/`, MIXTAPE,
 *    and `paper/Mixtape.tsx`.
 *
 * 2. THREE OF THE ARTISTS ARE UNVERIFIED, SO THEY ARE BLANK.
 *    The MP3s carry no artist or title frames at all — no TPE1, no TIT2, only an
 *    encoder string. Everything below is read off the *filename*, which names an
 *    artist for two tracks and not for the other three. R5 says never invent a
 *    fact, and "I am fairly sure I recognise this song" is not a source, so the
 *    three unnamed ones carry an empty `artist` and the UI simply shows the title.
 *    `Stereo Lab` is likewise reproduced exactly as the filename spells it and has
 *    not been corrected to anything.
 *
 *    BEFORE LAUNCH: Dylan knows what these are. Fill in the three blanks and
 *    confirm the one spelling. Same standard as the `verified: false` links in
 *    `data/projects.ts` — unconfirmed is flagged, not quietly published.
 */
const FIRST_ON_TAPE: Track = {
  id: 'broadcast-come-on-let-s-go',
  title: "Come On Let's Go",
  artist: 'Broadcast',
  src: '/media/music-paper/broadcast-come-on-let-s-go.m4a',
  durationSec: 192,
};

export const MIXTAPE: Track[] = [
  FIRST_ON_TAPE,
  {
    id: 'from-the-morning',
    title: 'From The Morning',
    artist: '',
    src: '/media/music-paper/from-the-morning.m4a',
    durationSec: 151,
  },
  {
    id: 'get-me-away-from-here-i-m-dying',
    title: "Get Me Away from Here, I'm Dying",
    artist: '',
    src: '/media/music-paper/get-me-away-from-here-i-m-dying.m4a',
    durationSec: 205,
  },
  {
    id: 'olson',
    title: 'Olson',
    artist: '',
    src: '/media/music-paper/olson.m4a',
    durationSec: 92,
  },
  {
    id: 'stereo-lab-flower-called-nowhere',
    title: 'Flower Called Nowhere',
    artist: 'Stereo Lab',
    src: '/media/music-paper/stereo-lab-flower-called-nowhere.m4a',
    durationSec: 378,
  },
];

/** MIXTAPE's counterpart to `trackAt`, and definite for the same reason. */
export function mixtapeAt(i: number): Track {
  const wrapped = ((i % MIXTAPE.length) + MIXTAPE.length) % MIXTAPE.length;
  return MIXTAPE[wrapped] ?? FIRST_ON_TAPE;
}

/** "Artist — Title", or just the title where the artist is not known (see above). */
export function trackLabel(track: Track): string {
  return track.artist ? `${track.artist} — ${track.title}` : track.title;
}

/**
 * m:ss. Used for both the transcribed durations above and the live playhead, so
 * a track's readout does not change format the moment its metadata arrives.
 * Guards NaN because `audio.duration` is NaN until the metadata event fires.
 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '--:--';
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
