#!/bin/sh
# intent: print the internal module import graph of a source tree, then
# fan-in / fan-out tables and any import cycles found.
#
# usage: depgraph.sh [dir] [--maxdepth N]
#   dir         root to scan (default: .)
#   --maxdepth  find(1) depth limit (default: 8)
#
# Read-only; no network; no package-manager or compiler invocation.
#
# What it scans (relative / internal imports only — third-party packages
# are ignored):
#   TS/JS   import ... from './x'   require('./x')   import './x'
#           nodes are file paths without extension; './x' that resolves to
#           a directory is mapped to x/index when such a file exists.
#   Python  from .x import ...   from pkg.x import ...   import pkg.x
#           "pkg" counts as internal when it is a top-level dir or .py
#           file under dir; nodes are module paths (pkg/x); a package
#           target maps to pkg/__init__ when that file exists.
#   Go      import "mod/path/x" (single or block form) where mod is the
#           module line of any go.mod under dir; nodes are package dirs.
# Skips node_modules, .git, dist, build, vendor, archive. Type-only,
# dynamic (import(x) with a non-literal), and re-exported paths are not
# followed. Cycle detection: one DFS over the edge list; each back edge
# reports the cycle path on the stack at that moment, so overlapping
# cycles in one strongly connected component are reported one per back
# edge, not exhaustively. First 20 cycles are printed.
set -u

ROOT="."
MAXDEPTH=8
while [ $# -gt 0 ]; do
  case "$1" in
    --maxdepth) MAXDEPTH="${2:-8}"; shift 2 ;;
    --maxdepth=*) MAXDEPTH="${1#--maxdepth=}"; shift ;;
    -h|--help) sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) ROOT="$1"; shift ;;
  esac
done
[ -d "$ROOT" ] || { echo "depgraph: not a directory: $ROOT" >&2; exit 1; }
cd "$ROOT" || exit 1

TMP="$(mktemp -d 2>/dev/null || echo "${TMPDIR:-/tmp}/depgraph.$$")"
mkdir -p "$TMP"
trap 'rm -rf "$TMP"' EXIT INT TERM
FILES="$TMP/files" EDGES="$TMP/edges"

find . -maxdepth "$MAXDEPTH" \
  \( -name node_modules -o -name .git -o -name dist -o -name build \
     -o -name vendor -o -name archive \) -prune -o \
  -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \
     -o -name '*.mjs' -o -name '*.cjs' -o -name '*.py' -o -name '*.go' \) \
  -print 2>/dev/null | sed 's|^\./||' | sort > "$FILES"

nfiles=$(wc -l < "$FILES" | tr -d ' ')
if [ "$nfiles" -eq 0 ]; then
  echo "# depgraph: $ROOT (maxdepth $MAXDEPTH) — no TS/JS, Python, or Go sources found"
  exit 0
fi

# Python: top-level names that count as internal packages/modules.
PYTOP=$(find . -maxdepth 1 -mindepth 1 \( -type d -o -name '*.py' \) 2>/dev/null \
  | sed 's|^\./||; s|\.py$||' | grep -v '^\.' | tr '\n' ' ')
# Go: "<dir-of-go.mod>=<module path>" pairs.
GOMODS=""
find . -maxdepth "$MAXDEPTH" -name go.mod -not -path '*/vendor/*' 2>/dev/null | while read -r gm; do
  m=$(sed -n 's/^module[[:space:]]\{1,\}\([^[:space:]]*\).*/\1/p' "$gm" | head -1)
  d=$(dirname "$gm" | sed 's|^\./||')
  [ -n "$m" ] && echo "$d=$m"
done > "$TMP/gomods"
GOMODS=$(tr '\n' ' ' < "$TMP/gomods")

