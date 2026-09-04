#!/bin/sh
# intent: surface candidate lines of leaked authoring-session narration in a
# scope, grouped by leakage class, so the audit starts from evidence instead
# of a skim. Every hit still needs semantic judgment — the patterns over-match
# by design ("the key used to sign" is instrumental, not temporal) and
# under-match by nature. Read-only; no network. Uses ripgrep when present,
# GNU grep otherwise (extra rg args are ignored on the grep path).
#
# Adapted from deepseek-ai/deepseek-harness — dsh-trim-cot-leakage
# recall batteries (MIT); see repo-root NOTICES.md.
#
# usage: recall-batteries.sh <scope-path> [extra rg args, e.g. --glob '!snapshots/**']
set -eu
LC_ALL=C
export LC_ALL

SCOPE="${1:-}"
if [ -z "$SCOPE" ]; then
  printf 'usage: %s <scope-path> [extra rg args]\n' "$0" >&2
  exit 2
fi
shift
if [ ! -e "$SCOPE" ]; then
  printf 'recall-batteries: no such path: %s\n' "$SCOPE" >&2
  exit 1
fi

if command -v rg >/dev/null 2>&1; then
  ENGINE=rg
else
  ENGINE=grep
  if [ "$#" -gt 0 ]; then
    printf 'recall-batteries: rg not found; using grep and ignoring extra args: %s\n' "$*" >&2
  fi
fi

TOTAL=0

# search <case-flag-or-empty> <pattern> [extra rg args]
# Exclusions go last so an earlier include cannot re-admit them.
search() {
  flag="$1"; pattern="$2"; shift 2
  if [ "$ENGINE" = rg ]; then
    # shellcheck disable=SC2086
    rg -n --hidden $flag -e "$pattern" "$@" \
      --glob '!.git/**' --glob '!node_modules/**' --glob '!vendor/**' \
      -- "$SCOPE"
  else
    # shellcheck disable=SC2086
    grep -rnE $flag -e "$pattern" \
      --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=vendor \
      -- "$SCOPE"
  fi
}

# run <label> <case-flag-or-empty> <pattern> [extra rg args]
run() {
  label="$1"; flag="$2"; pattern="$3"; shift 3
  printf '\n== %s ==\n' "$label"
  status=0
  out=$(search "$flag" "$pattern" "$@") || status=$?
  if [ "$status" -eq 2 ]; then
    printf 'recall-batteries: search failed on battery "%s"\n' "$label" >&2
    exit 2
  fi
  if [ -n "$out" ]; then
    printf '%s\n' "$out"
    n=$(printf '%s\n' "$out" | wc -l | tr -d ' ')
    TOTAL=$((TOTAL + n))
  else
    printf '(none)\n'
  fi
}

# Case-sensitive: code-shaped tokens where -i would turn T4 / P-I into noise.
run 'dead session citations' '' \
  '\(decision [0-9]|\(audit [A-Z][0-9]|design §|plan §|design ledger|\bP-I\b|\bW[0-9]\b|\bT[0-9]\b' "$@"
run 'PR / stack vantage' '-i' \
  'this PR|this branch|this stack|later PR|previous commit|this commit' "$@"
run 'change narration' '-i' \
  'used to |no longer|previously|the old |was renamed|was moved' "$@"
run 'version stamps and indexicals' '-i' \
  '\bv1\b|this cut|\bcut [0-9]|\btoday\b|\bfor now\b|roadmap' "$@"
run 'review choreography' '-i' \
  'rejected in review|review round|reviewer|as of v[0-9]' "$@"
run 'hedges and reviewer-addressed justification' '-i' \
  'probably |should be enough|should suffice|it simply|is safe —|is safe --' "$@"
run 'section citations (§N) — keep when the target is a committed doc or an external standard' '' \
  '§[0-9]' "$@"

printf '\n%s candidate line(s). Each needs semantic judgment against the keep rules;\n' "$TOTAL"
printf 'a zero-hit battery proves nothing until you have seen it match a known positive.\n'
