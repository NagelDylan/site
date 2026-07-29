/**
 * Icon set for the Classic Mac theme, drawn as inline SVG.
 *
 * Every icon here is hand-drawn because no image asset can be downloaded into
 * this repo (§18.2, and README: `assets-src/` is frozen), and none of the era's
 * real icons could be licensed anyway.
 *
 * ─── R3 AND THE TRADEMARK BOUNDARY ───────────────────────────────────────────
 * `src/components/y2k/Icon.tsx` carries this rule and it applies double in a
 * theme that pastiches a Macintosh:
 *
 *   THERE IS NO APPLE ICON IN THIS FILE, AND THERE MUST NEVER BE ONE.
 *
 * The Apple role gets a text treatment and nothing else (R3), and the apple
 * silhouette is a trademark that a personal site has no business drawing. The
 * menu-bar mark is `RainbowMark` below: six stripes in a rounded lozenge,
 * deliberately not fruit-shaped. If a future edit "fixes" it into an apple, that
 * is a regression, not an improvement.
 *
 * ─── THE MAC IDIOM, AS OPPOSED TO THE WIN98 ONE ──────────────────────────────
 * The Y2K set is chunky and 16-colour. This set is flatter, blacker and quieter:
 *   • 32×32 viewBox, 1px black outlines, flat fills from a narrow palette.
 *   • A 1px white highlight on the top-left face, `#888` shade bottom-right.
 *   • Folders are PALE BLUE-GREY, not yellow. That single colour choice is the
 *     fastest way to tell the two themes apart at icon size, so don't "correct"
 *     it toward the Windows folder.
 *   • Several icons are genuinely 1-bit — black on white with a 50% dither
 *     standing in for grey. The dither is the era's signature.
 *
 * Dither is drawn as real checkerboard rectangles by `dither()` rather than an
 * SVG <pattern>. A pattern needs an id, and this component renders many times
 * per page, so ids would collide across instances; `useId()` would work but
 * would mean rebuilding the whole path table per render. Rectangles are id-free,
 * static, and evaluated once at module load.
 */

export type IconName =
  | 'hd'
  | 'folder'
  | 'folderOpen'
  | 'doc'
  | 'simpletext'
  | 'pdf'
  | 'getinfo'
  | 'extension'
  | 'mail'
  | 'scrapbook'
  | 'notepad'
  | 'trash'
  | 'trashFull'
  | 'quicktime'
  | 'guide'
  | 'chooser'
  | 'sticky'
  | 'happymac'
  | 'sadmac'
  | 'bomb'
  | 'caution'
  | 'stop'
  | 'note'
  | 'grad'
  | 'briefcase'
  | 'person'
  | 'globe'
  | 'floppy'
  | 'watch';

type Props = { name: IconName; title?: string };

/** Narrow palette, shared so the set reads as one family. */
const INK = '#000000';
const WHITE = '#ffffff';
const SHADE = '#8a8a8a';
const FACE = '#dedede';
const FACE_DARK = '#b6b6b6';
const FOLDER = '#c3d4e2';
const FOLDER_DARK = '#9db3c6';
const SCREEN = '#c8ccc4';
const SILVER = '#d6d9dc';
const WARN = '#f0d05a';
const PAPER = '#fdfdfd';

/**
 * A 50%-dither fill for the region (x, y, w, h) as a single path `d`.
 *
 * `step` is the dither cell in user units; 1 gives the finest grid the 32-unit
 * box can express and is what the 1-bit icons use.
 */
function dither(x: number, y: number, w: number, h: number, step = 1): string {
  let d = '';
  const rows = Math.floor(h / step);
  const cols = Math.floor(w / step);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if ((row + col) % 2 === 1) continue;
      d += `M${x + col * step} ${y + row * step}h${step}v${step}h${-step}z`;
    }
  }
  return d;
}

/** Text lines inside a document, drawn as dithered bars rather than solid rules. */
const docLines = (
  <>
    <path d={dither(10, 15, 13, 1)} fill={INK} />
    <path d={dither(10, 18, 13, 1)} fill={INK} />
    <path d={dither(10, 21, 13, 1)} fill={INK} />
    <path d={dither(10, 24, 8, 1)} fill={INK} />
  </>
);

