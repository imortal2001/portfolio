#!/bin/sh
# Converts raw captures into optimised WebP files in public/images. Run from Portfolio/.
set -e
OUT=public/images
mkdir -p "$OUT"
w() { cwebp -quiet -q "${4:-80}" -resize "$2" 0 "$1" -o "$OUT/$3.webp"; }
ISLA=../IslaLola/store
for n in farm talk caught cook fiesta memory plaza; do w "$ISLA/raw/$n.png" 780 isla-$n; done
w "$ISLA/feature-graphic.png" 1024 isla-feature 85
w raw/kusina-landing.png 780 kusina-landing
w raw/kusina-menu.png 780 kusina-menu
w raw/kusina-desktop.png 1440 kusina-desktop
w raw/jammr-chat.png 1440 jammr-chat
w raw/jammr-chat-mobile.png 780 jammr-mobile
w raw/adrift-0.png 1440 adrift-ocean
w raw/adrift.png 1440 adrift-title
ls -la "$OUT"
