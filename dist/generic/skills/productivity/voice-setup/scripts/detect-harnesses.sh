#!/bin/sh
# detect-harnesses.sh — inventory the agent-instruction surfaces the output
# contract can attach to. Read-only; prints KEY=VAL lines; exits 0 even when
# nothing is found so the setup interview can proceed on partial facts.
set -u

say() { printf '%s=%s\n' "$1" "$2"; }

block_in() {
  grep -q 'agent-voice:output-contract' "$1" 2>/dev/null && echo present || echo absent
}

file_state() {
  if [ -f "$1" ]; then
    if grep -q 'agent-voice:output-contract' "$1" 2>/dev/null; then
      echo "managed"
    else
      echo "unmanaged"
    fi
  else
    echo "absent"
  fi
}

# --- project scope (cwd) ---
say "repo_agents_md" "$(file_state AGENTS.md)"
say "repo_claude_md" "$(file_state CLAUDE.md)"
[ -d .opencode ] && say "repo_opencode_dir" present || say "repo_opencode_dir" absent
if [ -f opencode.jsonc ]; then say "repo_opencode_config" opencode.jsonc
elif [ -f opencode.json ]; then say "repo_opencode_config" opencode.json
else say "repo_opencode_config" absent
fi

# --- global scope ---
say "global_claude_md" "$(file_state "${HOME:-~}/.claude/CLAUDE.md")"
say "global_opencode_agents_md" "$(file_state "${HOME:-~}/.config/opencode/AGENTS.md")"
if [ -f "${HOME:-~}/.config/opencode/opencode.jsonc" ]; then
  say "global_opencode_config" opencode.jsonc
elif [ -f "${HOME:-~}/.config/opencode/opencode.json" ]; then
  say "global_opencode_config" opencode.json
else
  say "global_opencode_config" absent
fi

# --- precedence hazard ---
# Creating ~/.config/opencode/AGENTS.md shadows the ~/.claude/CLAUDE.md
# fallback (opencode loads only the first matching global rules file).
if [ -f "${HOME:-~}/.claude/CLAUDE.md" ] && [ ! -f "${HOME:-~}/.config/opencode/AGENTS.md" ]; then
  say "shadowing_hazard" "creating_global_opencode_agents_will_shadow_claude_fallback"
else
  say "shadowing_hazard" none
fi

exit 0