/** The page silhouette with the era's folded top-right corner. */
const page = (fill = PAPER) => (
  <>
    <path d="M7 3h12l6 6v20H7z" fill={fill} stroke={INK} strokeWidth="1" />
    <path d="M19 3v6h6" fill={FACE} stroke={INK} strokeWidth="1" />
  </>
);

const paths: Record<IconName, React.ReactNode> = {
  /* ── Volumes and containers ──────────────────────────────────────────── */

  // Macintosh HD: a drive case, bezel slot, and a status pip. Beige-platinum,
  // the colour every desktop's top-right corner actually was.
  hd: (
    <>
      <path d="M3 9h26v14H3z" fill={FACE} stroke={INK} strokeWidth="1" />
      <path d="M4 10h24v2H4z" fill={WHITE} />
      <path d="M4 20h24v2H4z" fill={FACE_DARK} />
      <path d="M7 14h14v5H7z" fill={SILVER} stroke={INK} strokeWidth="0.8" />
      <path d="M8 15h12v1H8z" fill={WHITE} />
      <circle cx="25" cy="16.5" r="1.4" fill={SHADE} stroke={INK} strokeWidth="0.6" />
      <path d="M3 23h26v2H3z" fill={SHADE} stroke={INK} strokeWidth="0.8" />
    </>
  ),

  // Pale blue-grey folder. NOT the Windows yellow — see the header note.
  folder: (
    <>
      <path d="M3 8h9l2.5 3H29v17H3z" fill={FOLDER} stroke={INK} strokeWidth="1" />
      <path d="M4 12h24v2H4z" fill={WHITE} opacity="0.85" />
      <path d="M3 25h26v3H3z" fill={FOLDER_DARK} />
    </>
  ),

  folderOpen: (
    <>
      <path d="M3 8h9l2.5 3H29v6H3z" fill={FOLDER_DARK} stroke={INK} strokeWidth="1" />
      <path d="M6 13h25l-4 15H3z" fill={FOLDER} stroke={INK} strokeWidth="1" />
      <path d="M7 15h21l-0.6 2H7z" fill={WHITE} opacity="0.8" />
    </>
  ),

  /* ── Documents ───────────────────────────────────────────────────────── */

  // 1-bit document: black outline, dithered body text. The plainest icon here,
  // and the one the era used most.
  doc: (
    <>
      {page()}
      {docLines}
    </>
  ),

  // SimpleText: a document with a pen nib resting on it.
  simpletext: (
    <>
      {page()}
      <path d={dither(10, 15, 12, 1)} fill={INK} />
      <path d={dither(10, 18, 12, 1)} fill={INK} />
      <path d="M13 27l1-4 8-8 3 3-8 8z" fill={SILVER} stroke={INK} strokeWidth="1" />
      <path d="M13 27l1-4 1.6 1.6z" fill={INK} />
      <path d="M21 12l3 3" stroke={INK} strokeWidth="1" />
    </>
  ),

  // Résumé/PDF: a document with a printable-page band and a down arrow. Kept
  // generic on purpose — no third-party logo.
  pdf: (
    <>
      {page()}
      <path d="M7 19h18v6H7z" fill={FACE_DARK} stroke={INK} strokeWidth="0.8" />
      <path d="M16 20v3.4M14 22.4l2 2 2-2" stroke={INK} strokeWidth="1.2" fill="none" />
      <path d={dither(10, 14, 12, 1)} fill={INK} />
    </>
  ),

  // Get Info: a document behind an italic serif "i", which is what the window's
  // own icon amounted to.
  getinfo: (
    <>
      {page()}
      <circle cx="21" cy="21" r="7" fill={WHITE} stroke={INK} strokeWidth="1.2" />
      <path d="M20.4 17.2h1.8l-0.4 1.8h-1.8z" fill={INK} />
      <path d="M19.4 19.8h2.6l-1 5.4h-1.8z" fill={INK} />
      <path d={dither(10, 14, 8, 1)} fill={INK} />
    </>
  ),

  // Note Pad desk accessory: spiral binding, curled bottom corner.
  notepad: (
    <>
      <path d="M6 6h20v22l-4 2H6z" fill={PAPER} stroke={INK} strokeWidth="1" />
      <path d="M22 28v2l4-2z" fill={FACE_DARK} stroke={INK} strokeWidth="0.8" />
      <path d="M6 6h20v3H6z" fill={FACE} stroke={INK} strokeWidth="0.8" />
      <path d="M9 4v4M13 4v4M17 4v4M21 4v4" stroke={INK} strokeWidth="1.2" />
      <path d={dither(9, 13, 14, 1)} fill={INK} />
      <path d={dither(9, 17, 14, 1)} fill={INK} />
      <path d={dither(9, 21, 9, 1)} fill={INK} />
    </>
  ),

  // Scrapbook: a bound album with a pasted-in corner photo.
  scrapbook: (
    <>
      <path d="M5 5h22v22H5z" fill={FACE} stroke={INK} strokeWidth="1" />
      <path d="M5 5h4v22H5z" fill={FACE_DARK} stroke={INK} strokeWidth="0.8" />
      <path d="M12 9h12v9H12z" fill={PAPER} stroke={INK} strokeWidth="0.8" />
      <path d="M13 16l3-4 2.4 3 2-2.4L23 16z" fill={SHADE} />
      <path d={dither(12, 21, 12, 1)} fill={INK} />
      <path d="M6 8h2M6 12h2M6 16h2M6 20h2" stroke={WHITE} strokeWidth="1" />
    </>
  ),

  // Stickies: the note itself, with the corner curl it always had.
  sticky: (
    <>
      <path d="M5 5h22v17l-5 5H5z" fill="#fdf6a9" stroke={INK} strokeWidth="1" />
      <path d="M22 27v-5h5z" fill="#e0d67a" stroke={INK} strokeWidth="0.8" />
      <path d="M9 11h14M9 15h14M9 19h9" stroke="#a89c3c" strokeWidth="1.2" />
    </>
  ),

  /* ── System and control ──────────────────────────────────────────────── */

  // Extensions were puzzle pieces. Nothing else says "system extension" as fast.
  extension: (
    <>
      <path
        d="M6 8h7a3 3 0 0 1 6 0h7v7a3 3 0 0 0 0 6v7h-7a3 3 0 0 0-6 0H6v-7a3 3 0 0 1 0-6z"
        fill={FOLDER}
        stroke={INK}
        strokeWidth="1"
      />
      <path d="M7 9h5a3 3 0 0 1 1-1v1H7z" fill={WHITE} opacity="0.9" />
      <path d={dither(9, 18, 8, 4)} fill={INK} opacity="0.35" />
    </>
  ),

  // Chooser: a small window with a selected row and the pointing hand.
  chooser: (
    <>
      <path d="M3 6h26v20H3z" fill={FACE} stroke={INK} strokeWidth="1" />
      <path d="M3 6h26v4H3z" fill={WHITE} stroke={INK} strokeWidth="0.8" />
      <path d="M5 7.2h1.6v1.6H5z" fill={FACE} stroke={INK} strokeWidth="0.6" />
      <path d="M6 12h10v12H6z" fill={PAPER} stroke={INK} strokeWidth="0.8" />
      <path d="M6.6 13h8.8v2.4H6.6z" fill="#b3c7e6" />
      <path d={dither(7, 17, 8, 1)} fill={INK} />
      <path d={dither(7, 20, 8, 1)} fill={INK} />
      <path
        d="M22 24v-5l-1-3.4a1.2 1.2 0 0 1 2.2-0.8l1.4 3.2V13a1.2 1.2 0 0 1 2.4 0v9z"
        fill={PAPER}
        stroke={INK}
        strokeWidth="1"
      />
    </>
  ),

  // Macintosh Guide: the question mark in a balloon.
  guide: (
    <>
      <path d="M4 5h24v16H12l-5 5v-5H4z" fill={PAPER} stroke={INK} strokeWidth="1.2" />
      <path
        d="M12.4 10.4a3.6 3.6 0 1 1 5 3.3c-1 0.5-1.4 1-1.4 2v0.5"
        fill="none"
        stroke={INK}
        strokeWidth="2"
      />
      <path d="M15 18.2h2v2h-2z" fill={INK} />
    </>
  ),

  // The 3.5" disk. Metal shutter, write-protect notch, a label to write on.
  floppy: (
    <>
      <path d="M5 4h22v24H5z" fill="#3f3f42" stroke={INK} strokeWidth="1" />
      <path d="M6 5h20v2H6z" fill="#5c5c60" />
      <path d="M11 4h10v9H11z" fill={SILVER} stroke={INK} strokeWidth="0.8" />
      <path d="M18 4h3v9h-3z" fill={FACE_DARK} stroke={INK} strokeWidth="0.6" />
      <path d="M9 16h14v11H9z" fill={PAPER} stroke={INK} strokeWidth="0.8" />
      <path d={dither(11, 19, 10, 1)} fill={INK} />
      <path d={dither(11, 22, 10, 1)} fill={INK} />
    </>
  ),

  // The wristwatch: the Mac's "please wait" cursor, long before the beachball.
  watch: (
    <>
      <path d="M12 3h8v5h-8zM12 24h8v5h-8z" fill={SILVER} stroke={INK} strokeWidth="1" />
      <circle cx="16" cy="16" r="9" fill={PAPER} stroke={INK} strokeWidth="1.4" />
      <path d="M16 16V10M16 16l4.5 2.6" stroke={INK} strokeWidth="1.6" fill="none" />
      <circle cx="16" cy="16" r="1.2" fill={INK} />
    </>
  ),

  /* ── Trash ───────────────────────────────────────────────────────────── */

  // The ridged Mac can, not a Windows bin.
  trash: (
    <>
      <path d="M9 9h14l-1.4 19H10.4z" fill={SILVER} stroke={INK} strokeWidth="1" />
      <path d="M7.5 5.6h17v3.4h-17z" fill={FACE} stroke={INK} strokeWidth="1" />
      <path d="M13.6 3.4h4.8v2.2h-4.8z" fill={FACE_DARK} stroke={INK} strokeWidth="0.8" />
      <path d="M12.4 12v13M16 12v13M19.6 12v13" stroke={SHADE} strokeWidth="1.1" />
      <path d="M10 10h1.2v17H10z" fill={WHITE} opacity="0.8" />
    </>
  ),

  trashFull: (
    <>
      <path d="M12 4l3 2-2 2 3 1-3 2" fill="none" stroke={INK} strokeWidth="1" />
      <path d="M17.5 3.5l2.4 2.6-2 1.4 2.6 1.4" fill="none" stroke={INK} strokeWidth="1" />
      <path d="M9 9h14l-1.4 19H10.4z" fill={SILVER} stroke={INK} strokeWidth="1" />
      <path d="M7.5 8h17v3.4h-17z" fill={FACE} stroke={INK} strokeWidth="1" />
      <path d="M12.4 13v12M16 13v12M19.6 13v12" stroke={SHADE} strokeWidth="1.1" />
      <path d="M10 12h1.2v15H10z" fill={WHITE} opacity="0.8" />
    </>
  ),

  /* ── Media and communication ─────────────────────────────────────────── */

  // QuickTime Player: silver body, film sprockets, play triangle. Deliberately
  // generic geometry — the real mark is a trademark.
  quicktime: (
    <>
      <rect x="3" y="7" width="26" height="18" rx="3" fill={SILVER} stroke={INK} strokeWidth="1" />
      <rect x="4" y="8" width="24" height="3" rx="1.5" fill={WHITE} opacity="0.85" />
      <path d="M7 13h18v9H7z" fill="#20242a" stroke={INK} strokeWidth="0.8" />
      <path d="M14 15.4l6 3.1-6 3.1z" fill={WHITE} />
      <path d="M4.6 13.4h1.4v1.4H4.6zM4.6 20.2h1.4v1.4H4.6zM26 13.4h1.4v1.4H26zM26 20.2h1.4v1.4H26z" fill={SHADE} />
    </>
  ),

  mail: (
    <>
      <path d="M3 8h26v16H3z" fill={PAPER} stroke={INK} strokeWidth="1" />
      <path d="M3 8l13 9 13-9" fill="none" stroke={INK} strokeWidth="1.2" />
      <path d="M3 24l9-7M29 24l-9-7" fill="none" stroke={SHADE} strokeWidth="1" />
    </>
  ),

  globe: (
    <>
      <circle cx="16" cy="16" r="12" fill="#cfe0ec" stroke={INK} strokeWidth="1.2" />
      <path d="M4 16h24" stroke={INK} strokeWidth="1" />
      <path d="M16 4v24" stroke={INK} strokeWidth="1" />
      <path d="M16 4c5 4 5 20 0 24M16 4c-5 4-5 20 0 24" fill="none" stroke={INK} strokeWidth="1" />
      <path d="M6.4 10.4c5.4 2.6 13.8 2.6 19.2 0M6.4 21.6c5.4-2.6 13.8-2.6 19.2 0" fill="none" stroke={INK} strokeWidth="0.9" />
    </>
  ),

  /* ── Alert icons. The classic trio, plus the two failure faces. ──────── */

  caution: (
    <>
      <path d="M16 4l13 23H3z" fill={WARN} stroke={INK} strokeWidth="1.4" />
      <path d="M16 7.4L26 25H6z" fill="none" stroke={WHITE} strokeWidth="0.9" opacity="0.7" />
      <path d="M14.8 12h2.4l-0.4 8h-1.6z" fill={INK} />
      <path d="M14.9 22h2.2v2.2h-2.2z" fill={INK} />
    </>
  ),

  stop: (
    <>
      <path d="M11 3h10l8 8v10l-8 8H11l-8-8V11z" fill="#d5544a" stroke={INK} strokeWidth="1.3" />
      <path
        d="M14 24v-6l-1.4-3.6a1.3 1.3 0 0 1 2.4-0.9l1 2.4V9.6a1.3 1.3 0 0 1 2.6 0v4.8a1.3 1.3 0 0 1 2.6 0v9.6z"
        fill={PAPER}
        stroke={INK}
        strokeWidth="1"
      />
    </>
  ),

  note: (
    <>
      <path d="M4 5h24v15H13l-5 5v-5H4z" fill={PAPER} stroke={INK} strokeWidth="1.2" />
      <path d="M18 8v7.6a2.4 2.4 0 1 1-1.6-2.3V9.6l-4 1v6a2.4 2.4 0 1 1-1.6-2.3V9z" fill={INK} />
    </>
  ),

  // Happy Mac. Compact-Mac silhouette, 1-bit face. Load-bearing for the boot.
  happymac: (
    <>
      <path d="M5 3h22v26H5z" fill={FACE} stroke={INK} strokeWidth="1.4" />
      <path d="M6 4h20v2H6z" fill={WHITE} />
      <path d="M8 6h16v13H8z" fill={SCREEN} stroke={INK} strokeWidth="1.2" />
      <circle cx="13" cy="11" r="1.3" fill={INK} />
      <circle cx="19" cy="11" r="1.3" fill={INK} />
      <path d="M12 14.4c1.4 1.8 6.6 1.8 8 0" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9 21.6h9v1.6H9z" fill={SHADE} stroke={INK} strokeWidth="0.7" />
      <path d="M20 21h4v5h-4z" fill={SILVER} stroke={INK} strokeWidth="0.8" />
      <path d="M8 25.4h9v1.4H8z" fill={FACE_DARK} />
    </>
  ),

  // Sad Mac. Same box, X eyes, frown, and the hex code underneath — the actual
  // failure screen's whole content.
  sadmac: (
    <>
      <path d="M5 3h22v26H5z" fill={FACE} stroke={INK} strokeWidth="1.4" />
      <path d="M8 6h16v17H8z" fill="#101010" stroke={INK} strokeWidth="1.2" />
      <path d="M11 9.4l3 3M14 9.4l-3 3M18 9.4l3 3M21 9.4l-3 3" stroke={WHITE} strokeWidth="1.4" />
      <path d="M12 17c1.4-1.8 6.6-1.8 8 0" fill="none" stroke={WHITE} strokeWidth="1.4" strokeLinecap="round" />
      <text x="16" y="21.6" textAnchor="middle" fontFamily="monospace" fontSize="4.4" fill={WHITE}>
        0000000F
      </text>
      <path d="M8 25.4h9v1.4H8z" fill={FACE_DARK} />
      <path d="M20 24.6h4v3h-4z" fill={SILVER} stroke={INK} strokeWidth="0.7" />
    </>
  ),

  // The bomb, with a lit fuse. Only ever shown because the visitor chose Shut
  // Down — see the honesty note in Dialog.tsx.
  bomb: (
    <>
      <circle cx="14.5" cy="19.5" r="9.5" fill="#1b1b1b" stroke={INK} strokeWidth="1" />
      <circle cx="11" cy="16" r="2.6" fill={WHITE} opacity="0.55" />
      <path d="M20 12.6l2.6-2.6h3.2" fill="none" stroke="#7a5a2a" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M21.6 9.6h3.4v2.6h-3.4z" fill="#3f3f42" stroke={INK} strokeWidth="0.7" />
      <path d="M26.6 8.4l1.8-1.8M28 10.2h2.2M26 6.4l0.8-2.2" stroke="#e8a33c" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="26.4" cy="9.4" r="2" fill={WARN} stroke="#c07a1a" strokeWidth="0.8" />
    </>
  ),

  /* ── People and places ───────────────────────────────────────────────── */

  person: (
    <>
      <circle cx="16" cy="11" r="5.6" fill="#f0d2b4" stroke={INK} strokeWidth="1.2" />
      <path d="M5 29c0-6.2 5-9.6 11-9.6S27 22.8 27 29z" fill={FOLDER} stroke={INK} strokeWidth="1.2" />
      <path d="M6.4 27.6h19.2" stroke={WHITE} strokeWidth="0.9" opacity="0.7" />
    </>
  ),

  grad: (
    <>
      <path d="M16 6L2 12l14 6 14-6z" fill="#2f3236" stroke={INK} strokeWidth="1" />
      <path d="M8 15v7c0 2 3.6 3.4 8 3.4s8-1.4 8-3.4v-7l-8 3.4z" fill="#3f4348" stroke={INK} strokeWidth="1" />
      <path d="M28 13v7" stroke={INK} strokeWidth="1.2" />
      <circle cx="28" cy="21" r="1.6" fill={WARN} stroke={INK} strokeWidth="0.7" />
    </>
  ),

  // The Briefcase — a real Mac icon, for PowerBook file syncing.
  briefcase: (
    <>
      <path d="M12 7V5.4h8V7" fill="none" stroke={INK} strokeWidth="1.6" />
      <path d="M3 8h26v18H3z" fill="#8a6a44" stroke={INK} strokeWidth="1.1" />
      <path d="M4 9h24v2H4z" fill="#a8845c" />
      <path d="M3 15.4h26v3.2H3z" fill={FACE} stroke={INK} strokeWidth="0.9" />
      <path d="M14.4 15.4h3.2v3.2h-3.2z" fill={SHADE} stroke={INK} strokeWidth="0.7" />
    </>
  ),
};

