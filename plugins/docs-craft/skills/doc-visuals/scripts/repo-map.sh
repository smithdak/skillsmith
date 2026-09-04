#!/bin/sh
# intent: deterministic repository skeleton — directories to a depth cap with
# cumulative file counts, plus top-level files — the ground truth a repo map
# is built from. Read-only; no network; git-aware (tracked files only) with a
# find fallback outside git repos.
set -eu
LC_ALL=C
export LC_ALL

ROOT="${1:-.}"
DEPTH="${2:-2}"

if git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  FILES=$(git -C "$ROOT" ls-files)
else
  FILES=$(cd "$ROOT" && find . -type f -not -path '*/.git/*' -not -path '*/node_modules/*' | sed 's|^\./||')
fi

printf '%s\n' "$FILES" | awk -F'/' -v depth="$DEPTH" '
  {
    if (NF == 1) { toplevel[$1] = 1; next }
    path = ""
    limit = (NF - 1 < depth) ? NF - 1 : depth
    for (i = 1; i <= limit; i++) {
      path = path $i "/"
      count[path]++
    }
  }
  END {
    for (d in count) printf "%s\t%d %s\n", d, count[d], (count[d] == 1 ? "file" : "files")
    for (f in toplevel) printf "%s\n", f
  }
' | sort
