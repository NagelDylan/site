#!/usr/bin/env bash
#
# Regenerates every shipped asset in public/ from the pristine originals in
# assets-src/. Uses only tooling that ships with macOS plus Homebrew's `webp`
# formula (gif2webp / webpmux / cwebp) — no npm, no ffmpeg.
#
# assets-src/ holds the ONLY copies of these files. github.com is off the
# sandbox allowlist, so they cannot be re-fetched. Never delete that directory.
#
# Usage: bash scripts/optimize-assets.sh
set -euo pipefail

cd "$(dirname "$0")/.."
SRC="assets-src"
OUT="public"
mkdir -p "$OUT/media"

need() { command -v "$1" >/dev/null || { echo "missing tool: $1" >&2; exit 1; }; }
need sips; need cwebp; need gif2webp; need webpmux; need node

echo "==> favicon set"
# The source is a 1024x1024 transparent PNG already composed as an icon: one
# centred circular badge, the three themes split across the face. There is no
# per-size framing — the badge sits inside ~190px of empty glow margin, so it is
# trimmed to 700x700 ONCE and every size is that same square scaled down. The
# 16px tab icon and the 512px install icon therefore read identically.
sips -c 700 700 "$SRC/favicon.png" --out /tmp/favicon-trim.png >/dev/null
for s in 16 32 48 180 512; do
  sips -z $s $s /tmp/favicon-trim.png --out "$OUT/favicon-$s.png" >/dev/null
done
mv "$OUT/favicon-180.png" "$OUT/apple-touch-icon.png"
node scripts/make-ico.mjs "$OUT/favicon.ico" \
  "$OUT/favicon-16.png" "$OUT/favicon-32.png" "$OUT/favicon-48.png"
rm -f /tmp/favicon-trim.png "$OUT/favicon-48.png"

echo "==> project media (animated GIF -> animated WebP + static poster)"
# -mixed lets the encoder pick lossy or lossless per frame, which is a big win
# on screen recordings that mix flat UI with motion. tanks is 250 frames of
# dense gameplay motion, so it gets full lossy instead.
#
# These stay large-ish (tanks lands near 1 MB). Frame-count reduction is not
# safely possible with the tooling available — animated WebP frames are partial
# rects with blend/dispose flags, so dropping every other frame corrupts the
# incremental ones, and neither gifsicle nor anim_dump is installed. The size is
# handled in the UI instead: every consumer renders the *-poster.webp still and
# only fetches the animation on intent (see MotionMedia), so the initial page
# cost is the poster alone.
encode() { # name, extra flags
  local name="$1"; shift
  gif2webp "$@" -m 6 -min_size "$SRC/$name.gif" -o "$OUT/media/$name.webp" 2>/dev/null
}
encode tanks -lossy -q 45
encode acronymize -mixed -q 62
encode flowsense -mixed -q 62
for name in tanks acronymize flowsense; do
  # Frame 1 doubles as the prefers-reduced-motion still and the <img> poster.
  webpmux -get frame 1 "$OUT/media/$name.webp" -o /tmp/$name-f1.webp >/dev/null
  cwebp -q 78 /tmp/$name-f1.webp -o "$OUT/media/$name-poster.webp" 2>/dev/null
  rm -f /tmp/$name-f1.webp
done

echo "==> photo + logos"
#
# One portrait per theme (§8/G9: the themes share facts, not presentation — and
# that now extends to the artwork). Sources are 1254px PNGs at 1.2–3.3 MB, which
# is absurd for an avatar, so each is emitted at two sizes as WebP.
#
#   me-paper  risograph halftone portrait   → paper theme, and the canonical
#                                             image for OG / structured data
#   me-y2k    pixel-art portrait            → Y2K theme
#   me-chat   flat vector portrait          → chat theme avatar
#
# -z on the *large* size only: 800px is more than any layout asks for, and the
# small cut is what the home polaroid and the Y2K windows actually render.
for theme in paper y2k chat; do
  src="$SRC/me-$theme.png"
  [ -f "$src" ] || { echo "missing $src" >&2; exit 1; }
  if [ "$theme" = 'y2k' ]; then
    #
    # Pixel art is a special case twice over.
    #
    # It must not be resampled smoothly or encoded lossily — either one blurs the
    # deliberate hard pixel edges into mush. But lossless WebP of a 1254px
    # dithered halftone is 450 KB, which is absurd for an avatar.
    #
    # The resolution is fake: the source is a small pixel grid blown up, so
    # nothing is lost by storing it small and letting CSS scale it back up with
    # `image-rendering: pixelated` (see .y2k-portrait). 256px lossless is 66 KB
    # and renders identically to the 1254px original once upscaled.
    #
    sips -Z 256 "$src" --out /tmp/me-y2k-lg.png >/dev/null
    sips -Z 160 "$src" --out /tmp/me-y2k-sm.png >/dev/null
    cwebp -lossless -q 90 /tmp/me-y2k-lg.png -o "$OUT/media/me-y2k.webp" 2>/dev/null
    cwebp -lossless -q 90 /tmp/me-y2k-sm.png -o "$OUT/media/me-y2k-small.webp" 2>/dev/null
    rm -f /tmp/me-y2k-lg.png /tmp/me-y2k-sm.png
  else
    sips -Z 800 "$src" --out /tmp/me-$theme-800.png >/dev/null
    sips -Z 400 "$src" --out /tmp/me-$theme-400.png >/dev/null
    cwebp -q 82 /tmp/me-$theme-800.png -o "$OUT/media/me-$theme.webp" 2>/dev/null
    cwebp -q 80 /tmp/me-$theme-400.png -o "$OUT/media/me-$theme-small.webp" 2>/dev/null
    rm -f /tmp/me-$theme-800.png /tmp/me-$theme-400.png
  fi
done

# JPEG fallback for the print stylesheet (G15) and any no-WebP context. Taken
# from the paper portrait, which is the canonical one. The riso halftone is very
# noisy, so it needs a lower quality and a smaller box than a photograph would to
# stay a sane size.
sips -Z 700 -s format jpeg --setProperty formatOptions 45 "$SRC/me-paper.png" --out "$OUT/media/me.jpeg" >/dev/null

sips -Z 240 "$SRC/whitby-medical-logo.png" --out /tmp/whitby.png >/dev/null
cwebp -q 85 /tmp/whitby.png -o "$OUT/media/whitby-medical-logo.webp" 2>/dev/null
rm -f /tmp/whitby.png
cwebp -q 88 "$SRC/carta.png" -o "$OUT/media/carta.webp" 2>/dev/null
cp "$SRC/empathia_icon.webp" "$OUT/media/empathia.webp"

echo
echo "==> results"
before=$(du -sk "$SRC" | cut -f1)
after=$(du -sk "$OUT" | cut -f1)
printf 'originals: %s KB\nshipped:   %s KB\n' "$before" "$after"
ls -la "$OUT"/media "$OUT"/*.png "$OUT"/*.ico