const Icon = ({ name, title }: Props) => (
  <svg
    className="mac-icon-svg"
    viewBox="0 0 32 32"
    role={title ? 'img' : 'presentation'}
    aria-hidden={title ? undefined : true}
  >
    {title ? <title>{title}</title> : null}
    {paths[name]}
  </svg>
);

/**
 * The menu-bar mark.
 *
 * READ THE HEADER NOTE BEFORE CHANGING THIS. It is a rounded lozenge carrying
 * the six stripes of the era's colour scheme, and it is deliberately NOT an
 * apple: R3 keeps Apple to one approved sentence of text, and the logo is a
 * trademark this site has no licence to draw. The stripe order is the one the
 * period hardware used, which is enough of a wink on its own.
 *
 * Decorative — the button that wraps it carries the accessible name
 * ("System menu"), so this stays hidden from assistive tech.
 */
export const RainbowMark = () => (
  <svg className="mac-rainbow" viewBox="0 0 14 18" aria-hidden="true" focusable="false">
    {/*
     * The stripes are plain rects with the first and last inset horizontally to
     * fake the lozenge's rounded ends, rather than a <clipPath> or a gradient.
     * Both of those need an id, and this component renders five times on a
     * single screen (menu bar, control strip, boot plaque, About This Macintosh,
     * mobile header) — five identical ids in one document is invalid, and which
     * one a url(#…) reference resolves to is document order rather than
     * anything this component controls.
     */}
    <rect x="1.6" y="0" width="10.8" height="3" fill="#5fb04a" />
    <rect x="0.4" y="3" width="13.2" height="3" fill="#f2c53d" />
    <rect x="0" y="6" width="14" height="3" fill="#e8862e" />
    <rect x="0" y="9" width="14" height="3" fill="#cf4436" />
    <rect x="0.4" y="12" width="13.2" height="3" fill="#8f439b" />
    <rect x="1.6" y="15" width="10.8" height="3" fill="#3a7cc4" />
    <rect x="0.5" y="0.5" width="13" height="17" rx="3.6" ry="3.6" fill="none" stroke="rgba(0,0,0,0.45)" />
  </svg>
);

export default Icon;
