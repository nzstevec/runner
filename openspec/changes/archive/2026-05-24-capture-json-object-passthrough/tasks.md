## 1. Pure-Template Pre-Processing Utility

- [x] 1.1 Add a `isPureTemplate(value: string): boolean` helper that returns true when a string is exactly `${{expr}}` with optional surrounding whitespace (no other content)
- [x] 1.2 Add a `resolvePureTemplates(obj: object, context: object): object` function that walks an object/array tree, detects pure-template string values, resolves them to their raw context values using `flat`, and returns a new object with raw values substituted
- [x] 1.3 Write unit tests for `isPureTemplate` covering: exact match, leading/trailing whitespace inside delimiters, mixed-content strings, multi-expression strings, and non-template strings
- [x] 1.4 Write unit tests for `resolvePureTemplates` covering: object value substitution, array value substitution, scalar value substitution, nested object traversal, and unresolved (undefined) references

## 2. Step Render Pipeline Integration

- [x] 2.1 In `src/index.ts`, call `resolvePureTemplates(step, { captures, env, secrets, testdata })` before the existing `renderObject` call in the step execution path
- [x] 2.2 Verify that the existing `renderObject` call operates on the pre-processed step so mixed-content strings still resolve correctly via `liquidless`

## 3. HTTP Step Type and Validation

- [x] 3.1 Widen the `json` field type in `HTTPStep` from `json?: object` to `json?: any` in `src/steps/http.ts`
- [x] 3.2 In the HTTP step handler, before calling `JSON.stringify(params.json)`, validate that the resolved `json` value is not `undefined` — if undefined, throw an actionable error identifying the field and resolved value
- [x] 3.3 Wrap `JSON.stringify(params.json)` in a try/catch and rethrow with an actionable error message describing the type and field when serialisation fails

## 4. Tests

- [x] 4.1 Add an integration test (YAML workflow) that captures a full JSON object from a response and passes it as the complete `json:` body in a subsequent request using `json: ${{captures.body}}`
- [x] 4.2 Add an integration test that captures a JSON object, applies capture updates, and passes the updated object as a full `json:` body in the next step
- [x] 4.3 Add an integration test that verifies a captured JSON array is sent correctly as a top-level `json:` body
- [x] 4.4 Add an integration test that verifies mixed-content string templates (e.g., `"prefix-${{captures.name}}"`) continue to coerce to strings and are unaffected by the new pre-processing
- [x] 4.5 Add an integration test that verifies an undefined capture reference in a `json:` pure-template expression fails the step with an actionable error message
