/**
 * Icon set, drawn as inline SVG.
 *
 * Hand-drawn rather than sourced: none of the era's icons could be licensed.
 * Deliberately chunky and 16-colour-ish. No Apple logo here — trademark.
 */

export type IconName =
  | 'folder'
  | 'folderOpen'
  | 'file'
  | 'doc'
  | 'briefcase'
  | 'person'
  | 'gear'
  | 'grad'
  | 'mail'
  | 'book'
  | 'trash'
  | 'cd'
  | 'pc'
  | 'help'
  | 'globe'
  | 'floppy'
  | 'palette'
  | 'warn'
  | 'info'
  | 'flag'
  | 'star';

type Props = { name: IconName; title?: string };

const paths: Record<IconName, React.ReactNode> = {
  folder: (
    <>
      <path d="M3 8h9l2 3h15v16H3z" fill="#e8c33c" stroke="#5a4400" strokeWidth="1.5" />
      <path d="M5 14h22v11H5z" fill="#f5dc7a" stroke="#5a4400" strokeWidth="1" />
    </>
  ),
  folderOpen: (
    <>
      <path d="M3 9h10l2 3h14v15H3z" fill="#c8a52a" stroke="#5a4400" strokeWidth="1.5" />
      <path d="M7 14h24l-4 13H3z" fill="#f5dc7a" stroke="#5a4400" strokeWidth="1.2" />
    </>
  ),
  file: (
    <>
      <path d="M7 3h13l6 6v20H7z" fill="#fff" stroke="#333" strokeWidth="1.5" />
      <path d="M20 3v6h6" fill="#ccc" stroke="#333" strokeWidth="1.2" />
      <path d="M11 15h13M11 19h13M11 23h9" stroke="#7a7a7a" strokeWidth="1.4" />
    </>
  ),
  doc: (
    <>
      <path d="M6 3h14l6 6v20H6z" fill="#fdfdfd" stroke="#222" strokeWidth="1.5" />
      <path d="M20 3v6h6" fill="#d0d0d0" stroke="#222" strokeWidth="1.2" />
      <path d="M10 14h14M10 18h14M10 22h14M10 26h8" stroke="#1a4fa0" strokeWidth="1.4" />
    </>
  ),
  briefcase: (
    <>
      <path d="M11 7V5h10v2" fill="none" stroke="#3a2a12" strokeWidth="2" />
      <path d="M3 8h26v18H3z" fill="#8a5a24" stroke="#3a2a12" strokeWidth="1.5" />
      <path d="M3 15h26v3H3z" fill="#f0d089" stroke="#3a2a12" strokeWidth="1" />
    </>
  ),
  person: (
    <>
      <circle cx="16" cy="11" r="6" fill="#f2c9a0" stroke="#5a3a1a" strokeWidth="1.5" />
      <path d="M4 29c0-6.5 5.4-10 12-10s12 3.5 12 10z" fill="#2a6ec0" stroke="#123a70" strokeWidth="1.5" />
    </>
  ),
  gear: (
    <>
      <path
        d="M16 3l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H9v-4l-3-3 3-3V6h4z"
        fill="#c8c8c8"
        stroke="#444"
        strokeWidth="1.5"
      />
      <circle cx="16" cy="16" r="4" fill="#6a6a6a" stroke="#222" strokeWidth="1.2" />
      <path d="M4 26h24v4H4z" fill="#9a9a9a" stroke="#444" strokeWidth="1.2" />
    </>
  ),
  grad: (
    <>
      <path d="M16 5L2 12l14 7 14-7z" fill="#1a1a3a" stroke="#000" strokeWidth="1.4" />
      <path d="M8 15v7c0 2 4 4 8 4s8-2 8-4v-7" fill="#2a2a5a" stroke="#000" strokeWidth="1.4" />
      <path d="M28 12v10" stroke="#e8c33c" strokeWidth="2" />
    </>
  ),
  mail: (
    <>
      <path d="M2 8h28v17H2z" fill="#fff" stroke="#333" strokeWidth="1.5" />
      <path d="M2 8l14 10L30 8" fill="none" stroke="#2a6ec0" strokeWidth="1.8" />
    </>
  ),
  book: (
    <>
      <path d="M4 5h11v23H4z" fill="#c0392b" stroke="#4a120c" strokeWidth="1.5" />
      <path d="M17 5h11v23H17z" fill="#e05a4a" stroke="#4a120c" strokeWidth="1.5" />
      <path d="M15 5h2v23h-2z" fill="#7a1a10" />
    </>
  ),
  trash: (
    <>
      <path d="M8 9h16l-2 20H10z" fill="#a8a8b0" stroke="#33333a" strokeWidth="1.5" />
      <path d="M6 6h20v3H6z" fill="#c8c8d0" stroke="#33333a" strokeWidth="1.4" />
      <path d="M14 13v13M18 13v13" stroke="#5a5a62" strokeWidth="1.4" />
    </>
  ),
  cd: (
    <>
      <circle cx="16" cy="16" r="13" fill="#c8d8e8" stroke="#33445a" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="4" fill="#fff" stroke="#33445a" strokeWidth="1.2" />
      <path d="M16 3a13 13 0 0 1 11 7" fill="none" stroke="#ff00a0" strokeWidth="2.4" />
      <path d="M5 20a13 13 0 0 0 11 9" fill="none" stroke="#00c0ff" strokeWidth="2.4" />
    </>
  ),
  pc: (
    <>
      <path d="M3 5h26v17H3z" fill="#c8c8c0" stroke="#333" strokeWidth="1.5" />
      <path d="M6 8h20v11H6z" fill="#1a6a8a" stroke="#111" strokeWidth="1.2" />
      <path d="M11 25h10v4H11z" fill="#a8a8a0" stroke="#333" strokeWidth="1.2" />
      <path d="M6 29h20" stroke="#555" strokeWidth="2" />
    </>
  ),
  help: (
    <>
      <circle cx="16" cy="16" r="13" fill="#f0e14a" stroke="#6a5a00" strokeWidth="1.5" />
      <text
        x="16"
        y="23"
        textAnchor="middle"
        fontSize="18"
        fontFamily="Tahoma, sans-serif"
        fontWeight="700"
        fill="#3a3200"
      >
        ?
      </text>
    </>
  ),
  globe: (
    <>
      <circle cx="16" cy="16" r="13" fill="#2a8ed0" stroke="#0a3a60" strokeWidth="1.5" />
      <path d="M3 16h26M16 3c5 5 5 21 0 26M16 3c-5 5-5 21 0 26" fill="none" stroke="#d8f0ff" strokeWidth="1.3" />
    </>
  ),
  floppy: (
    <>
      <path d="M4 4h24v24H4z" fill="#33333a" stroke="#111" strokeWidth="1.4" />
      <path d="M10 4h12v10H10z" fill="#c8c8d0" stroke="#111" strokeWidth="1.2" />
      <path d="M9 19h14v9H9z" fill="#e8e8ee" stroke="#111" strokeWidth="1.2" />
    </>
  ),
  palette: (
    <>
      <path
        d="M16 4c7 0 12 4.5 12 10 0 4-3 5-5 5h-3c-2 0-2 3 0 4 1 1 0 3-2 3C10 26 4 22 4 15 4 8.5 9 4 16 4z"
        fill="#f0e8d8"
        stroke="#5a4a2a"
        strokeWidth="1.5"
      />
      <circle cx="11" cy="11" r="2.2" fill="#e02020" />
      <circle cx="17" cy="9" r="2.2" fill="#2060e0" />
      <circle cx="22" cy="13" r="2.2" fill="#20c020" />
      <circle cx="10" cy="18" r="2.2" fill="#f0c020" />
    </>
  ),
  warn: (
    <>
      <path d="M16 3l14 25H2z" fill="#f0d020" stroke="#5a4a00" strokeWidth="1.5" />
      <path d="M16 11v9" stroke="#3a2f00" strokeWidth="3" />
      <circle cx="16" cy="24" r="1.7" fill="#3a2f00" />
    </>
  ),
  info: (
    <>
      <circle cx="16" cy="16" r="13" fill="#fff" stroke="#1a4fa0" strokeWidth="2" />
      <path d="M16 14v10" stroke="#1a4fa0" strokeWidth="3.4" />
      <circle cx="16" cy="9" r="2" fill="#1a4fa0" />
    </>
  ),
  flag: (
    <>
      <path d="M3 6h12v10H3z" fill="#e04040" />
      <path d="M17 6h12v10H17z" fill="#4a9a4a" />
      <path d="M3 18h12v10H3z" fill="#3a7ad0" />
      <path d="M17 18h12v10H17z" fill="#e0c030" />
    </>
  ),
  star: (
    <path
      d="M16 3l4 9 10 1-7.5 6.5L25 29l-9-5-9 5 2.5-9.5L2 13l10-1z"
      fill="#ffe14a"
      stroke="#7a5a00"
      strokeWidth="1.4"
    />
  ),
};

