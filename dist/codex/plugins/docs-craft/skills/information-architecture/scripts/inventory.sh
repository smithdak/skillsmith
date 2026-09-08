#!/bin/sh
# intent: deterministic inventory the structure is built from — a directory's
# immediate entries with line counts (files) or child counts (dirs), or a
# markdown file's heading outline with the line span of each section. Surfaces
# seams and bloat as fact rather than recollection. Read-only; no network.
set -eu
LC_ALL=C
export LC_ALL

PATH_ARG="${1:-.}"

if [ ! -e "$PATH_ARG" ]; then
  printf 'inventory: no such path: %s\n' "$PATH_ARG" >&2
  exit 1
fi

# --- markdown file: heading outline with per-section line spans -------------
outline_markdown() {
  file="$1"
  total=$(wc -l <"$file" | tr -d ' ')
  awk -v total="$total" '
    /^#{1,6}[ \t]/ {
      if (prev_line != "") {
        span = NR - prev_line
        printf "%5d  %s  (%d lines)\n", prev_line, prev_head, span
      }
      indent = ""
      hashes = $0; sub(/[ \t].*$/, "", hashes)
      depth = length(hashes)
      i = 1; while (i < depth) { indent = indent "  "; i++ }
      text = $0; sub(/^#{1,6}[ \t]+/, "", text)
      prev_head = indent text
      prev_line = NR
    }
    END {
      if (prev_line != "") {
        span = total - prev_line + 1
        printf "%5d  %s  (%d lines)\n", prev_line, prev_head, span
      }
    }
  ' "$file"
}

# --- directory: immediate entries with counts -------------------------------
inventory_dir() {
  dir="$1"
  for entry in "$dir"/* "$dir"/.*; do
    [ -e "$entry" ] || continue
    base=$(basename "$entry")
    case "$base" in
      . | .. | .git | node_modules) continue ;;
    esac
    if [ -d "$entry" ]; then
      n=$(find "$entry" -type f -not -path '*/.git/*' -not -path '*/node_modules/*' | wc -l | tr -d ' ')
      printf '%s/\t%s %s\n' "$base" "$n" "$( [ "$n" = 1 ] && echo file || echo files )"
    else
      n=$(wc -l <"$entry" | tr -d ' ')
      printf '%s\t%s %s\n' "$base" "$n" "$( [ "$n" = 1 ] && echo line || echo lines )"
    fi
  done | sort
}

if [ -d "$PATH_ARG" ]; then
  printf '# %s (directory)\n' "$PATH_ARG"
  inventory_dir "$PATH_ARG"
else
  case "$PATH_ARG" in
    *.md | *.markdown)
      printf '# %s (heading outline)\n' "$PATH_ARG"
      outline_markdown "$PATH_ARG"
      ;;
    *)
      n=$(wc -l <"$PATH_ARG" | tr -d ' ')
      printf '# %s\t%s %s\n' "$PATH_ARG" "$n" "$( [ "$n" = 1 ] && echo line || echo lines )"
      ;;
  esac
fi
