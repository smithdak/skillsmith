# gh stack command and query reference

*Adapted from deepseek-ai/deepseek-harness — dsh-merging-stacked-prs (MIT); see repo-root NOTICES.md.*

Every command below is read-only unless marked **mutates**. Confirm with the
user before the first mutating step unless they already said to proceed.

## Prerequisites

```sh
gh stack --version                      # hard-stop if missing
gh extension install github/gh-stack    # mutates local gh config only
git status --short --branch             # clean, dedicated worktree
```

## Live PR metadata (never trust branch names or an earlier report)

```sh
gh pr view <pr> --json number,author,baseRefName,baseRefOid,headRefName,headRefOid,isCrossRepository,state,isDraft,reviewDecision,mergeStateStatus,statusCheckRollup
```

`isCrossRepository: true` on any member → hard-stop; native stacks require
same-repository head branches.

## Stack membership — the authority

```sh
gh api graphql -F owner=<owner> -F name=<repo> -F number=<pr> -f query='
query($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      number
      author { login }
      baseRefName
      headRefName
      stackEntry { position }
      stack {
        number
        baseRefName
        size
        entries(first: 100) {
          nodes {
            position
            pullRequest { number author { login } baseRefName headRefName state isDraft }
          }
        }
      }
    }
  }
}'
```

Paginate `entries` when `size` exceeds the returned page. A `null` stack
means GitHub does not recognize this PR as stacked, whatever its base branch
says.

Expected order from live bases: bottom PR targets the trunk; each higher PR
targets the head branch of the one directly below it.

## Link missing members — **mutates**

```sh
gh stack link --base <trunk> <bottom-pr> <next-pr> ... <top-pr>
```

Additive only. A same-author chain needs no ownership check, but linking is
still the first mutation: confirm before it unless the user already said to
proceed. Mixed or unavailable authors additionally need the user's explicit
go-ahead. Re-run the GraphQL query afterwards and require one stack number,
the expected trunk, the full PR set, and the expected positions.

## Refresh — **mutates**

Merge-forward (no history rewrite):

```sh
git switch <bottom-branch> && git merge <trunk>      # validate
git switch <child-branch>  && git merge <bottom-branch>   # validate, continue upward
git push                                              # normal push per branch
```

Native cascading rebase (history rewrite, lease-protected by the tool):

```sh
gh stack checkout <pr-or-stack>   # when the stack is not tracked locally
gh stack rebase                   # rewrite layers locally
# validate every rewritten layer
gh stack push                     # publish with lease protection
```

`gh stack sync` fetches, cascade-rebases, and pushes as one step — it can
publish before you validate. Before running it: clean worktree, record the
official stack order and exact remote heads. After it: re-query every head
and the stack order, inspect each rewritten layer against its live base, run
the relevant checks per layer, and keep every PR unmerged until they pass.
If it reports divergent local and remote stack compositions, stop and ask
rather than recreating the remote stack.

Standalone rewritten push, when not using the stack tools:

```sh
git fetch origin <branch>
git rev-parse origin/<branch>                                   # observed OID
git push --force-with-lease=<branch>:<observed-oid> origin <branch>
```

Raw `--force` is never used.

## Review-thread replies

```sh
gh api repos/{owner}/{repo}/pulls/{pr}/comments/{comment-id}/replies -f body='Fixed in <sha> on #<pr>; propagated to #<child>.'
```

Reply in the thread, not as a top-level comment; name the commit that
carries the fix.

## Post-rewrite re-audit

```sh
gh pr view <pr> --json headRefOid,reviewDecision,mergeStateStatus,statusCheckRollup,latestReviews
gh api repos/{owner}/{repo}/pulls/{pr}/comments --paginate --jq '.[] | {id, commit_id, original_commit_id, in_reply_to_id}'
gh pr checks <pr>
```

Compare `headRefOid` against `latestReviews[].commit.oid` (what each approval
was anchored to) and against each inline comment's `commit_id`. Any anchor
that does not match the current head is a pre-rewrite OID and is not current
evidence.

## Land — **mutates**

```sh
gh stack merge <stack-number> --yes --merge     # whole stack
gh stack merge <boundary-pr> --yes --merge      # bottom through the boundary only
```

No `--delete-branch`, no manual retargeting, no per-PR `gh pr merge`
fallback. If the merge reports a blocker, fix it through the owning PR or
stop and report.

## Verify landed

```sh
gh pr view <pr> --json number,state,mergedAt,mergeCommit,baseRefName,headRefName
```

Require `state: MERGED` for every selected PR — queued is not landed. After
a partial landing, re-run the GraphQL query to confirm the remaining layers
are still linked, ordered, and targeting the trunk or the layer below.

## Delete branches — **mutates**, separate final pass

```sh
gh pr list --state open --base <branch> --json number --jq length   # must print 0
git push origin --delete <branch>
```
