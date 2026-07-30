#!/usr/bin/env bash
#
# Rasterizes the social preview card from assets-src/og.svg.
#
# macOS-only: `sips` is what rasterizes the SVG, and Cloudflare's Linux build
# image has no sips — which is why public/og/card.png is committed rather than
# built at deploy time. Re-run this locally whenever the card changes.
#
# Usage: bash scripts/make-og.sh
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p public/og

sips -s format png assets-src/og.svg --out public/og/card.png >/dev/null
# Pin the exact Open Graph size in case the SVG viewBox ever changes.
sips -z 630 1200 public/og/card.png --out public/og/card.png >/dev/null

printf 'public/og/card.png  %s  ' "$(sips -g pixelWidth -g pixelHeight public/og/card.png | tail -2 | tr -d ' \n')"
ls -l public/og/card.png | awk '{printf "%d KB\n", $5/1024}'
