## Why

Runner owns execution behavior for test selection, so default semantics when no test filter is provided must be explicitly guaranteed. The behavior contract should stay aligned with StepCI docs and help text to avoid drift between CLI messaging and runtime behavior.

## What Changes

- Clarify and enforce runner behavior: when no test filter is provided, all named tests execute.
- Add regression coverage for default-all-tests behavior and `--test` filtering behavior.
- Mirror documentation-oriented capability deltas so cross-repo specs stay in sync with StepCI.

## Capabilities

### New Capabilities

- `run-test-filter`: define runner behavior for optional single-test filtering and default-all-tests execution when absent.
- `workflow-log`: define runner behavior for step `log` output timing and template resolution.

### Modified Capabilities

- None.

## Impact

- `src/index.ts`: execution selection logic defaults and guardrails.
- `tests/test.ts`: explicit tests for no-filter runs and filtered runs.
- Runner OpenSpec specs: mirrored deltas to align with StepCI change.
