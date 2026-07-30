#!/usr/bin/env bash
#
# Regenerates every shipped asset in public/ from the pristine originals in
# assets-src/. Uses only tooling that ships with macOS plus Homebrew's `webp`
# formula (gif2webp / webpmux / cwebp) — no npm, no ffmpeg.
#
# assets-src/ holds the only copies of the source art. Do not delete it.
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
# centred circular badge inside ~190px of empty glow margin. It is trimmed to
# 700x700 once and every size is that same square scaled down, so the 16px tab
# icon and the 512px install icon read identically.
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

echo "==> portrait + logos"
#
# The portrait is pixel art, which must not be resampled smoothly or encoded
# lossily — either one blurs the hard pixel edges into mush. But lossless WebP of
# the 1254px source is 450 KB, which is absurd for an avatar.
#
# The resolution is fake anyway: the source is a small pixel grid blown up, so
# nothing is lost by storing it small and letting CSS scale it back up with
# `image-rendering: pixelated` (see .y2k-portrait). 256px lossless is 66 KB and
# renders identically to the original once upscaled.
#
sips -Z 256 "$SRC/me-y2k.png" --out /tmp/me-y2k-lg.png >/dev/null
sips -Z 160 "$SRC/me-y2k.png" --out /tmp/me-y2k-sm.png >/dev/null
cwebp -lossless -q 90 /tmp/me-y2k-lg.png -o "$OUT/media/me-y2k.webp" 2>/dev/null
cwebp -lossless -q 90 /tmp/me-y2k-sm.png -o "$OUT/media/me-y2k-small.webp" 2>/dev/null
rm -f /tmp/me-y2k-lg.png /tmp/me-y2k-sm.png

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
