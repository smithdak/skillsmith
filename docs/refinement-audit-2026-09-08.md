# Initial skill refinement audit — 2026-09-08

This records the first body-refinement pass against source commit `efb6270`.
The later docs-craft reference pass is covered in the [docs pilot](../benchmarks/results/docs-quality-2026-09-08.md).
Counts below are historical, exclude reference files, and use whitespace-delimited words.
Proposed behavioral checks are coverage targets; listing one does not claim it passed.

**Combined body length: 26,577 → 14,473 words (45.5% reduction).**
All 39 skills remained experimental. Descriptions and routing cases were preserved.

## [api-design](../skills/engineering/api-design/SKILL.md)

1431 → 367 body words. Consumer/error decisions; corrected event rollout compatibility.

**Behavioral check:** Old and new consumers coexist through a schema change.

## [architecture-review](../skills/engineering/architecture-review/SKILL.md)

1386 → 368 body words. Evidence-ranked findings; removed report quotas.

**Behavioral check:** An import cycle is separated from an intentional adapter.

## [architecture-spec](../skills/engineering/architecture-spec/SKILL.md)

400 → 423 body words. Continue from known decisions; optional visual fallback.

**Behavioral check:** Draft a spec without repeatedly confirming settled choices.

## [codebase-survey](../skills/engineering/codebase-survey/SKILL.md)

401 → 303 body words. Bounded inventory; sequential fallback for missing agents.

**Behavioral check:** Map a repository with no delegation tool.

## [decision-record](../skills/engineering/decision-record/SKILL.md)

636 → 345 body words. One choice, actual driver and revisit trigger.

**Behavioral check:** Retry decision honors retention and failure constraints.

## [deep-modules](../skills/engineering/deep-modules/SKILL.md)

462 → 293 body words. Small boundary backed by concrete complexity.

**Behavioral check:** Hide storage details without adding speculative abstractions.

## [deep-research](../skills/engineering/deep-research/SKILL.md)

457 → 316 body words. Evidence synthesis; optional parallel investigators.

**Behavioral check:** Resolve conflicting primary evidence without invented consensus.

## [diagnose-bugs](../skills/engineering/diagnose-bugs/SKILL.md)

845 → 375 body words. Discriminating experiment and demonstrated mechanism.

**Behavioral check:** Repair overlapping request state without serializing callers.

## [doc-visuals](../skills/engineering/doc-visuals/SKILL.md)

408 → 433 body words. Installed resource paths and safe documentation examples.

**Behavioral check:** Render useful diagrams without executing destructive examples.

## [failure-mode-analysis](../skills/engineering/failure-mode-analysis/SKILL.md)

1295 → 361 body words. Qualitative uncertainty and discriminating mitigations.

**Behavioral check:** Identify duplication and overload hazards in a queue.

## [falsification-review](../skills/engineering/falsification-review/SKILL.md)

508 → 516 body words. Strongest countercase; independent reviewer optional.

**Behavioral check:** Name the crux even when no subagent is available.

## [feature-spec](../skills/engineering/feature-spec/SKILL.md)

337 → 239 body words. Reuse context and testable behavior; adaptive template.

**Behavioral check:** Produce a buildable spec without re-interviewing the user.

## [frontend-craft](../skills/engineering/frontend-craft/SKILL.md)

1043 → 386 body words. Brief-led craft and observed responsive behavior.

**Behavioral check:** Build a distinctive interface that follows an explicit design brief.

## [frontend-critique](../skills/engineering/frontend-critique/SKILL.md)

634 → 322 body words. Evidence-linked review with no changes applied.

**Behavioral check:** Report actionable defects while respecting audit-only scope.

## [frontend-redesign](../skills/engineering/frontend-redesign/SKILL.md)

683 → 332 body words. Small high-value changes; preserve behavior.

**Behavioral check:** Improve a screen while preserving navigation and form behavior.

## [grilling](../skills/engineering/grilling/SKILL.md)

638 → 321 body words. Resolve material unknowns without an interrogation quota.

**Behavioral check:** Stop asking once decisions and explicit unknowns suffice.

## [ground-truth-research](../skills/engineering/ground-truth-research/SKILL.md)

504 → 298 body words. Verify the load-bearing volatile claim.

**Behavioral check:** Use current primary evidence and state unavailable facts.

## [hardening-proposal](../skills/engineering/hardening-proposal/SKILL.md)

530 → 561 body words. Decision-ready options and inline review fallbacks.