# Pass 1: extract raw edges "from<TAB>to". awk reads the file list itself so
# paths with spaces survive and the whole tree is one run.
# shellcheck disable=SC2016
awk -v pytop="$PYTOP" -v gomods="$GOMODS" -v files="$FILES" '
function normpath(p,    n, i, parts, out, k) {
  n = split(p, parts, "/"); k = 0
  for (i = 1; i <= n; i++) {
    if (parts[i] == "" || parts[i] == ".") continue
    if (parts[i] == "..") { if (k > 0) k--; continue }
    out[++k] = parts[i]
  }
  p = ""
  for (i = 1; i <= k; i++) p = (i == 1 ? out[i] : p "/" out[i])
  return p == "" ? "." : p
}
function stripext(p) { sub(/\.(ts|tsx|js|jsx|mjs|cjs|py|go)$/, "", p); return p }
function emit(t) { if (t != "" && t != node) print node "\t" t }
function start(file) {
  dir = file; if (sub(/\/[^\/]*$/, "", dir) == 0) dir = "."
  kind = (file ~ /\.py$/) ? "py" : (file ~ /\.go$/) ? "go" : "js"
  node = (kind == "go") ? dir : stripext(file)
  ingo = 0
}
BEGIN {
  n = split(pytop, a, " "); for (i = 1; i <= n; i++) if (a[i] != "") ispy[a[i]] = 1
  n = split(gomods, a, " ")
  for (i = 1; i <= n; i++) if (a[i] != "") { split(a[i], kv, "="); gomod[kv[2]] = kv[1] }
  while ((getline f < files) > 0) {
    start(f)
    while ((getline raw < f) > 0) { $0 = raw; handle() }
    close(f)
  }
}
function handle(    line, s, t, up, base, rest, i, nm, p, m, pre) {
if (kind == "js") {
  line = $0
  while (match(line, /(from[[:space:]]+|require\([[:space:]]*|^[[:space:]]*import[[:space:]]+)["\x27][^"\x27]+["\x27]/)) {
    s = substr(line, RSTART, RLENGTH); line = substr(line, RSTART + RLENGTH)
    match(s, /["\x27][^"\x27]+["\x27]/); t = substr(s, RSTART + 1, RLENGTH - 2)
    if (t ~ /^\.\.?\//) emit(normpath(dir "/" stripext(t)))
  }
}
if (kind == "py" && $0 ~ /^[[:space:]]*(from|import)[[:space:]]/) {
  if ($1 == "from") {
    t = $2
    if (t ~ /^\./) {
      up = 0; while (substr(t, up + 1, 1) == ".") up++
      base = dir; for (i = 1; i < up; i++) { if (sub(/\/[^\/]*$/, "", base) == 0) base = "." }
      rest = substr(t, up + 1); gsub(/\./, "/", rest)
      if (rest == "") {
        # from . import a, b  -> each name is a sibling module (or a symbol; kept as-is)
        for (i = 4; i <= NF; i++) { nm = $i; gsub(/[,()]/, "", nm); if (nm != "" && nm != "as") emit(normpath(base "/" nm)); if ($i ~ /^as$/) i++ }
      } else emit(normpath(base "/" rest))
    } else { split(t, p, "."); if (p[1] in ispy) { gsub(/\./, "/", t); emit(t) } }
  } else {
    for (i = 2; i <= NF; i++) {
      t = $i; gsub(/,/, "", t)
      if (t == "as") { i++; continue }
      split(t, p, "."); if (p[1] in ispy) { gsub(/\./, "/", t); emit(t) }
    }
  }
}
if (kind == "go") {
  if ($0 ~ /^import[[:space:]]*\(/) { ingo = 1; return }
  if (ingo && $0 ~ /^\)/) { ingo = 0; return }
  if (ingo || $0 ~ /^import[[:space:]]/) {
    if (match($0, /"[^"]+"/)) {
      t = substr($0, RSTART + 1, RLENGTH - 2)
      for (m in gomod) if (index(t, m "/") == 1 || t == m) {
        rest = substr(t, length(m) + 2); pre = gomod[m]
        emit(normpath((pre == "." ? "" : pre "/") rest))
      }
    }
  }
}
}
' > "$EDGES.raw"

# Pass 2: resolve directory targets, drop duplicates, tables, cycles.
awk -F'\t' -v files="$FILES" -v nfiles="$nfiles" -v root="$ROOT" -v maxdepth="$MAXDEPTH" '
function resolve(t) {
  if (t in known) return t
  if ((t "/index") in known) return t "/index"
  if ((t "/__init__") in known) return t "/__init__"
  return t
}
function dfs(u,    i, v, s) {
  color[u] = 1; stack[++sp] = u
  for (i = 1; i <= outn[u]; i++) {
    v = adj[u, i]
    if (color[v] == 0) dfs(v)
    else if (color[v] == 1 && ncycles < 20) {
      s = ""; for (j = 1; j <= sp; j++) if (stack[j] == v || s != "") s = (s == "" ? stack[j] : s " -> " stack[j])
      cycles[++ncycles] = s " -> " v
    } else if (color[v] == 1) ncycles++
  }
  color[u] = 2; sp--
}
BEGIN {
  while ((getline f < files) > 0) { g = f; sub(/\.(ts|tsx|js|jsx|mjs|cjs|py)$/, "", g); known[g] = 1; d = f; if (sub(/\/[^\/]*$/, "", d) == 0) d = "."; if (f ~ /\.go$/) known[d] = 1 }
}
NF == 2 {
  t = resolve($2); if (t == $1) next
  key = $1 "\t" t
  if (key in seen) next
  seen[key] = 1; ne++
  edge[ne] = key; fanout[$1]++; fanin[t]++
  adj[$1, ++outn[$1]] = t; nodes[$1] = 1; nodes[t] = 1
}
function top(arr, title,    n, i, k, keys, tmp) {
  n = 0; for (k in arr) keys[++n] = k
  for (i = 2; i <= n; i++) { tmp = keys[i]; j = i - 1; while (j > 0 && (arr[keys[j]] < arr[tmp] || (arr[keys[j]] == arr[tmp] && keys[j] > tmp))) { keys[j + 1] = keys[j]; j-- } keys[j + 1] = tmp }
  print ""; print title " (top 10)"
  if (n == 0) { print "  (none)"; return }
  for (i = 1; i <= n && i <= 10; i++) printf "  %5d  %s\n", arr[keys[i]], keys[i]
}
END {
  printf "# depgraph: %s (maxdepth %s) — files scanned: %d, internal edges: %d\n", root, maxdepth, nfiles, ne
  print ""; print "edges"
  if (ne == 0) print "  (no internal imports found)"
  for (i = 1; i <= ne; i++) { split(edge[i], p, "\t"); print "  " p[1] " -> " p[2] }
  top(fanin, "fan-in"); top(fanout, "fan-out")
  print ""; print "cycles"
  sp = 0; ncycles = 0
  n = 0; for (k in nodes) keys[++n] = k
  for (i = 2; i <= n; i++) { tmp = keys[i]; j = i - 1; while (j > 0 && keys[j] > tmp) { keys[j + 1] = keys[j]; j-- } keys[j + 1] = tmp }
  for (i = 1; i <= n; i++) if (color[keys[i]] == 0) dfs(keys[i])
  if (ncycles == 0) print "  (none detected)"
  for (i = 1; i <= ncycles && i <= 20; i++) print "  " cycles[i]
  if (ncycles > 20) print "  ... " (ncycles - 20) " more back edges not shown"
}
' "$EDGES.raw"
exit 0
