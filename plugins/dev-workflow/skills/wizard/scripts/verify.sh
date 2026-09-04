#!/bin/sh
# intent: static checks on an authored wizard before it is handed to a human.
# Usage:   verify.sh <wizard.sh> [repo-dir]      (repo-dir defaults to .)
# Checks — one ok/FAIL/warn line each; exit 1 on any FAIL:
#   - bash -n parses the wizard; shellcheck runs if installed (warn if not)
#   - the library (everything above the "# STAGES" marker) is byte-identical
#     to template.sh next to this script — a hand-edited library FAILs
#   - TOTAL_STAGES equals the number of stage calls below the marker
#   - every set_secret NAME is referenced as secrets.NAME in
#     <repo>/.github/workflows/* (FAIL); workflow secrets no set_secret
#     produces are a warn (secrets.GITHUB_TOKEN is built in and ignored)
#   - every write_env VAR is listed in <repo>/.env.example when that file
#     exists (warn per missing var)
#   - every ask/ask_secret VAR is later fed to write_env/set_secret/set_var, or
#     its ask line carries a "# pure" comment (warn otherwise)
# Read-only; offline; POSIX sh.
set -u

wizard="${1:-}"
repo="${2:-.}"
[ -n "$wizard" ] || { awk 'NR > 1 && !/^#/ { exit } NR > 1 { sub(/^# ?/, ""); print }' "$0" >&2; exit 2; }
[ -f "$wizard" ] || { echo "FAIL  no such file: $wizard" >&2; exit 2; }
[ -d "$repo" ]   || { echo "FAIL  no such directory: $repo" >&2; exit 2; }
here=$(dirname -- "$0")
template="$here/template.sh"
[ -f "$template" ] || { echo "FAIL  template.sh not found next to $0" >&2; exit 2; }

fails=0
ok()   { echo "ok    $1"; }
fail() { echo "FAIL  $1"; fails=$((fails + 1)); }
warn() { echo "warn  $1"; }

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT INT TERM

# lib FILE OUT — everything above the marker; stages FILE OUT — everything below.
lib()    { awk '/^# STAGES/ { exit } { print }' "$1" > "$2"; }
stages() { awk 'found { print } /^# STAGES/ { found = 1 }' "$1" > "$2"; }

# ── 1. syntax ────────────────────────────────────────────────────────────
if bash -n "$wizard" 2>"$tmp/syntax"; then
  ok "bash -n $wizard"
else
  fail "bash -n: $(head -n1 "$tmp/syntax")"
fi

# ── 2. shellcheck ────────────────────────────────────────────────────────
if command -v shellcheck >/dev/null 2>&1; then
  if shellcheck "$wizard" >"$tmp/sc" 2>&1; then
    ok "shellcheck clean"
  else
    fail "shellcheck reported findings:"
    sed 's/^/        /' "$tmp/sc"
  fi
else
  warn "shellcheck not installed — skipped"
fi

# ── 3. library byte-identical to template ────────────────────────────────
grep -q '^# STAGES' "$wizard" || fail "no '# STAGES' marker — cannot locate the library section"
lib "$wizard" "$tmp/lib.wizard"
lib "$template" "$tmp/lib.template"
if cmp -s "$tmp/lib.wizard" "$tmp/lib.template"; then
  ok "library section matches template.sh ($(wc -l < "$tmp/lib.template" | tr -d ' ') lines)"
else
  line=$(cmp "$tmp/lib.wizard" "$tmp/lib.template" 2>&1 | sed -n 's/.*line \([0-9][0-9]*\).*/\1/p' | head -n1)
  [ -n "$line" ] || line=$(cmp "$tmp/lib.wizard" "$tmp/lib.template" 2>&1 | sed -n 's/.*EOF on .*line \([0-9][0-9]*\).*/\1/p' | head -n1)
  [ -n "$line" ] || line="?"
  fail "library section differs from template.sh at line $line (never hand-edit above the marker; re-copy it)"
  [ "$line" != "?" ] && printf '        wizard:   %s\n        template: %s\n' \
    "$(sed -n "${line}p" "$tmp/lib.wizard")" "$(sed -n "${line}p" "$tmp/lib.template")"
fi