**Behavioral check:** Compare mitigations without requiring companion installations.

## [information-architecture](../skills/engineering/information-architecture/SKILL.md)

750 → 314 body words. Audience tasks drive structure.

**Behavioral check:** Reorganize content while preserving destinations and findability.

## [migration-plan](../skills/engineering/migration-plan/SKILL.md)

1503 → 413 body words. Verified phases and rollback boundaries.

**Behavioral check:** Recognize the point where rollback requires data reconciliation.

## [postmortem](../skills/engineering/postmortem/SKILL.md)

756 → 328 body words. Evidence timeline and failed safety nets.

**Behavioral check:** Explain mechanism without inventing timeline events or blame.

## [premortem](../skills/engineering/premortem/SKILL.md)

711 → 341 body words. Failure story to warning signal and response.

**Behavioral check:** Expose retry, privacy and expiry risks in an export plan.

## [prose-hygiene](../skills/engineering/prose-hygiene/SKILL.md)

1037 → 346 body words. Current facts, scope and durable explanations.

**Behavioral check:** Remove session narration while retaining causal context.

## [readme-authoring](../skills/engineering/readme-authoring/SKILL.md)

658 → 335 body words. Newcomer evaluation, installation and first success.

**Behavioral check:** Document commands that work from a clean checkout.

## [research-note](../skills/engineering/research-note/SKILL.md)

306 → 313 body words. Durable primary citations; independent work optional.

**Behavioral check:** Land a useful note when parallel tools are unavailable.

## [retrofit-tests](../skills/engineering/retrofit-tests/SKILL.md)

534 → 278 body words. Characterize current seams before changing behavior.

**Behavioral check:** Pin a legacy behavior without laundering a defect into a requirement.

## [second-order-effects](../skills/engineering/second-order-effects/SKILL.md)

569 → 585 body words. Explicit hypothetical chains and competing equilibria.

**Behavioral check:** Explain actor adaptation without presenting speculation as fact.

## [security-diff-review](../skills/engineering/security-diff-review/SKILL.md)

494 → 313 body words. Changed boundary, exploit path and sibling sweep.

**Behavioral check:** Find the unguarded preview sibling after a helper loses tenant filtering.

## [skill-authoring](../skills/engineering/skill-authoring/SKILL.md)

809 → 409 body words. One capability, small body, evidence and portability.

**Behavioral check:** Produce a standalone skill with an observable quality check.

## [tdd](../skills/engineering/tdd/SKILL.md)

442 → 288 body words. One observed red-green slice at a time.

**Behavioral check:** Implement price totals with meaningful tests before each change.

## [threat-model](../skills/engineering/threat-model/SKILL.md)

563 → 318 body words. Assets, trust boundaries and concrete attacker stories.

**Behavioral check:** Trace a reachable cross-tenant attack to an affected asset.

## [webapp-testing](../skills/engineering/webapp-testing/SKILL.md)

716 → 366 body words. Observable readiness and real browser assertions.

**Behavioral check:** Verify a delayed UI without relying on network idle.

## [wizard](../skills/engineering/wizard/SKILL.md)

1077 → 477 body words. Executable procedure with validation and recovery.

**Behavioral check:** Generate a wizard that handles invalid input and preserves secrets.

## [cold-read](../skills/productivity/cold-read/SKILL.md)

467 → 481 body words. Fresh-reader check; preserve review-only scope.

**Behavioral check:** Find an action blocker without silently editing the document.

## [communication-contract](../skills/productivity/communication-contract/SKILL.md)

702 → 332 body words. Direct outcomes and evidence over status ceremony.

**Behavioral check:** Report partial failure plainly and continue authorized work.

## [define-work-items](../skills/productivity/define-work-items/SKILL.md)

363 → 411 body words. Ready means testable; reuse tracker conventions.

**Behavioral check:** Write implementable criteria without posting to a tracker implicitly.

## [handoff](../skills/productivity/handoff/SKILL.md)

390 → 408 body words. Actionable state and clear next step.

**Behavioral check:** Resume work with no access to the authoring conversation.

## [instructions-setup](../skills/productivity/instructions-setup/SKILL.md)

458 → 511 body words. Reuse authorization; resource paths from installation.

**Behavioral check:** Apply the requested managed block without a second approval loop.

## [writing-for-agents](../skills/productivity/writing-for-agents/SKILL.md)

674 → 347 body words. Repository-derived conventions and exact commands.

**Behavioral check:** Write useful agent instructions without restating generic advice.
