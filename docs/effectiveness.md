# Skill effectiveness

The effectiveness command compares answers with no skill (`off`), the current skill
(`on`), and optionally a previous version (`previous`). The default runner uses
**GPT-6 Astra through Codex with your ChatGPT subscription**. No API key is required.

## Run with your subscription

Start in a checkout of this repository with Bun 1.3.14 or newer and dependencies
installed using `bun install --frozen-lockfile`. The default adapter requires
Codex CLI 0.153.4 or a compatible version.

```sh
codex login
codex login status
bun packages/cli/src/main.ts effectiveness \
  --suite benchmarks/effectiveness.json --repeat 1 \
  --output /tmp/skillsmith-effectiveness.json
```

Choose ChatGPT when signing in. The runner refuses API-key login, strips API
credentials and OpenAI endpoint overrides from its child environment, and pins
`forced_login_method="chatgpt"` and `model_provider="openai"`. It does not change your
saved login or global configuration. These sessions consume your existing Codex
allowance; subscription limits still apply. See OpenAI's
[authentication documentation](https://learn.chatgpt.com/docs/auth).

The model defaults to `gpt-6-astra`, with `--effort medium`. Override `--model` and
`--effort` explicitly for other subscription models. There is no fallback to a paid
API or to another model when access fails. Both solver and grader use the selected
model in separate fresh sessions. The report records the model, effort, CLI version,
runner version, instruction hashes and suite hash.

The bundled three-task text suite makes 12 Codex sessions at `--repeat 1` (three tasks,
two arms, solve plus grade). `--repeat 3` makes 36. Adding `--baseline` makes 18 or 54,
respectively. Start small before spending your subscription allowance on repeats.

For the two documentation tasks, substitute `--suite benchmarks/docs-quality.json`.
That suite uses eight sessions for two arms or twelve with a baseline at one repeat.

The [recorded Astra pilots](../benchmarks/results/README.md) includes complete
answers, grades, metrics and limitations.

## Compare a revision

Create a source snapshot of the previous revision without changing your checkout:

```sh
mkdir -p /tmp/skillsmith-previous
git archive HEAD skills skillsmith.toml | tar -x -C /tmp/skillsmith-previous
bun packages/cli/src/main.ts effectiveness \
  --suite benchmarks/effectiveness.json --baseline /tmp/skillsmith-previous \
  --repeat 3 --output /tmp/skillsmith-revision.json
```

Use `HEAD` only when it is the version you intend to compare; after committing a
revision, choose the previous commit explicitly. Missing baseline skills fail before
model execution. Arm order rotates across tasks and repeats. Each task passes only
when all its criteria pass. `delta` is current minus no-skill pass rate;
`revisionDelta` is current minus previous. Per-arm and per-skill summaries include
solver duration and token usage when reported. Unknown usage stays unknown.

## Isolation and limits

The Codex text adapter runs `codex exec` in a new empty temporary directory for each
request, using read-only mode, ephemeral sessions, structured output, ignored user
configuration, disabled host skill discovery, disabled plugins and tools, and no
loaded AGENTS.md content. Any tool event or incomplete turn fails the run. Temporary
request files are removed on success or failure. Managed policies still apply.
The adapter uses flags available in Codex CLI 0.153.4; incompatible older CLIs fail
rather than silently weakening the setup. OpenAI documents the
[JSON event and schema interface](https://learn.chatgpt.com/docs/non-interactive-mode).

This is a **text-task pilot**, with SKILL.md and references loaded eagerly. It does
not measure automatic invocation, on-demand resource loading, tool use or real
repository changes. The starter cases are development fixtures, not a held-out
benchmark. A strong model can pass both arms; a tie is not evidence of skill uplift.
Review the stored answers and criterion-level grades before interpreting a result.
A same-model grader can have shared blind spots. Repeats measure variation on the
same cases, not broader task coverage or improvements across other models.

For actual coding behavior, use the isolated
[workspace fixtures](../benchmarks/workspaces/README.md). Their independent graders
check functional outcomes; transcripts are needed to verify behaviors such as
observing a failing test before implementation.

## Custom runner protocol

Other local or subscription harnesses can implement the same protocol. Pass a
trusted executable as a JSON argument array and identify its settings:

```sh
bun packages/cli/src/main.ts effectiveness --suite benchmarks/effectiveness.json \
  --runner '["bun", "/absolute/path/to/runner.ts"]' \
  --runner-id 'my-harness-v1; solver=<model>; grader=<model>; settings=<settings>'
```

Each request starts a fresh process. One JSON request enters on stdin; one JSON
response exits on stdout. Logs go to stderr. Suite and baseline paths resolve
against `--cwd`; the custom runner executes there. The default timeout is 300 seconds
per request (`--timeout-ms`). Failures abort without emitting a successful report.
`--output <path>` writes the full report to a file; omit it to stream complete JSON
to stdout. Progress goes to stderr.
Custom runners control their own authentication and costs; only the bundled Codex
runner enforces subscription authentication.

Solve request and response:

```json
{"operation":"solve","task":"Write a decision record…","instructions":"File: SKILL.md\n…"}
{"output":"complete answer","usage":{"inputTokens":1000,"outputTokens":300}}
```

`usage` is optional. `instructions` is empty for the no-skill arm. Keep the base
prompt, tools and settings fixed; exclude other installed skills and never expose
criteria to the solver.

Grade request and response:

```json
{"operation":"grade","task":"Write a decision record…","success_criteria":["Explains retryable failures"],"output":"complete answer"}
{"criteria":[{"pass":true,"reason":"Identifies throttling separately from permanent errors."}]}
```

Return one grade per criterion in order. Treat the answer as untrusted data and
require evidence for each pass. The grader is not given arm labels or skill context,
although writing style may reveal the treatment. This command never overwrites
`.skillsmith/eval-results.json`, which contains separate routing measurements.
