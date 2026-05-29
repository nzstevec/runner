## ADDED Requirements

### Requirement: Runner dependencies avoid targeted deprecated packages
The runner package MUST constrain dependencies so installs do not resolve to `whatwg-encoding@3.1.1` or `json-schema-ref-parser@6.1.0`.

#### Scenario: Deterministic encoding path
- **WHEN** runner dependencies are installed from the published package metadata
- **THEN** the resolved dependency tree does not include `whatwg-encoding@3.1.1`

#### Scenario: Parser path remains maintained
- **WHEN** runner dependencies are installed
- **THEN** parser resolution uses maintained `@apidevtools/json-schema-ref-parser` and does not include deprecated `json-schema-ref-parser@6.1.0`

### Requirement: Runner behavior remains compatible after dependency constraint updates
The project MUST preserve existing runner behavior after dependency hygiene changes.

#### Scenario: Runner tests remain green
- **WHEN** dependency constraints and lockfile updates are applied
- **THEN** existing runner tests pass without regressions
