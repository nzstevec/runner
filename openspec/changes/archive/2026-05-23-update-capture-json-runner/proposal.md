## Why

Step workflows can capture response JSON, but there is no first-class way in the runner to derive a modified capture object by updating existing keys or adding new key-value pairs. Users who need this flow today must work around it in later steps, which is fragile and difficult to validate.

## What Changes

- Add workflow syntax to define capture JSON updates (override existing keys and add new keys).
- Ensure update values can be sourced from templates, including env, captures, secrets, and testdata references.
- Define deterministic path semantics for nested JSON updates.
- Make updated capture objects available to subsequent steps in the same test execution.
- Add validation and clear errors for invalid update paths or unsupported value shapes.

## Capabilities

### New Capabilities
- `capture-json-update`: support creating a new capture object from an existing captured JSON value by applying key/path updates before reuse.

### Modified Capabilities
- None.

## Impact

- Runner behavior: capture extraction and merge logic for update operations.
- Types/schema exposure: step capture definitions need the new update fields.
- Tests: cover update, validation, and lifecycle behavior.
- Docs/examples in the consumer repo should reference the new syntax.
