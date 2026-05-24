## ADDED Requirements

### Requirement: Runner supports step log output
Runner MUST support an optional `log` string field on workflow steps and emit a `step:log` event before running the step action.

#### Scenario: Log emitted before step action
- **WHEN** a step includes a `log` string
- **THEN** runner MUST emit `step:log` before executing the step action

#### Scenario: Log uses template resolution
- **WHEN** the `log` field includes template expressions
- **THEN** runner MUST resolve templates using the standard step context before emission

#### Scenario: Absent log field does nothing
- **WHEN** a step has no `log` field
- **THEN** runner MUST not emit `step:log` for that step
