# Repository maps: navigation with an honest scope

A map helps a reader find where to change or inspect something. Start with that
reader's task. A new user may need only the examples directory; a contributor may
need the public API, implementation and tests. Do not put an inventory in the README
just because the repository has many directories.

## Inventory before selection

Resolve `scripts/repo-map.sh` from the installed skill and pass the repository root
and optional depth. Example invocation after setting the actual installed path:

```sh
sh "$skill_dir/scripts/repo-map.sh" "$repo_root" 2
```

In a git repository the helper uses `git ls-files`; its counts are **tracked files
below each directory**, not immediate children or skill counts. It can include
tracked deletions and omit new untracked files. Check the working tree before making
claims about what exists now. Outside git, its file walk excludes `.git` and
`node_modules`. Empty directories and filenames containing newlines are not reliably
represented. Treat this output as a starting inventory with that scope.

Verify selected paths on disk. If the document describes a release rather than the
working tree, use that release's inventory. Never describe a cumulative file count
as “N more modules.” Count the specific omitted entries when the number is useful;
otherwise say the view is selected and omit the number.

## Select an explanation, not a depth limit

Keep the entry point and the places the reader will navigate. Expand one subtree
when the distinction matters, and collapse generated, vendor or repetitive areas.
A flat inventory table can be clearer than a tree when the question is “where do I
change X?” If a map becomes long, split by task or link a deeper map. Do not merge
unrelated paths onto one line to hit a line quota.

Use one entry per line, trailing slashes for directories and consistent tree
connectors. Align a short annotation column when it fits comfortably. An annotation
states a role or edit boundary, rather than repeating the basename. Mark generated
output when readers could mistake it for an edit location. In a narrow layout,
shorten annotations or put roles in nearby prose instead of padding a wide column.

## Worked example

These are invented paths for illustrating selection. Start with verified paths in
the real repository.

A complete inventory can bury the places a contributor needs:

```text
packages/
  cli/
  core/
node_modules/
dist/
coverage/
assets/
examples/
```

A task-specific map can answer “where do I add a command and its behavior?”:

```text
packages/
├── cli/src/       command arguments and user-facing output
└── core/
    ├── src/       reusable behavior
    └── test/      behavior checks
examples/          runnable usage examples
dist/              generated output; edit the sources above
```

Introduce it as **selected contributor paths**, so the omitted directories are not
mistaken for an incomplete scan. If actual folder names are less clear, preserve
the names and explain their roles; never rename the representation for aesthetics.

When paths are unrelated in the hierarchy, a lookup table often serves better:

| To change… | Start here |
|---|---|
| Command options | `packages/cli/src/` |
| Shared behavior | `packages/core/src/` |
| A runnable example | `examples/` |

Verify every shown path and its claimed role, distinguish current sources from
output, and remove counts or details that add maintenance cost without helping
navigation. Keep the fence tagged `text` and inspect annotation wrapping in the
rendered document.
