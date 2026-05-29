## ADDED Requirements

### Requirement: Runner executes all tests when no filter is provided
Runner MUST execute all named tests from `workflow.tests` when no explicit test filter option is provided.

#### Scenario: All tests run by default
- **WHEN** runner is invoked without a test filter option
- **THEN** all named tests in `workflow.tests` MUST execute

### Requirement: Runner executes only selected test when filter is provided
Runner MUST execute only the named test when a filter option is provided.

#### Scenario: Selected test runs exclusively
- **WHEN** runner is invoked with test filter `beta`
- **THEN** only `workflow.tests.beta` MUST execute

#### Scenario: Unknown selected test fails
- **WHEN** runner is invoked with a test filter that does not exist
- **THEN** runner MUST fail with an actionable error including the missing name
