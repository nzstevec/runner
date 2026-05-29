## ADDED Requirements

### Requirement: Step log emits before step execution
Runner MUST support optional step `log` values and emit the log output event before running the step action.

#### Scenario: Log emitted before step action
- **WHEN** a step includes a non-empty `log` value
- **THEN** runner MUST emit log output before step execution

### Requirement: Step log supports template rendering
Runner MUST render templates inside step `log` values using standard step context.

#### Scenario: Templated log resolves with context
- **WHEN** a step log includes template expressions
- **THEN** emitted log output MUST contain resolved values from context
