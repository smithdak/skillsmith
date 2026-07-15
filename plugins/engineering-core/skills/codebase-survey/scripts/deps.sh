#!/bin/sh
# intent: enumerate dependency manifests and per-manifest dependency counts.
# Read-only; no network; no package-manager invocation.
set -eu
ROOT="${1:-.}"
cd "$ROOT"
found=0
for manifest in $(find . -maxdepth 3 -not -path '*/node_modules/*' -not -path '*/.git/*' \
  \( -name package.json -o -name Cargo.toml -o -name go.mod -o -name pyproject.toml \
     -o -name requirements.txt -o -name Gemfile -o -name pom.xml -o -name build.gradle \) 2>/dev/null); do
  found=1
  echo "== $manifest =="
  case "$manifest" in
    *package.json)
      # count keys inside dependencies blocks without jq
      grep -c '":' "$manifest" >/dev/null 2>&1 || true
      for section in dependencies devDependencies peerDependencies; do
        n=$(sed -n "/\"$section\"/,/}/p" "$manifest" | grep -c '":' || true)
        [ "$n" -gt 1 ] && echo "  $section: $((n - 1))"
      done
      ;;
    *go.mod)
      echo "  require: $(grep -cE '^\s+\S+ v' "$manifest" || true)"
      ;;
    *Cargo.toml)
      echo "  [dependencies] entries: $(sed -n '/\[dependencies\]/,/^\[/p' "$manifest" | grep -c '=' || true)"
      ;;
    *requirements.txt)
      echo "  entries: $(grep -cvE '^\s*(#|$)' "$manifest" || true)"
      ;;
    *)
      echo "  (present — inspect manually)"
      ;;
  esac
done
[ "$found" -eq 0 ] && echo "no dependency manifests found (maxdepth 3)"
exit 0
