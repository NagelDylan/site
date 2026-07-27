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
# The source is a 1024x1024 cartoon avatar. A face carries almost no signal at
# 16px, so the small sizes get a tighter centre crop (more head, less
# background) while the large sizes keep the full composition.
sips -c 760 760 "$SRC/favicon.png" --out /tmp/favicon-crop.png >/dev/null
for s in 16 32 48; do
  sips -z $s $s /tmp/favicon-crop.png --out "$OUT/favicon-$s.png" >/dev/null
done
sips -z 180 180 "$SRC/favicon.png" --out "$OUT/apple-touch-icon.png" >/dev/null
sips -z 512 512 "$SRC/favicon.png" --out "$OUT/favicon-512.png" >/dev/null
node scripts/make-ico.mjs "$OUT/favicon.ico" \
  "$OUT/favicon-16.png" "$OUT/favicon-32.png" "$OUT/favicon-48.png"
rm -f /tmp/favicon-crop.png "$OUT/favicon-48.png"

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
sips -Z 800 --setProperty formatOptions 72 "$SRC/me.jpeg" --out /tmp/me-800.jpeg >/dev/null
cwebp -q 80 /tmp/me-800.jpeg -o "$OUT/media/me.webp" 2>/dev/null
sips -Z 400 --setProperty formatOptions 72 "$SRC/me.jpeg" --out /tmp/me-400.jpeg >/dev/null
cwebp -q 78 /tmp/me-400.jpeg -o "$OUT/media/me-small.webp" 2>/dev/null
# JPEG fallback for the print stylesheet (G15) and any no-WebP context.
cp /tmp/me-800.jpeg "$OUT/media/me.jpeg"
rm -f /tmp/me-800.jpeg /tmp/me-400.jpeg

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
