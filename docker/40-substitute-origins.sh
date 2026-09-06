#!/bin/sh
# Substitute the build-time origin sentinels with this environment's origins
# (docs-site#19, epic env-derived-links).
#
# The build rewrites functional cross-surface link hrefs into
# __APP_ORIGIN__ / __WWW_ORIGIN__ (scripts/rehype-env-origin-links.mjs), so
# one image serves every environment: the deploy chart sets APP_ORIGIN /
# WWW_ORIGIN per environment (derived from global.domain) and this script
# rewrites the exported files once, before nginx starts (the stock
# entrypoint runs /docker-entrypoint.d/*.sh first). No env means prod — a
# bare `docker run` of this image serves the production links.
#
# .txt is included deliberately: Next's static export writes the RSC
# payload alongside each page's .html, and the hrefs appear in both.
#
# Fails the container start if any sentinel survives, so a broken
# substitution shows up as a red startup probe, never as silently-wrong
# links.
set -eu

: "${APP_ORIGIN:=https://app.zeroroot.ai}"
: "${WWW_ORIGIN:=https://www.zeroroot.ai}"

html_root=/usr/share/nginx/html

find "$html_root" -type f \
  \( -name '*.html' -o -name '*.js' -o -name '*.css' -o -name '*.json' -o -name '*.txt' -o -name '*.xml' \) \
  -exec sed -i \
    -e "s|__APP_ORIGIN__|${APP_ORIGIN}|g" \
    -e "s|__WWW_ORIGIN__|${WWW_ORIGIN}|g" {} +

leftovers="$(grep -rl -e '__APP_ORIGIN__' -e '__WWW_ORIGIN__' "$html_root" || true)"
if [ -n "$leftovers" ]; then
  echo "40-substitute-origins: origin sentinels survived substitution in:" >&2
  echo "$leftovers" >&2
  exit 1
fi

echo "40-substitute-origins: APP_ORIGIN=${APP_ORIGIN} WWW_ORIGIN=${WWW_ORIGIN}"
