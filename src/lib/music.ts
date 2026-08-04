/**
 * The Winamp playlist: netBloc Vol. 24, a free netlabel compilation from
 * blocSonic, twelve tracks of it, sitting in public/media/music/.
 *
 * It lives in lib/ rather than data/ because src/data holds facts about me, and a
 * netlabel compilation is not one of those.
 *
 * ON THE FILES. The sources were 320 kbps MP3, 106 MB for 44 minutes, too much to
 * put in a git repo for a novelty player. They ship as 128 kbps AAC in an MP4
 * container (.m4a, ~44 MB), which every current browser decodes natively.
 * Regenerate with macOS afconvert:
 *
 *   afconvert -f m4af -d aac -b 128000 -q 127 -s 3 in.mp3 out.m4a
 *
 * `durationSec` is transcribed from `afinfo` rather than measured in the browser,
 * so the playlist can render its running times before any audio is fetched. These
 * numbers are rounded, so the seek bar reads the real HTMLAudioElement.duration
 * once the metadata event lands.
 *
 * ON THE LICENCE. The whole netBloc series is Creative Commons, but the exact
 * clause per track is not recorded in the files — the ID3 frames carry artist,
 * title, album, year and genre and no copyright frame — so nothing here asserts
 * one. The player credits the artist, the compilation and blocSonic. Worth
 * confirming the per-artist terms on blocSonic and, if they ask for it, putting
 * the specific licence beside the credit.
 */

export type Track = {
  /** Stable id, and the basename of the file. */
  id: string;
  title: string;
  artist: string;
  /** Absolute, from public/. */
  src: string;
  /** From `afinfo`, rounded to the second. Display only — see above. */
  durationSec: number;
};

/** The compilation itself, for the credit line the player renders. */
export const ALBUM = {
  title: "netBloc Vol. 24: tiuqottigeloot",
  label: "blocSonic",
  year: 2009,
  /** Cover art, 300 px — the era's own artwork. */
  cover: "/media/music/netbloc24-cover.webp",
  labelUrl: "https://blocsonic.com",
} as const;

/**
 * Named rather than inlined below so `trackAt` has a definite Track to fall back
 * on: `noUncheckedIndexedAccess` makes `TRACKS[i]` `Track | undefined` for any
 * computed index.
 */
const OPENING_TRACK: Track = {
  id: "01-paper-navy-tongue-tied",
  title: "Tongue Tied",
  artist: "Paper Navy",
  src: "/media/music/01-paper-navy-tongue-tied.m4a",
  durationSec: 201,
};

/** Track order is the compilation's order. Do not sort these alphabetically. */
export const TRACKS: Track[] = [
  OPENING_TRACK,
  {
    id: "02-eclectek-we-are-going-to-eclecfunk-your-ass",
    title: "We Are Going To Eclecfunk Your Ass",
    artist: "Eclectek",
    src: "/media/music/02-eclectek-we-are-going-to-eclecfunk-your-ass.m4a",
    durationSec: 190,
  },
  {
    id: "03-auto-pilot-seventeen",
    title: "Seventeen",
    artist: "Auto-Pilot",
    src: "/media/music/03-auto-pilot-seventeen.m4a",
    durationSec: 215,
  },
  {
    id: "04-muha-microphone",
    title: "Microphone",
    artist: "Muha",
    src: "/media/music/04-muha-microphone.m4a",
    durationSec: 182,
  },
  {
    id: "05-just-plain-ant-stumble",
    title: "Stumble",
    artist: "Just Plain Ant",
    src: "/media/music/05-just-plain-ant-stumble.m4a",
    durationSec: 86,
  },
  {
    id: "06-sleaze-god-damn",
    title: "God Damn",
    artist: "Sleaze",
    src: "/media/music/06-sleaze-god-damn.m4a",
    durationSec: 227,
  },
  {
    id: "07-juanitos-hola-hola-bossa-nova",
    title: "Hola Hola Bossa Nova",
    artist: "Juanitos",
    src: "/media/music/07-juanitos-hola-hola-bossa-nova.m4a",
    durationSec: 207,
  },
  {
    id: "08-entertainment-for-the-braindead-resolutions-chris-summer-remix",
    title: "Resolutions (Chris Summer Remix)",
    artist: "Entertainment For The Braindead",
    src: "/media/music/08-entertainment-for-the-braindead-resolutions-chris-summer-remix.m4a",
    durationSec: 314,
  },
  {
    id: "09-nobara-hayakawa-trail",
    title: "Trail",
    artist: "Nobara Hayakawa",
    src: "/media/music/09-nobara-hayakawa-trail.m4a",
    durationSec: 204,
  },
  {
    id: "10-diablo-swing-orchestra-heroines",
    title: "Heroines",
    artist: "Diablo Swing Orchestra",
    src: "/media/music/10-diablo-swing-orchestra-heroines.m4a",
    durationSec: 323,
  },
  {
    id: "11-60-tigres-garage",
    title: "Garage",
    artist: "60 Tigres",
    src: "/media/music/11-60-tigres-garage.m4a",
    durationSec: 245,
  },
  {
    id: "12-cm-aka-creative-the-cycle-featuring-mista-mista",
    title: "The Cycle (Featuring Mista Mista)",
    artist: "CM aka Creative",
    src: "/media/music/12-cm-aka-creative-the-cycle-featuring-mista-mista.m4a",
    durationSec: 221,
  },
];

/**
 * The track at `i`, wrapped into range, always defined — the player holds a plain
 * numeric index and shouldn't need an unreachable "no track" branch.
 *
 * Wrapping is not clamping: Winamp's ◀◀ on track one goes to track twelve.
 */
export function trackAt(i: number): Track {
  const wrapped = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
  return TRACKS[wrapped] ?? OPENING_TRACK;
}

/** "Artist — Title", or just the title if a file ever lands without an artist. */
export function trackLabel(track: Track): string {
  return track.artist ? `${track.artist} — ${track.title}` : track.title;
}

/**
 * m:ss. Used for both the transcribed durations above and the live playhead, so a
 * track's readout does not change format when its metadata arrives. Guards NaN
 * because `audio.duration` is NaN until the metadata event fires.
 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--";
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
