#!/usr/bin/env bash
#
# Rasterizes the social preview card from assets-src/og-paper.svg.
#
# Uses `sips`, which rasterizes SVG directly. There is no browser in this
# environment to screenshot the real paper route with, and no npm rasterizer is
# installed. macOS-only — which is why public/og/paper.png is COMMITTED to the
# repo rather than generated at deploy time; Cloudflare's Linux build image has
# no sips. Re-run locally whenever the card changes.
#
# Usage: bash scripts/make-og.sh
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p public/og

sips -s format png assets-src/og-paper.svg --out public/og/paper.png >/dev/null
# Pin the exact Open Graph size in case the SVG viewBox ever changes.
sips -z 630 1200 public/og/paper.png --out public/og/paper.png >/dev/null

printf 'public/og/paper.png  %s  ' "$(sips -g pixelWidth -g pixelHeight public/og/paper.png | tail -2 | tr -d ' \n')"
ls -l public/og/paper.png | awk '{printf "%d KB\n", $5/1024}'
