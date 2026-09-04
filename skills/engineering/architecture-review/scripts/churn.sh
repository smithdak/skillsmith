#!/bin/sh
# intent: rank files and top-level directories by git change frequency, so
# volatility can be checked against the dependency graph.
#
# usage: churn.sh [dir] [--since <git date>]
#   dir       subtree to measure (default: .); paths print relative to it
#   --since   git log window (default: 6.months — git approxidate, so
#             "1.year", "90.days", "2025-01-01" all work)
#
# Read-only; no network. Exits 0 with a message when dir is not inside a
# git work tree or the window holds no commits. Counts are commits touching
# the file, not lines changed; renames count under both names.
set -u

ROOT="."
SINCE="6.months"
while [ $# -gt 0 ]; do
  case "$1" in
    --since) SINCE="${2:-6.months}"; shift 2 ;;
    --since=*) SINCE="${1#--since=}"; shift ;;
    -h|--help) sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) ROOT="$1"; shift ;;
  esac
done
[ -d "$ROOT" ] || { echo "churn: not a directory: $ROOT" >&2; exit 1; }
cd "$ROOT" || exit 1

if ! command -v git >/dev/null 2>&1; then
  echo "# churn: git is not installed; no change-frequency data available"; exit 0
fi
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "# churn: $ROOT is not inside a git work tree; no change-frequency data available"; exit 0
fi

TMP="$(mktemp 2>/dev/null || echo "${TMPDIR:-/tmp}/churn.$$")"
trap 'rm -f "$TMP"' EXIT INT TERM

git log --since="$SINCE" --relative --name-only --pretty=format: -- . 2>/dev/null \
  | grep -v '^[[:space:]]*$' > "$TMP"
commits=$(git rev-list --count --since="$SINCE" HEAD -- . 2>/dev/null || echo 0)
touched=$(sort -u "$TMP" | wc -l | tr -d ' ')

echo "# churn: $ROOT since $SINCE — commits: $commits, distinct files touched: $touched"
if [ "$commits" -eq 0 ] || [ "$touched" -eq 0 ]; then
  echo "  (no commits in this window; widen --since or check the subtree)"; exit 0
fi

echo ""; echo "files (top 25 by commits touching them)"
sort "$TMP" | uniq -c | sort -k1,1nr -k2 | head -25 | awk '{ printf "  %5d  %s\n", $1, $2 }'

echo ""; echo "top-level directories (total file-touches)"
awk '{ d = ($0 ~ /\//) ? substr($0, 1, index($0, "/") - 1) : "(root)"; n[d]++ }
     END { for (d in n) printf "%d\t%s\n", n[d], d }' "$TMP" \
  | sort -k1,1nr -k2 | awk -F'\t' '{ printf "  %5d  %s\n", $1, $2 }'
exit 0
