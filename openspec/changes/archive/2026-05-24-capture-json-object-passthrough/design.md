## Context

The runner uses `liquidless` (`renderObject`) to template the entire step object before execution. `liquidless` traverses all string values and calls `renderString`, which replaces every `${{expr}}` occurrence via regex substitution, coercing all resolved values to strings via JavaScript's default `toString()`. This means a capture holding a full JSON object (`{ id: 1, name: "alice" }`) becomes `"[object Object]"` when referenced as `json: ${{captures.body}}`.

The `json` field in `HTTPStep` is typed as `object` and serialised with `JSON.stringify`. For full-object pass-through to work, the raw value must reach the serialiser without string coercion.

## Goals / Non-Goals

**Goals:**
- Allow a string value that is exactly one template expression (e.g., `${{captures.body}}`) to resolve to the raw JavaScript value — preserving objects, arrays, numbers, booleans, and null.
- Enable `json: ${{captures.body}}` to send the captured object as the full request body.
- Define deterministic behaviour when the resolved value is a scalar, array, or object.
- Add validation that fails the step with an actionable error when a pure-template expression resolves to a non-JSON-serialisable value (e.g., `undefined`, a function).
- Preserve all existing string-template behaviour for mixed-content strings (e.g., `"prefix-${{name}}-suffix"`).

**Non-Goals:**
- Changing how mixed-content string templates are resolved (string coercion continues as-is).
- Supporting object pass-through in non-JSON fields (e.g., `body`, `header` values, `url`).
- Deep merging of objects during pass-through (the value replaces the field wholesale).
- Supporting circular references or non-serialisable types silently.

## Decisions

### Decision 1: Pre-process pure-template values before `liquidless`

**Approach**: Before calling `renderObject`, walk the step object tree and identify string leaf values that are exactly one template expression — matching `/^\$\{\{(.+?)\}\}$/`. For each such value, resolve the expression against the template context and substitute the raw resolved value in place. After this pre-processing pass, call `renderObject` as before for remaining string values.

**Rationale**: `liquidless`'s `renderObject` only processes string values and passes non-strings through unchanged. By resolving pure templates to their raw types first, non-string values naturally pass through the subsequent `renderObject` call without coercion. This avoids forking or patching `liquidless`.

**Alternative considered**: Patch `liquidless` to detect pure-template strings and skip coercion. Rejected — it introduces an external dependency change and adds coupling between runner and template library internals.

**Alternative considered**: Post-process after `renderObject` to re-resolve fields. Rejected — by then the value has already been coerced to a string and the original type is lost.

### Decision 2: Resolve pure templates using the same flat-props lookup `liquidless` uses

`liquidless` flattens the props object (e.g., `captures.body` → flat key lookup). The pre-processing step must use the same resolution logic to ensure consistent behaviour. Extract the flat lookup into a shared utility, or replicate the lookup using the `flat` package already in the dependency tree.

### Decision 3: Validate pass-through values at the point of use

Rather than adding a generic validator in the pre-processing step, validate the resolved value where it is consumed:
- HTTP `json` field: after pre-processing, if the value is not `null`, a plain object, an array, or a JSON primitive, call `JSON.stringify` in a try/catch and throw an actionable error: `"json field resolved to a non-JSON-serialisable value: <type>"`.
- This keeps validation close to the consumer and avoids prematurely restricting which fields allow pass-through in the future.

### Decision 4: `HTTPStep.json` type widened to `any`

The TypeScript type `json?: object` must be widened to `json?: any` to accept the resolved runtime value after pre-processing. This is an internal type boundary only; the YAML schema and documentation continue to describe it as accepting an object or a full-template expression.

## Risks / Trade-offs

- **Pure-template regex false positives**: A value like `${{ captures.body }}` (with extra spaces) must still match. The regex must allow whitespace inside delimiters. → Use a non-greedy pattern with optional surrounding whitespace: `/^\$\{\{\s*(.+?)\s*\}\}$/`.
- **Nested object traversal**: The pre-processing walk must traverse nested objects and arrays without mutating the original step until all expressions are resolved. → Clone the step shallowly or use an immutable traversal pattern.
- **`undefined` pass-through**: If an expression resolves to `undefined` (capture not set), the current `liquidless` behaviour emits `"undefined"` as a string. The pre-processing step should preserve this: if the raw value is `undefined`, substitute the string `"undefined"` to maintain backward compatibility for string contexts, but for `json` field targets, emit an error.
- **Breaking change risk**: Low. Existing workflows that used `${{captures.obj}}` in a `json:` field would have produced `"[object Object]"` and failed at `JSON.stringify`. There are no valid workflows relying on the broken coercion behaviour.

## Open Questions

- Should pass-through be permitted for the `body` field (raw string body) when the resolved value is a string? This is already handled by string coercion and requires no change.
- Should array values be accepted at the top level of `json:`? (`json: ${{captures.list}}` where the capture is `[1,2,3]`.) → Treat as valid since JSON arrays are valid top-level payloads; `JSON.stringify` handles them.
