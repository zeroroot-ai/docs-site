#!/bin/sh
# Substitute the build-time origin sentinels with this environment's origins
# (docs-site#19, epic env-derived-links).
#
# The build rewrites functional cross-surface link hrefs into
# __APP_ORIGIN__ / __WWW_ORIGIN__ (scripts/rehype-env-origin-links.mjs), so
# one image serves every environment: the deploy chart sets APP_ORIGIN /
# WWW_ORIGIN per environment (derived from global.domain). Before nginx
# starts (the stock entrypoint runs /docker-entrypoint.d/*.sh first), this
# script copies the export from /opt/docs-site/html, which it never writes,
# into /usr/share/nginx/html, and rewrites the copy. So the container runs
# with a read-only root filesystem, given an emptyDir at /usr/share/nginx/html
# (docs-site#79). No env means prod: a bare `docker run` of this image serves
# the production links.
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

src_root=/opt/docs-site/html
html_root=/usr/share/nginx/html

# Start from a clean copy, so a container restart with a kept emptyDir
# substitutes from the export again and never from an earlier result.
find "$html_root" -mindepth 1 -delete
cp -R "$src_root"/. "$html_root"/

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
