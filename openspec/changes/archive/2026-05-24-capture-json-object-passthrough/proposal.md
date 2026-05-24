## Why

Workflows that capture a full JSON object cannot pass that object directly into later HTTP `json` payloads — every field must be remapped manually. This makes common mutation-and-reuse flows verbose and error-prone, especially when objects are large or change shape frequently.

## What Changes

- Preserve object values (objects, arrays, scalars) through full-template expressions so captured objects flow through templating without string coercion.
- Allow full-object pass-through from captures into request JSON payloads (e.g., `json: ${{captures.thebody}}`).
- Define deterministic behavior for object pass-through in templating across all value shapes: scalars, arrays, and objects.
- Ensure capture update results can be reused as complete objects in subsequent steps without explicit field mapping.
- Add validation and actionable errors when a pass-through target is incompatible (e.g., non-JSON-serializable values).

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `capture-json-update`: extend requirements so updated capture objects can be passed as complete objects into later request JSON payloads, without explicit field-by-field mapping.

## Impact

- Runner templating and request construction paths for HTTP JSON payloads.
- Capture lifecycle behavior where updated captures are reused in subsequent steps.
- Workflow schema, documentation, and examples to cover full-object pass-through semantics and supported value shapes.
- Backward compatibility for existing string-template behavior in non-object fields must be preserved.
