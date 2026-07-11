#!/bin/sh
# intent: deterministic repo shape report — file counts, LOC, structure, largest files.
# Read-only; no network; safe on any POSIX system.
set -eu
ROOT="${1:-.}"
cd "$ROOT"
echo "== top-level =="
ls -1 | head -40
echo ""
echo "== file counts by extension (top 15) =="
find . -type f -not -path '*/.git/*' -not -path '*/node_modules/*' \
  | sed -n 's/.*\.\([A-Za-z0-9_]*\)$/\1/p' | sort | uniq -c | sort -rn | head -15
echo ""
echo "== total files / total lines (text) =="
find . -type f -not -path '*/.git/*' -not -path '*/node_modules/*' | wc -l
find . -type f -not -path '*/.git/*' -not -path '*/node_modules/*' \
  \( -name '*.ts' -o -name '*.js' -o -name '*.py' -o -name '*.go' -o -name '*.rs' \
     -o -name '*.java' -o -name '*.rb' -o -name '*.c' -o -name '*.cpp' -o -name '*.md' \) \
  -exec cat {} + 2>/dev/null | wc -l
echo ""
echo "== largest files (top 10, KB) =="
find . -type f -not -path '*/.git/*' -not -path '*/node_modules/*' \
  -exec du -k {} + 2>/dev/null | sort -rn | head -10