const Icon = ({ name, title }: Props) => (
  <svg viewBox="0 0 32 32" role={title ? 'img' : 'presentation'} aria-hidden={title ? undefined : true}>
    {title ? <title>{title}</title> : null}
    {paths[name]}
  </svg>
);

/** The Clippy stand-in: a paperclip who is trying his best. */
export const ClippyFigure = () => (
  <svg viewBox="0 0 58 62" aria-hidden="true" width="58" height="62">
    <ellipse cx="29" cy="58" rx="17" ry="3.5" fill="rgba(0,0,0,0.28)" />
    <path
      d="M20 50V20a9 9 0 0 1 18 0v26a5.5 5.5 0 0 1-11 0V24a2.6 2.6 0 0 1 5.2 0v20"
      fill="none"
      stroke="#b8c4d4"
      strokeWidth="5.5"
      strokeLinecap="round"
    />
    <path
      d="M20 50V20a9 9 0 0 1 18 0v26a5.5 5.5 0 0 1-11 0V24a2.6 2.6 0 0 1 5.2 0v20"
      fill="none"
      stroke="#7e8da3"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <circle cx="24" cy="21" r="6" fill="#fff" stroke="#333" strokeWidth="1.3" />
    <circle cx="36" cy="21" r="6" fill="#fff" stroke="#333" strokeWidth="1.3" />
    <circle cx="25.6" cy="22" r="2.6" fill="#1a1a1a" />
    <circle cx="34.4" cy="22" r="2.6" fill="#1a1a1a" />
    <path d="M17 12l7 4M43 12l-7 4" stroke="#4a4a4a" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** Start-button flag, four panes, drawn rather than borrowed. */
export const StartFlag = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <path d="M2 8l13-4v11L2 16z" fill="#e04040" />
    <path d="M17 3.4l13-3.4v14l-13 1z" fill="#4a9a4a" />
    <path d="M2 18l13 1v11L2 27z" fill="#3a7ad0" />
    <path d="M17 19.2l13 1v11.2l-13-3z" fill="#e0c030" />
  </svg>
);

export default Icon;
