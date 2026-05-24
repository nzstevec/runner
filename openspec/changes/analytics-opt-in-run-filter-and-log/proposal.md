## Why

StepCI needs to execute a single named test with `--test` and emit workflow-authored log lines from steps. Both behaviors are runner responsibilities because test selection and step execution happen inside the runner.

## What Changes

- Add runner support for selecting a single test by name via workflow options.
- Return an actionable error when a requested test name does not exist.
- Add optional `log` field to step model and emit a `step:log` event before step execution.
- Ensure `log` values are templated with existing context (`captures`, `env`, `secrets`, `testdata`).

## Capabilities

### New Capabilities

- `run-test-filter`: Runner can execute only one named test when requested by caller options.
- `workflow-log`: Runner step supports `log` output event before executing step action.

### Modified Capabilities

- `capture-json-update`: No requirement change.

## Impact

- `src/index.ts`: workflow options, test-selection logic, and step-level log event emission.
- `tests/test.ts`: new tests for test filtering, missing test errors, and log event output.
- StepCI CLI integration relies on these runner-side contracts.
