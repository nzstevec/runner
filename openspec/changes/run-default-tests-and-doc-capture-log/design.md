## Context

Runner controls actual test selection behavior. This change ensures the contract is explicit: without a filter, all named tests run; with a filter, only matching test runs. Runner also needs explicit capability specs for step-level `log` behavior to align with StepCI docs and expected output ordering.

## Goals / Non-Goals

**Goals:**
- Guarantee default behavior: no filter means all tests execute.
- Preserve targeted filter behavior and actionable errors for unknown test names.
- Define/verify step `log` behavior and template resolution contract.

**Non-Goals:**
- Introducing multi-test filter patterns.
- Changing the event model beyond documenting and validating existing behavior.

## Decisions

- Add spec requirements and tests for default-all-tests execution without filter.
- Keep unknown test handling actionable and explicit.
- Keep `step:log` pre-step emission with rendered template context.

## Risks / Trade-offs

- [Risk] Requirement may duplicate existing behavior and feel redundant.
  → Mitigation: Keep as regression spec to prevent accidental behavior drift.
- [Risk] Divergence from StepCI docs if only one repo is updated.
  → Mitigation: Mirror capability names and scenarios in both repos.
