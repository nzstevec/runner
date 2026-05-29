## ADDED Requirements

### Requirement: Runner supports single named test selection
Runner MUST support selecting a single test by name via workflow options. When set, only the selected test MUST execute.

#### Scenario: Only selected test executes
- **WHEN** run is invoked with `tests` set to `example`
- **THEN** only `tests.example` MUST execute
- **THEN** all other tests MUST be excluded from execution

#### Scenario: Missing selected test fails
- **WHEN** run is invoked with `tests` set to a name not present in the workflow
- **THEN** runner MUST throw an actionable error
- **THEN** the error MUST include the missing name and available test names
