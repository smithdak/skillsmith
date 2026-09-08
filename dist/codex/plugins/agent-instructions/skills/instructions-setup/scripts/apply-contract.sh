#!/bin/sh
# apply-contract.sh — render the communication-contract managed block from
# flags and splice it into instruction files, replacing any earlier managed
# block in place. Everything outside the markers is preserved untouched.
#
# usage:
#   apply-contract.sh --file PATH [--file PATH ...]
#                     [--rules reporting,calibration,questions,brevity,progress]
#                     [--caps soft|none] [--dry-run]
#
# Idempotent: safe to re-run; re-runs replace the block with current wording.
# Legacy (v1) flags are accepted and mapped, each with one stderr note:
#   --ban            -> --rules
#   --no-reading-order -> no-op
#   rule keys preambles, reexplain, format, bloat -> brevity
#   rule key narration -> progress; rule key recaps -> reporting
# Offline: no network access.
set -u

# The marker prefix predates the plugin rename (it still reads
# "agent-voice:output-contract") and is kept byte-identical on purpose:
# splicing matches on the prefix, so v1 blocks already installed by users are
# replaced in place instead of gaining a second block below the stale one.
BLOCK_START='<!-- agent-voice:output-contract v2 (managed; regenerate via instructions-setup) -->'
BLOCK_END='<!-- /agent-voice:output-contract -->'
# Splicing matches this prefix, not the full start line: the version rides in
# the marker, so an exact match would fail against a block written by a
# different version and append a second block below the stale one.
BLOCK_PREFIX='<!-- agent-voice:output-contract'

files=""
caps="none"
dry_run=0
RULES_ALL="reporting,calibration,questions,brevity,progress"
rules="$RULES_ALL"

while [ $# -gt 0 ]; do
  case "$1" in
    --file) files="$files $2"; shift 2 ;;
    --no-reading-order)
      printf 'mapped legacy flag --no-reading-order -> no-op (v2 has no reading-order line)\n' >&2
      shift ;;
    --ban)
      printf 'mapped legacy flag --ban -> --rules\n' >&2
      rules="$2"; shift 2 ;;
    --rules) rules="$2"; shift 2 ;;
    --caps) caps="$2"; shift 2 ;;
    --dry-run) dry_run=1; shift ;;
    *) printf 'unknown option: %s\n' "$1" >&2; exit 2 ;;
  esac
done

[ -n "$files" ] || { printf 'no --file given\n' >&2; exit 2; }

# Normalize the rule list: map legacy keys onto the v2 modules, reject
# unknown keys, drop duplicates. Result lands in $rules (no subshell, so a
# bad key can exit the script).
mapped=""
old_ifs=$IFS
IFS=','
for key in $rules; do
  IFS=$old_ifs
  key=$(printf '%s' "$key" | tr -d ' ')
  [ -n "$key" ] || { IFS=','; continue; }
  case "$key" in
    reporting|calibration|questions|brevity|progress) module="$key" ;;
    preambles|reexplain|format|bloat) module="brevity" ;;
    narration) module="progress" ;;
    recaps) module="reporting" ;;
    *) printf 'unknown rule: %s (expected a subset of %s)\n' "$key" "$RULES_ALL" >&2; exit 2 ;;
  esac
  if [ "$module" != "$key" ]; then
    printf 'mapped legacy flag %s -> %s\n' "$key" "$module" >&2
  fi
  case ",$mapped," in
    *",$module,"*) ;;
    *) mapped="${mapped:+$mapped,}$module" ;;
  esac
  IFS=','
done
IFS=$old_ifs
rules="$mapped"
[ -n "$rules" ] || { printf 'no rules selected\n' >&2; exit 2; }

has_rule() { case ",$rules," in *",$1,"*) return 0 ;; *) return 1 ;; esac; }

blk=$(mktemp)
{
  printf '%s\n\n' "$BLOCK_START"
  printf '## Communication contract (agent-instructions)\n\n'
  if has_rule reporting; then
    printf '%s\n' '- Lead with the outcome: the first sentence is the answer, the result, or the thing that could not be verified; the last line, if any, is the next action.'
    printf '%s\n' '- Write every message to stand alone: the reader saw no tool calls. Name the file, quote the error verbatim in a code block, say who wrote a message and what it said, expand uncommon acronyms once, and use no names coined during the session.'
    printf '%s\n' '- Report faithfully: failed tests, skipped steps, and unverified claims are stated first and plainly, with the output; done-and-verified is stated without hedging; "mostly" is never rounded up to "done".'
  fi
  if has_rule calibration; then
    printf '%s\n' '- Mark what was observed, what was inferred, and what was assumed; give confidence together with its driver; say what evidence would change the answer.'
    printf '%s\n' '- No false precision: a guess stated as a number is still a guess.'
  fi
  if has_rule questions; then
    printf '%s\n' '- For reversible work, proceed on a stated assumption and name it. Ask only when readings diverge materially, when the action is hard to reverse, or when the answer is the user'"'"'s alone to give — one question at a time, with options.'
    printf '%s\n' '- When the premise or plan has a real problem, say so in a sentence or two, then continue under stated assumptions; if the user reaffirms, that is the decision.'
  fi
  if has_rule brevity; then
    printf '%s\n' '- No praise of the question, no performative agreement, no apology loops, no restating the request back.'
    printf '%s\n' '- Brevity is a default, not a ceiling: a real tradeoff, an unfamiliar failure mode, or a teaching request gets structure and length.'
    printf '%s\n' '- Format for the reader: bullets for parallel items, tables for numbers, code blocks for commands, paths, and errors, prose for an argument; headings only in long documents.'
  fi
  if has_rule progress; then
    printf '%s\n' '- Before a multi-step task, one line on what is about to happen; when a long step finishes or the plan changes, a short update. Silence through a long task is the worse failure.'
  fi
  if [ "$caps" = "soft" ]; then
    printf '%s\n' '- Keep replies under roughly ten lines unless complexity genuinely demands more; expand deliberately and with structure.'
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
    awk -v s="$BLOCK_PREFIX" 'index($0, s) == 1 { exit } { print }' "$f" >"$before"
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
