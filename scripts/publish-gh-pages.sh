#!/usr/bin/env bash
# Build the site and publish dist/ to the gh-pages branch (no Actions workflow needed).
#   scripts/publish-gh-pages.sh project   -> https://pedro-de-bastos.github.io/personal-website/
#   scripts/publish-gh-pages.sh domain    -> https://pedromdb.me/ (adds CNAME; set DNS first)
# Domain mode also sets the Pages custom domain via the GitHub API (needs `gh` auth).
set -euo pipefail
MODE="${1:-project}"
DOMAIN="${DOMAIN:-$(cat "$(dirname "$0")/../deploy/CNAME")}"
REPO="${REPO:-pedro-de-bastos/personal-website}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
export ASTRO_TELEMETRY_DISABLED=1
case "$MODE" in
  project) export BASE_PATH=/personal-website SITE_URL=https://pedro-de-bastos.github.io; VERIFY_BASE=/personal-website/ ;;
  domain)  export BASE_PATH=/ SITE_URL="https://$DOMAIN"; VERIFY_BASE=/ ;;
  *) echo "usage: $0 project|domain" >&2; exit 2 ;;
esac
npm run build
node scripts/verify-site.mjs --base "$VERIFY_BASE" --site "$SITE_URL"
touch dist/.nojekyll
if [ "$MODE" = domain ]; then echo "$DOMAIN" > dist/CNAME; else rm -f dist/CNAME; fi
SRC_SHA="$(git rev-parse --short HEAD)"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
URL="$(git remote get-url origin)"
if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
  git clone -q --depth 1 --branch gh-pages "$URL" "$TMP/site"
else
  git init -q -b gh-pages "$TMP/site"; git -C "$TMP/site" remote add origin "$URL"
fi
find "$TMP/site" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -a dist/. "$TMP/site/"
cd "$TMP/site"; git add -A
if git diff --cached --quiet; then echo "gh-pages already up to date"; else
  git -c user.name="Pedro de Bastos" -c user.email="pedro-de-bastos@users.noreply.github.com" commit -qm "deploy($MODE): build of $SRC_SHA"
  git push -q origin gh-pages
fi
if [ "$MODE" = domain ]; then
  gh api -X PUT "repos/$REPO/pages" -f cname="$DOMAIN" -f "source[branch]=gh-pages" -f "source[path]=/"
  echo "Custom domain set. Once the certificate is issued, enable HTTPS with:"
  echo "  gh api -X PUT repos/$REPO/pages -F https_enforced=true"
fi
echo "Published ($MODE)."
