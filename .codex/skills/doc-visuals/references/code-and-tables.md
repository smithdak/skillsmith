# Examples and tables that do useful work

## A code example has a starting point and an observable result

State the working directory, runtime, installation and input needed for the example.
Keep setup next to first use. A clone-based workflow needs the clone and directory
change; a package workflow needs an actual published package. Show one path first,
then alternatives if the reader needs them. Do not imply that a repository name is
an installable package.

Use language-tagged fences. Commands intended for copying exclude prompt characters
and captured output. Put expected output in a separate `text` fence, with “Expected
output” for an illustrative result or “Observed output” only after executing it.
Do not splice timing or logs from different commands into a single apparent run.

Supply small complete input rather than `your-file.json` with no schema or source.
A snippet may be a fragment if its insertion point and surrounding context are
explicit; do not call it a runnable program. Avoid ellipses inside copyable code.
Use environment variables or clearly described placeholders where real credentials
are required, never plausible secrets. Call out external effects next to the command.
Do not execute those effects merely to verify documentation.

Prefer readable flags when their long forms exist. Do not invent a long option for
an interface that only supports a short one. Use `diff` for a patch the reader must
understand, and clean code for a result they should paste. When documenting fenced
Markdown itself, use a longer outer fence so the example remains intact.

## Worked example: prove the transformation

For this invented line-counting CLI, assume `linecount` is installed. A weak example
asks readers to imagine both the input and result:

```sh
linecount YOUR_FILE
```

A stronger example makes the operation observable:

```sh
printf 'alpha\nbeta\n' > sample.txt
linecount sample.txt
```

Expected output:

```text
2 lines
```

Replace these invented commands with the actual project's interface. In real docs,
verify empty input, existing output-file behavior or other boundary conditions only
when they affect the reader's next step. An example should teach the common path,
not reproduce the entire test suite.

## Tables are for shared attributes and choices

Choose the lookup key for the left column: an option, task, state, or file. Compare
rows on the same dimensions and put units in numeric headers. Write unknown or not
applicable instead of leaving ambiguous blanks. Short sentences are useful when
they express a distinction; wrapping is a layout concern, not a forbidden syntax.

A table becomes weak when rows contain unrelated essays or all cells repeat the
same benefit. Split independent comparisons, move nuanced explanations into prose,
or use a list with bold scan keys. Do not strip the deciding tradeoff just to keep
cells short. Numeric columns should support comparison, not imply unsupported
precision.

An unhelpful feature table:

| Feature | Description |
|---|---|
| Preview | Preview changes |
| Apply | Apply changes |

A decision table answers a real question:

| Mode | Writes files? | Choose it when… |
|---|---|---|
| Preview | No | You want to inspect the proposed changes. |
| Apply | Yes | You have reviewed the preview and want to update files. |

This is an invented example; verify the actual write behavior before using a table
like it. A consequential limitation belongs in the relevant row or adjacent prose.

## Render check

Use the target renderer to inspect the narrowest useful layout. Avoid fixed column
widths and paragraphs inside pipe tables. Escape literal pipes in GFM table cells,
including code spans. Test long command/path wrapping rather than assuming it will
fit. Keep explanatory prose outside code blocks, accessible as normal text.

Check copied examples from the stated starting state when safe. Preserve distinctions
between verified syntax, executed commands, and expected results. Reference:
[GitHub fenced-code behavior](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-and-highlighting-code-blocks).
