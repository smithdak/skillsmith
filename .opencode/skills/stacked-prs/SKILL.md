---
name: "stacked-prs"
description: "Lands, reviews, and propagates review fixes across a stack of dependent GitHub PRs (A ← B ← C) with the official gh stack extension: reads PullRequest.stack via GraphQL as the membership authority, links missing members, chooses merge-forward versus sync, rebase, and push deliberately, fixes each review finding on the PR that introduced it and carries it up-stack with lease-protected pushes, re-audits threads, approvals, and checks after every rewrite, merges the range, verifies MERGED, and deletes branches only once no open PR bases on them. Use this skill when the user says \"land this PR stack\", \"merge #412 through #414 in order\", \"the reviewer found a bug in the middle PR — fix it and carry it up\", \"sync my stacked branches after main moved\", or \"which PRs are in this stack\". Not for a lone PR that is not part of a stack — opening it, merging it when CI passes, reviewing it for bugs (built-in /code-review) — nor security review of a diff (security-diff-review), issue triage, or handoff notes."
license: "MIT"
metadata:
  skillsmith-invocation: "user"
  skillsmith-maturity: "experimental"
  skillsmith-see-also: "security-diff-review"
---

# stacked-prs

*Adapted from deepseek-ai/deepseek-harness — dsh-merging-stacked-prs and the stacked-PR review cookbook (MIT); see repo-root NOTICES.md.*

A stack of dependent PRs has one owner of its ordering, retargeting, and
merge state: GitHub's native stack object. Work through it — `gh stack` and
the `PullRequest.stack` GraphQL field — instead of reproducing stack
semantics by hand with `gh pr merge` and `gh pr edit`. Hand-rolled landing
is where stacks go wrong: a middle PR merged out of order, a dependent
silently retargeted to a deleted branch, a review fix that never reached the
layer a reviewer actually looked at.

## Require native stack support

Run `gh stack --version` before touching GitHub state. If the extension is
missing, stop and offer `gh extension install github/gh-stack`; do not fall
back to merging and retargeting PRs one at a time. Stacks require every head
branch in the same repository — hard-stop on a cross-fork chain.

Work in a clean, dedicated worktree. Fetch live PR metadata and exact head
OIDs rather than trusting branch names or an earlier report; the exact
commands and the GraphQL query are in
[references/gh-stack-commands.md](references/gh-stack-commands.md).

## Establish the stack from GitHub, not branch names

Query `PullRequest.stack` and `stackEntry.position` for at least one PR in
the apparent chain. A chain of base branches *suggests* a stack; only the
stack object *proves* GitHub recognizes it. Derive the expected bottom-to-top
order from live bases — the bottom targets the trunk, each higher PR targets
the head branch directly below — and compare it with what GitHub reports.

When the stack object shows an order-preserving subset of the requested
chain, the rest can be linked. Multiple stack numbers, an unexpected entry,
or a conflicting order need the user's direction before any mutation.

## Link missing members

When a dependent PR is not yet in the official stack, compare every
`author.login`. All the same author → the chain is safe to link bottom-to-top
with `gh stack link --base <trunk> <bottom> … <top>`, though linking is still
the first mutation and needs the user's confirmation unless they already said
to proceed. Mixed or unavailable authors → additionally ask before changing
GitHub state. Re-query afterwards and require
one stack number, the expected trunk, the complete PR set, and the expected
positions. Never dissolve, reorder, or rebuild an existing stack
automatically; `gh stack link` is additive, and merged or queued entries
cannot be unstacked.

## Place review fixes where the issue was introduced, then propagate up

1. Triage each review comment on the merits — verify the claim against the
   code. A reviewer who flagged the right symptom can still misdiagnose the
   cause.
2. Map each accepted finding to the PR that *introduced* the code and fix
   it there, even if a higher PR also carries the file. Fixing downstream
   leaves the lower PR shipping the defect and hides the fix from its
   reviewer.
3. Propagate through every affected child in order, by one of two allowed
   histories chosen deliberately:
   - **Merge-forward**: merge the fixed parent into its child, validate,
     continue upward.
   - **Native cascading rebase**: `gh stack rebase`, validate the rewritten
     layers, publish with `gh stack push` — or `gh stack sync`, which may
     publish *before* you can validate, so validate every rewritten layer
     immediately afterwards and treat nothing as ready until it passes.
4. Keep each review fix a distinct commit. A rebase may change its OID;
   never amend a reviewed fix out of history. Amend only your own unpushed,
   unreviewed work.
5. Reply in the review thread (not a top-level comment) naming the fix and
   the commit that carries it.

## Refresh only when needed, and re-audit after any rewrite

Do not rewrite branches just because a refresh mechanism exists. When the
merge state or repository rules require an updated trunk, use merge-forward
or the native rebase above. Every rewritten push is lease-protected
(`--force-with-lease=<branch>:<observed-oid>`, or the lease `gh stack push`
and `gh stack sync` apply); raw `--force` is never used, and a push that
would overwrite a concurrently advanced remote head aborts instead.

A rewrite invalidates every prior commit OID and inline-comment anchor. After
it, re-fetch exact heads and re-audit unresolved threads, approvals,
mergeability, and checks — an approval on a commit that no longer exists is
not current evidence.

## Land

Re-query the stack immediately before merging. Every selected PR must be
open, non-draft, in the expected order, and compliant with review and check
requirements — judged independently, since a ready top layer proves nothing
about its dependencies.

"Land the stack" means the whole stack: `gh stack merge <stack-number>
--yes --merge`. A partial landing needs an explicit boundary PR and merges
every layer from the bottom through it: `gh stack merge <boundary-pr>
--yes --merge`. Do not pass `--delete-branch`, retarget dependents by hand,
or issue per-PR merge commands; GitHub merges bottom-up and retargets the
remaining layers. A stack merge is all-or-nothing; with a merge queue the
range is queued together but may land in separate groups.

If the native merge reports a blocker, resolve it through the owning PR or
stop and report — never bypass with `gh pr merge`.

## Verify the landed state

Wait until every selected PR reports `MERGED`; queued is not landed. After a
partial landing, re-query the stack and confirm the remaining PRs are still
linked in order and target the trunk or the layer below, then re-check their
heads, review state, and CI — GitHub may have rebased them.

Delete branches only in a separate final pass, only after the corresponding
PR is `MERGED`, and only when `gh pr list --state open --base <branch>`
returns zero. Anything else blocks deletion.

## Boundaries

- Link, push, rebase, sync, merge, and branch deletion change shared state.
  Confirm with the user before the first mutation unless they already said
  to proceed; report each mutation as it happens.
- A single PR — opening it, merging it, reviewing it — is not this skill.
  Security review of a diff is `security-diff-review`.
- Never act on a report of what a sub-agent or earlier session did to the
  stack; re-query GitHub. Trust the live state, not the narrative.

## Verify before returning

Every fixed PR's current diff contains the correction at the layer that
introduced the issue. GraphQL reports one official stack in the expected
order, and each child's diff against its parent shows only that child's
changes. Unresolved threads, approvals, mergeability, and checks were
re-audited after the last rewritten push. Every PR reported as landed
reports `MERGED`, and no deleted branch was still the base of an open PR.
