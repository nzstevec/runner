## 1. Default Test Selection Semantics

- [x] 1.1 Verify runner executes all named tests when no test filter option is provided
- [x] 1.2 Add/adjust regression tests to lock default-all-tests behavior
- [x] 1.3 Ensure unknown selected test names continue to fail with actionable errors

## 2. Filter and Log Capability Alignment

- [x] 2.1 Validate `run-test-filter` scenarios against current runner behavior
- [x] 2.2 Validate `workflow-log` event emission timing (before step execution)
- [x] 2.3 Validate templated `log` messages resolve with runtime context

## 3. Cross-Repo Coordination

- [x] 3.1 Keep StepCI and Runner OpenSpec capability/scenario wording aligned for `run-test-filter`
- [x] 3.2 Keep StepCI and Runner OpenSpec capability/scenario wording aligned for `workflow-log`
- [x] 3.3 Document any remaining implementation deltas that must be released in order (runner first, then StepCI)
