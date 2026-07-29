/**
 * The Control Strip (spec §4.5) — the always-visible tray in the bottom-left
 * corner, and this theme's G8 guarantee.
 *
 * WHAT IT READS: nothing from the fact layer. It is pure chrome, so no hard rule
 * about copy applies to it beyond keeping the voice calm.
 *
 * WHY IT EXISTS: G8 says the theme switcher and the mode toggle must be reachable
 * by keyboard *without opening a menu*, and §2 says nobody may be trapped in a
 * theme. The menu bar satisfies the "reachable" half; this strip satisfies the
 * "without opening anything" half, exactly as the Y2K system tray does. Every
 * module is a real `<button>` in the tab order.
 *
 * It is anchored bottom-left, which on this desktop is empty: the Stickies note is
 * pinned top-left and the icon column runs down the right-hand side, so the strip
 * covers nothing that carries information. It must also sit above the desktop but
 * below any open menu — that is a z-index contract documented in mac/_foundation.css.
 *
 * Collapsing: clicking the grab tab at the strip's end folds it away, which is what
 * the real Control Strip did. The modules are unmounted rather than merely hidden,
 * because a button nobody can see should not still be in the tab order. G8 still
 * holds — the strip is pulled out by default, collapsing is a deliberate act by the
 * visitor, and the System menu carries the switcher too.
 */
import { useState } from "react";
import { returnToChooser } from "../../lib/theme";
import { RainbowMark } from "./Icon";
import type { WindowKind } from "./wm";

type Props = {
  mode: "light" | "dark";
  onToggleMode: () => void;
  onOpen: (kind: WindowKind) => void;
  balloons: boolean;
  onToggleBalloons: () => void;
};

/**
 * Control Strip glyphs are drawn here rather than in `Icon.tsx` on purpose: that
 * file is the 32×32 desktop icon set, and these are 14px chrome marks that would
 * be unrecognisable at icon size and wrong at icon detail. Flat 1-bit shapes,
 * `currentColor` so they follow the light and graphite appearances for free.
 */
const glyph = {
  viewBox: "0 0 16 16",
  className: "mac-strip-glyph",
  "aria-hidden": true,
} as const;

const SunGlyph = () => (
  <svg {...glyph}>
    <circle cx="8" cy="8" r="3.2" fill="currentColor" />
    <path
      d="M8 1v2.2M8 12.8V15M1 8h2.2M12.8 8H15M3.1 3.1l1.5 1.5M11.4 11.4l1.5 1.5M12.9 3.1l-1.5 1.5M4.6 11.4l-1.5 1.5"
      stroke="currentColor"
      strokeWidth="1.4"
    />
  </svg>
);

const MoonGlyph = () => (
  <svg {...glyph}>
    <path
      d="M10.4 1.6a6.4 6.4 0 1 0 4 12 7.4 7.4 0 0 1-4-12z"
      fill="currentColor"
    />
  </svg>
);

const SpeakerGlyph = () => (
  <svg {...glyph}>
    <path d="M2 6h2.5L8 2.8v10.4L4.5 10H2z" fill="currentColor" />
    <path
      d="M10.2 5.4a3.6 3.6 0 0 1 0 5.2M12.4 3.4a6.6 6.6 0 0 1 0 9.2"
      stroke="currentColor"
      strokeWidth="1.3"
      fill="none"
    />
  </svg>
);

const BalloonGlyph = () => (
  <svg {...glyph}>
    <path
      d="M2 2.6h12v7.2H8.6l-2.8 3v-3H2z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <path
      d="M4.6 5.4h6.8M4.6 7.6h4.4"
      stroke="currentColor"
      strokeWidth="1.2"
    />
  </svg>
);

const HomeGlyph = () => (
  <svg {...glyph}>
    <path
      d="M8 1.8 15 8h-2.4v6.2H3.4V8H1z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <path
      d="M6.4 14.2V9.6h3.2v4.6"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="none"
    />
  </svg>
);

const ControlStrip = ({
  mode,
  onToggleMode,
  onOpen,
  balloons,
  onToggleBalloons,
}: Props) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="mac-strip"
      data-chrome
      data-collapsed={collapsed || undefined}
    >
      {collapsed ? null : (
        <div className="mac-strip-modules">
          <button
            type="button"
            className="mac-strip-btn"
            title={mode === "dark" ? "Light appearance" : "Graphite appearance"}
            aria-label={
              mode === "dark"
                ? "Switch to the light appearance"
                : "Switch to the graphite appearance"
            }
            data-balloon="The Appearance module switches between the light Platinum look and the darker graphite one."
            onClick={onToggleMode}
          >
            {mode === "dark" ? <SunGlyph /> : <MoonGlyph />}
          </button>

          <button
            type="button"
            className="mac-strip-btn"
            title="Open the Chooser"
            aria-label="Open the Chooser to change theme"
            data-balloon="The Chooser lists the ways this site can look. The facts are the same in all of them."
            onClick={() => onOpen("chooser")}
          >
            <RainbowMark />
          </button>

          <button
            type="button"
            className="mac-strip-btn"
            title="Open QuickTime Player"
            aria-label="Open QuickTime Player"
            data-balloon="Opens the player. It holds a netlabel collection from about the year this desktop is dressed as."
            onClick={() => onOpen("quicktime")}
          >
            <SpeakerGlyph />
          </button>

          <button
            type="button"
            className="mac-strip-btn"
            title={balloons ? "Hide Balloons" : "Show Balloons"}
            aria-label={balloons ? "Hide Balloon Help" : "Show Balloon Help"}
            aria-pressed={balloons}
            data-balloon="Balloon Help is on. Rest the pointer on anything and a note like this one appears."
            onClick={onToggleBalloons}
          >
            <BalloonGlyph />
          </button>

          <button
            type="button"
            className="mac-strip-btn"
            title="Back to the chooser"
            aria-label="Back to the theme chooser"
            data-balloon="Returns to the opening screen, where you first chose how this site should look."
            onClick={returnToChooser}
          >
            <HomeGlyph />
          </button>
        </div>
      )}

      {/*
        The grab tab. On a real Control Strip this is the ribbed end you drag; here a
        click is enough, because a drag target this small is unkind on a trackpad and
        unusable with a keyboard.
      */}
      <button
        type="button"
        className="mac-strip-grip"
        aria-expanded={!collapsed}
        aria-label={
          collapsed ? "Show the Control Strip" : "Hide the Control Strip"
        }
        title={collapsed ? "Show the Control Strip" : "Hide the Control Strip"}
        data-balloon="Click the tab to fold the Control Strip away, and again to bring it back."
        onClick={() => setCollapsed((value) => !value)}
      >
        <span
          className="mac-strip-grip-lines"
          aria-hidden="true"
          data-decorative
        />
      </button>
    </div>
  );
};

export default ControlStrip;
