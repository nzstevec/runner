## ADDED Requirements

### Requirement: Full-object capture pass-through in JSON payloads
The workflow runner MUST preserve the original type of a resolved value when a template expression constitutes the entire value of a field — that is, the field value is exactly `${{expr}}` with no surrounding content. When such an expression resolves to an object or array, the runner MUST use the raw resolved value rather than coercing it to a string.

#### Scenario: Captured object passed as full JSON body
- **WHEN** a step's `json` field is set to a pure-template expression (e.g., `json: ${{captures.body}}`) and the referenced capture holds a JSON object
- **THEN** the request MUST be sent with the captured object serialised as the full JSON body, equivalent to having declared the object fields inline

#### Scenario: Updated capture object passed as full JSON body
- **WHEN** a step applies capture updates to an existing captured JSON object and a later step's `json` field references that updated capture via a pure-template expression
- **THEN** the request MUST be sent with the fully updated capture object as the JSON body, without requiring explicit field mapping

#### Scenario: Captured array passed as full JSON body
- **WHEN** a step's `json` field is set to a pure-template expression and the referenced capture holds a JSON array
- **THEN** the request MUST be sent with the array serialised as the top-level JSON body

#### Scenario: Captured scalar passed as pure-template field
- **WHEN** a step's `json` field is set to a pure-template expression and the referenced capture holds a scalar value (string, number, boolean, or null)
- **THEN** the runner MUST use the scalar value as-is; strings MUST NOT be double-serialised

### Requirement: Mixed-content template string coercion is unchanged
The runner MUST continue to coerce template expression values to strings when the field value contains content beyond the template expression itself.

#### Scenario: Mixed-content string template resolves to string
- **WHEN** a field value contains a template expression alongside other characters (e.g., `"prefix-${{captures.name}}-suffix"`)
- **THEN** the resolved value MUST be coerced to a string and the surrounding content concatenated, regardless of the underlying type of the captured value

### Requirement: Validation for non-JSON-serialisable pass-through values
The workflow runner MUST fail the step with an actionable error when a pure-template expression in a `json` field resolves to a value that cannot be serialised to JSON.

#### Scenario: Unresolved capture reference in json field
- **WHEN** a step's `json` field contains a pure-template expression and the referenced capture is not set (resolves to `undefined`)
- **THEN** the step MUST fail and report an actionable error identifying the unresolved expression

#### Scenario: Non-serialisable value in json field
- **WHEN** a step's `json` field contains a pure-template expression and the resolved value cannot be serialised to JSON (e.g., a function or circular reference)
- **THEN** the step MUST fail and report an actionable error describing the type and field
