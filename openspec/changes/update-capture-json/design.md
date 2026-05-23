## Context

StepCI already supports captures from HTTP and gRPC steps, and later steps can reference captures via templates. Today, workflows cannot declare a native transformation that updates selected fields in a captured JSON object while preserving the original structure. Users who need this pattern must emulate it through fragile workarounds or additional requests.

This change adds a first-class capture update capability in the runner so it can apply deterministic JSON mutations and expose the result as a normal capture for subsequent steps.

Constraints:
- Maintain backward compatibility for existing capture syntax.
- Keep behavior deterministic across protocols and step types.
- Preserve clear validation errors for invalid update definitions.

## Goals / Non-Goals

**Goals:**
- Add syntax to derive an updated JSON capture from an existing capture.
- Support both existing-key overrides and addition of new keys.
- Support nested updates through explicit dot-notation path syntax.
- Evaluate update values through existing templating semantics.
- Guarantee updated capture availability in subsequent steps of the same test run.

**Non-Goals:**
- Full JSON Patch or JSONPath mutation language support.
- Array-level patch semantics beyond direct replacement of a path target.
- Cross-test shared mutable capture state.
- Introducing new template object types.

## Decisions

1. Introduce explicit capture update block in workflow syntax.
- Decision: Add a dedicated update section under capture definitions rather than overloading existing capture selectors.
- Rationale: Keeps extraction and mutation responsibilities separate and easier to validate.
- Alternative considered: Implicit mutation when duplicate capture keys are declared; rejected due to ambiguity and hidden behavior.

2. Apply strict path conflict semantics.
- Decision: Update operations MUST fail when duplicate path entries are declared in the same update block.
- Rationale: Prevents ambiguous intent and avoids accidental overwrites that can hide workflow mistakes.
- Alternative considered: Last-write-wins ordering; rejected because silent conflict resolution can mask authoring errors.

3. Evaluate update values after source capture extraction and before capture storage.
- Decision: Runner computes base captured JSON, then resolves template expressions in update values, then applies updates, then stores final capture.
- Rationale: Ensures updates can reference env, captures, secrets, and testdata with predictable timing.
- Alternative considered: Evaluate templates at workflow parse time; rejected because runtime data is unavailable.

4. Restrict initial path syntax and update scope.
- Decision: Initial path syntax supports dot notation only (for example, `user.profile.name`). Array index updates are not supported in v1.
- Rationale: Constrains complexity for first release and avoids partial array semantics.
- Alternative considered: Bracket notation and array index support in v1; rejected to keep validation and behavior simpler.

5. Treat invalid target paths or non-object roots as hard step errors.
- Decision: If update operation cannot be applied due to incompatible target type, unsupported path syntax (including array index patterns), or invalid path, fail the step with actionable error text.
- Rationale: Prevents silent data corruption and improves troubleshooting.
- Alternative considered: Ignore invalid operations; rejected as unsafe.

6. Preserve source capture unless workflow explicitly chooses the same capture key.
- Decision: Updated object can be written to either a new capture key or the same key based on workflow declaration.
- Rationale: Enables both immutable and in-place styles while remaining explicit.
- Alternative considered: Always require a new key; rejected as unnecessarily restrictive.

## Risks / Trade-offs

- [Risk] Path notation may be interpreted inconsistently across contributors.
  - Mitigation: Document canonical path format and validation rules in workflow syntax docs and examples.

- [Risk] Mutating large payloads could add runtime overhead.
  - Mitigation: Apply shallow-to-deep path updates without full re-serialization loops where possible; add focused benchmarks.

- [Risk] Overwriting existing capture keys may surprise users.
  - Mitigation: Emit clear docs and examples showing both overwrite and new-key patterns.

- [Trade-off] Strict duplicate-path rejection is less permissive than last-write-wins.
  - Mitigation: Return clear validation errors and examples for splitting or consolidating updates.

## Migration Plan

1. Extend step capture type definitions with the new capture update fields and validation constraints.
2. Implement runner mutation logic behind the new fields while leaving old syntax untouched.
3. Add tests for key overwrite, key creation, nested path updates, duplicate-path rejection, unsupported array index paths, template-resolved values, and invalid-path errors.
4. Release as a backward-compatible enhancement.

Rollback strategy:
- If defects are found, remove usage of the update block from workflows; existing capture behavior remains unchanged.
- Revert runner support for update fields in a patch release if required.

## Open Questions

- None. The initial scope is fixed to dot-notation-only paths, no array index updates, and duplicate path rejection.
