#!/usr/bin/env python3
"""Deterministic AI-slop detector for frontend markup and CSS.

Static analysis over HTML/CSS/JSX/Vue/Tailwind-class text: catches the
highest-confidence slop patterns without a browser or an LLM. Static
rules cannot see rendered output, so this is necessary-not-sufficient —
pair with the craft-floor visual checks in SKILL.md.

Usage: slop-detector.py <file-or-dir> [more...]
Exit 0 = clean (or only waived hits); exit 1 = hits found.

Waive a line inline:  <!-- slop-ignore: gradient-text -->  (any comment syntax)
"""
import json
import re
import sys
from pathlib import Path

RULES = [
    ("gradient-text",
     r"(?:background(?:-image)?\s*:[^;{}]*-webkit-background-clip\s*:\s*text|"
     r"background-clip\s*:\s*text|@?\.text-(?:gradient|bg-clip-text))",
     "Gradient text — emphasize with weight or size instead"),
    ("purple-gradient",
     r"linear-gradient\([^)]*(?:#(?:7c3aed|8b5cf6|6366f1|a855f7|6d28d9)|purple|violet)[^)]*\)",
     "Purple/violet gradient — the default tech gradient; pick from the committed world"),
    ("bounce-easing",
     r"(?:animation-timing-function|transition-timing-function)\s*:\s*(?:ease-in-out\b(?![^;]*cubic)|bounce|elastic|spring)|cubic-bezier\(\s*0\.(?:[6-9]|3[5-9])\s*,\s*-",
     "Bounce/overshoot easing reads dated — exponential ease-out from a visible default"),
    ("side-stripe-border",
     r"border-left\s*:\s*([2-9](?:px|rem|em))[^;]*;",
     "Side-stripe accent border — carry the signal with tint, icon, or typography"),
    ("hard-offset-shadow",
     r"box-shadow\s*:\s*\d+px\s+\d+px\s+0(?:\s+0)?(?:\s+(?:#|rgb|hsl|var))?",
     "Hard offset shadow outside neobrutalism — use an elevation ramp with blur"),
    ("gray-on-color-placeholder",
     r"placeholder\s*:\s*[^;{}]*(?:#[89a-fA-F][0-9a-fA-F]{2}\s|rgba?\(\s*(?:1[0-5][0-9]|[0-9]?[0-9])\s*,)",
     "Low-luminance gray placeholder/text on colored surfaces — tint from the surface hue"),
    ("glassmorphism-default",
     r"backdrop-filter\s*:\s*blur\((?:[2-9]|1\d)px\)(?!.*?(?:legib|over\s*(?:video|image)))",
     "Blur as decoration — keep it only where it does real work (media legibility, depth cue)"),
    ("inter-display",
     r"font-family\s*:[^;{}]*['\"]?Inter['\"]?[^;{}]*(?:display|heading|h1|h2)|h[12][^{}]*\{[^}]*['\"]?Inter['\"]?",
     "Inter as display voice — pick a face whose character fits the world"),
    ("reflex-display-faces",
     r"font-family\s*:[^;{}]*['\"]?(?:Fraunces|Playfair Display|DM Sans|DM Serif Display|Plus Jakarta Sans|Instrument Sans|Outfit|Space Grotesk)['\"]?",
     "Training-common reflex face — name the reason no other face satisfies, or choose otherwise"),
    ("emoji-icon",
     r"(?:className|class)=\"[^\"]*\">[\s]*[\U0001F300-\U0001FAFF\u2600-\u27BF]",
     "Emoji standing in for icons — draw icons from one set at consistent stroke"),
    ("hero-metric-template",
     r"(?:class|className)=\"[^\"]*(?:stat-card|metric-card|kpi-card|hero-stat)",
     "Hero-metric card template — render the number in this product's own language"),
    ("eyebrow-label",
     r"(?:class|className)=\"[^\"]*(?:eyebrow|kicker|overline|uppercase\s+tracking-[a-z]+\s+text-xs)",
     "Eyebrow/kicker label above a heading — delete it; let the heading speak"),
]

IGNORE_RE = re.compile(
    r"<!--\s*slop-ignore:\s*([a-z0-9-]+)\s*-->|/\*\s*slop-ignore:\s*([a-z0-9-]+)\s*\*/|\{\#\s*slop-ignore:\s*([a-z0-9-]+)\s*\#\}"
)
FILE_EXTS = {".html", ".htm", ".css", ".scss", ".jsx", ".tsx", ".vue", ".svelte", ".astro", ".php", ".mdx"}
SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".next", ".venv"}


def collect(targets):
    files = []
    for t in targets:
        p = Path(t)
        if p.is_file():
            files.append(p)
        elif p.is_dir():
            files.extend(f for f in sorted(p.rglob("*"))
                         if f.is_file() and f.suffix.lower() in FILE_EXTS
                         and not any(part in SKIP_DIRS for part in f.parts))
    return files


def main(argv):
    if len(argv) < 2:
        print(__doc__.strip())
        return 2
    files = collect(argv[1:])
    if not files:
        print("no scannable files found")
        return 2
    total = 0
    for f in files:
        try:
            lines = f.read_text(encoding="utf-8", errors="replace").splitlines()
        except OSError as e:
            print(f"[skip] {f}: {e}")
            continue
        waives = set()
        for ln in lines:
            for m in IGNORE_RE.finditer(ln):
                waives.add(next(g for g in m.groups() if g))
        hits = []
        for i, line in enumerate(lines, 1):
            for rid, pat, why in RULES:
                if rid in waives:
                    continue
                if re.search(pat, line, re.IGNORECASE):
                    hits.append((rid, i, line.strip()[:90], why))
        if hits:
            print(f"[FAIL] {f} — {len(hits)} hit(s)")
            for rid, i, snippet, why in hits:
                print(f"  {rid}:{i}: {why}\n    > {snippet}")
            total += len(hits)
        else:
            print(f"[OK] {f}")
    print(f"\n{total} hit(s) across {len(files)} file(s). "
          "Static rules are necessary-not-sufficient: run the craft-floor visual checks too.")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
