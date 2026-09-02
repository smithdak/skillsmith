#!/bin/sh
# apply-contract.sh — render the output-contract managed block from flags and
# splice it into instruction files, replacing any earlier managed block in
# place. Everything outside the markers is preserved untouched.
#
# usage:
#   apply-contract.sh --file PATH [--file PATH ...]
#                     [--no-reading-order]
#                     [--rules preambles,narration,recaps,reexplain,format]
#                     [--caps soft|none] [--dry-run]
#
# Idempotent: safe to re-run; re-runs replace the block with current wording.
# `--ban` is the pre-0.2 spelling of `--rules`, and its `bloat` key still
# selects the formatting rule.
# Offline: no network access.
set -u

BLOCK_START='<!-- agent-voice:output-contract v1 (managed; regenerate via voice-setup) -->'
BLOCK_END='<!-- /agent-voice:output-contract -->'

files=""
reading_order=1
caps="none"
dry_run=0
RULES_ALL="preambles,narration,recaps,reexplain,format"
rules="$RULES_ALL"

while [ $# -gt 0 ]; do
  case "$1" in
    --file) files="$files $2"; shift 2 ;;
    --no-reading-order) reading_order=0; shift ;;
    --rules|--ban) rules="$2"; shift 2 ;;
    --caps) caps="$2"; shift 2 ;;
    --dry-run) dry_run=1; shift ;;
    *) printf 'unknown option: %s\n' "$1" >&2; exit 2 ;;
  esac
done

[ -n "$files" ] || { printf 'no --file given\n' >&2; exit 2; }

has_rule() { case ",$rules," in *",$1,"*) return 0 ;; *) return 1 ;; esac; }

blk=$(mktemp)
{
  printf '%s\n\n' "$BLOCK_START"
  printf '## Output contract (agent-voice)\n\n'
  printf '%s\n' '- Chat replies end with the takeaway on the final line — the eye lands at the bottom of terminal scrollback.'
  if [ "$reading_order" -eq 1 ]; then
    printf '%s\n' '- File content leads with the summary or conclusion; detail follows.'
  fi
  printf '%s\n' '- Default to the shortest accurate form; reach for bullets, tables, or headings only where the structure carries meaning.'
  if has_rule preambles; then
    printf '%s\n' '- No preambles ("Let me...", "Great question"); the first sentence carries substance.'
  fi
  if has_rule narration; then
    printf '%s\n' '- Narrate work only where the user gains by hearing it: name a multi-step plan once, and report what changed when a long step ends. Do not announce each individual read or search.'
  fi
  if has_rule recaps; then
    printf '%s\n' '- No post-task recap paragraphs; report edits as path:line plus one sentence only when intent is non-obvious.'
  fi
  if has_rule reexplain; then
    printf '%s\n' '- Do not re-explain code the diff already shows; explain decisions, not mechanics.'
  fi
  if has_rule format || has_rule bloat; then
    printf '%s\n' '- Format for the reader, not for emphasis: plain sentences unless the content is genuinely a list, a comparison, or a sectioned document.'
  fi
  printf '%s\n' '- Command and test runs get one line: pass/fail; expand failures only (rule id, path:line).'
  if [ "$caps" = "soft" ]; then
    printf '%s\n' '- Keep replies under roughly ten lines unless complexity genuinely demands more; expand deliberately, structured, still ending on the takeaway.'
  fi
  printf '\n%s\n' "$BLOCK_END"
} >"$blk"

if [ "$dry_run" -eq 1 ]; then
  printf '%s\n' '--- rendered block ---'
  cat "$blk"
  printf '%s\n' '--- targets ---'
  for f in $files; do printf '%s\n' "$f"; done
  rm -f "$blk"
  exit 0
fi

rc=0
for f in $files; do
  if [ ! -f "$f" ]; then
    cat "$blk" >"$f"
    printf 'created %s\n' "$f"
    continue
  fi
  if grep -qF "$BLOCK_END" "$f"; then
    before=$(mktemp)
    after=$(mktemp)
    # Everything above the managed block...
    awk -v s="$BLOCK_START" 'index($0, s) == 1 { exit } { print }' "$f" >"$before"
    # ...and everything below it.
    awk -v e="$BLOCK_END" 'seen { print } index($0, e) == 1 { seen = 1 }' "$f" >"$after"
    cat "$before" "$blk" "$after" >"$f"
    rm -f "$before" "$after"
    printf 'updated %s\n' "$f"
  else
    # Unmanaged file: append, separated by a blank line.
    printf '\n' >>"$f"
    cat "$blk" >>"$f"
    printf 'appended %s\n' "$f"
  fi
done

rm -f "$blk"
exit "$rc"
