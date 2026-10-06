#!/usr/bin/env bash
# Builds a private APFS clone of this repo so parallel writers never share dist/ or .blume/.
set -euo pipefail
name="${1:?usage: scripts/verify-isolated.sh <name> [docs-folder...]}"
root="$(cd "$(dirname "$0")/.." && pwd)"
dest="/tmp/mtd-verify-$name"
rm -rf "$dest"
mkdir -p "$dest"
for entry in "$root"/* "$root"/.gitignore; do
  base="$(basename "$entry")"
  case "$base" in dist|goals) continue ;; esac
  cp -cR "$entry" "$dest/" 2>/dev/null || cp -R "$entry" "$dest/"
done
cd "$dest"
shift
if [ "$#" -gt 0 ]; then
  for d in docs/*/; do
    keep=0
    for k in "$@"; do [ "docs/$k/" = "$d" ] && keep=1; done
    [ "$keep" = 1 ] || rm -rf "$d"
  done
fi
npx blume build