# ── 4. TOTAL_STAGES ──────────────────────────────────────────────────────
stages "$wizard" "$tmp/stages"
declared=$(sed -n 's/^TOTAL_STAGES=\([0-9][0-9]*\).*/\1/p' "$tmp/stages" | tail -n1)
actual=$(grep -c '^[[:space:]]*stage[[:space:]]' "$tmp/stages")
if [ -z "$declared" ]; then
  fail "TOTAL_STAGES is not set below the marker"
elif [ "$declared" -eq "$actual" ]; then
  ok "TOTAL_STAGES=$declared matches $actual stage call(s)"
else
  fail "TOTAL_STAGES=$declared but $actual stage call(s) found"
fi

# ── 5. set_secret names vs workflow secrets.* references ─────────────────
sed -n 's/^[[:space:]]*set_secret[[:space:]]\{1,\}"\{0,1\}\([A-Za-z_][A-Za-z0-9_]*\)"\{0,1\}.*/\1/p' "$tmp/stages" | sort -u > "$tmp/produced"
: > "$tmp/referenced"
if [ -d "$repo/.github/workflows" ]; then
  find "$repo/.github/workflows" -type f \( -name '*.yml' -o -name '*.yaml' \) -exec cat {} + 2>/dev/null \
    | grep -o 'secrets\.[A-Za-z_][A-Za-z0-9_]*' | sed 's/^secrets\.//' | grep -vx 'GITHUB_TOKEN' | sort -u > "$tmp/referenced" || true
fi
if [ -s "$tmp/produced" ]; then
  missing=$(comm -23 "$tmp/produced" "$tmp/referenced" | tr '\n' ' ')
  if [ -n "$missing" ]; then
    fail "set_secret name(s) never referenced as secrets.NAME in $repo/.github/workflows/*: $missing"
  else
    ok "every set_secret name is referenced by a workflow ($(tr '\n' ' ' < "$tmp/produced"))"
  fi
else
  ok "no set_secret calls"
fi
if [ -s "$tmp/referenced" ]; then
  unproduced=$(comm -13 "$tmp/produced" "$tmp/referenced" | tr '\n' ' ')
  [ -n "$unproduced" ] && warn "workflow secrets no stage sets: $unproduced"
fi

# ── 6. write_env vars vs .env.example ────────────────────────────────────
sed -n 's/^[[:space:]]*write_env[[:space:]]\{1,\}"\{0,1\}\([A-Za-z_][A-Za-z0-9_]*\)"\{0,1\}.*/\1/p' "$tmp/stages" | sort -u > "$tmp/written"
if [ -f "$repo/.env.example" ]; then
  n=0
  while IFS= read -r var; do
    if ! grep -q "^${var}=" "$repo/.env.example"; then
      warn "write_env $var — not listed in $repo/.env.example"
      n=$((n + 1))
    fi
  done < "$tmp/written"
  [ "$n" -eq 0 ] && ok "every write_env var is listed in .env.example"
else
  warn "no $repo/.env.example — write_env vars not cross-checked"
fi

# ── 7. every captured value is consumed (or marked pure) ─────────────────
unconsumed=0
grep -n '^[[:space:]]*ask\(_secret\)\{0,1\}[[:space:]]' "$tmp/stages" | while IFS= read -r hit; do
  lineno=${hit%%:*}
  text=${hit#*:}
  var=$(printf '%s\n' "$text" | sed -n 's/^[[:space:]]*ask\(_secret\)\{0,1\}[[:space:]]\{1,\}"\{0,1\}\([A-Za-z_][A-Za-z0-9_]*\)"\{0,1\}.*/\2/p')
  [ -n "$var" ] || continue
  case "$text" in *'#'*pure*) continue ;; esac
  if ! tail -n +"$((lineno + 1))" "$tmp/stages" \
       | grep -E '^[[:space:]]*(write_env|set_secret|set_var)[[:space:]]' \
       | grep -Eq "\\\$\{?${var}([^A-Za-z0-9_]|$)"; then
    echo "warn  ask $var (stages line $lineno) is never passed to write_env/set_secret/set_var — add '# pure' if it only drives a later step"
    echo x >> "$tmp/unconsumed"
  fi
done
[ -f "$tmp/unconsumed" ] && unconsumed=$(wc -l < "$tmp/unconsumed" | tr -d ' ')
[ "$unconsumed" -eq 0 ] && ok "every captured value is persisted or marked pure"

# ── result ───────────────────────────────────────────────────────────────
if [ "$fails" -gt 0 ]; then
  echo "FAIL  $fails check(s) failed"
  exit 1
fi
echo "ok    all checks passed"
