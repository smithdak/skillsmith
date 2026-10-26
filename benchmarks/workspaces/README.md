# Repository-task development fixtures

These small tasks exercise implementation and review in a tool-using
harness. They complement the text-only effectiveness command. No model run is
implied by the presence of fixtures or passing grader self-checks.

For each task, make a fresh copy of only its input directory and supply task.md
as the user request. Start a fresh agent context for each configuration: no
skill, saved previous skill, and current skill. Keep model, tools, permissions,
and task input fixed. Disable unrelated installed skills. The grading files
stay outside the solver workspace and are not part of its prompt.

Example preparation from the repository root:

```sh
trial_dir=$(mktemp -d)
cp -R benchmarks/workspaces/diagnose-bugs/input/. "$trial_dir/"
```

Run the chosen harness in that directory with the task and selected skill.
After it finishes, verify its artifact from outside the solver workspace:

```sh
bun benchmarks/workspaces/diagnose-bugs/verify.ts "$trial_dir"
```

Use tdd/verify.ts for the pricing task and the separate human rubric for the
security review. The `spec-drift` task also uses a human rubric in `grading.md`:
copy its `input/` tree and provide its `task.md`, keeping that rubric outside the
solver workspace. Its local `checks.ts` confirms fixture behavior, not report
quality. Verification scripts return nonzero on a failed assertion.
They check delivered behavior; they cannot establish red-before-green without
the execution transcript. Review the transcript for actual test runs,
unnecessary approval requests, scope expansion, and false claims of completion.

Capture model/harness versions, exact skill and reference hashes, input hash,
outputs and diff, checks, tokens, duration, and user interruptions. Use isolated
workspaces for deliberate mutations and clean up only the trial directories
you created. Run results belong in a separate report with sample counts and
limitations. These development tasks are visible during refinement; collect
fresh tasks from actual use for independent validation.
