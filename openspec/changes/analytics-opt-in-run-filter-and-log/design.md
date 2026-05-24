## Context

Runner currently executes all tests in `workflow.tests` and does not expose a way for callers to select one named test. Runner also does not define a workflow-level `log` field on steps, so callers cannot reliably emit intentional output from step definitions.

## Goals / Non-Goals

**Goals:**
- Add a workflow option to select a single named test.
- Fail fast with a clear error if selected test does not exist.
- Add optional `log` field to steps and emit a pre-step output event.

**Non-Goals:**
- Multi-test selection expressions/globs.
- Structured log payload persistence beyond event emission.
- Changes to HTTP/gRPC/SSE check behavior.

## Decisions

- Extend `WorkflowOptions` with `tests?: string` as a single-test selector.
- Filter tests in `run()` before concurrency fan-out; if selector missing in `workflow.tests`, throw explicit error.
- Add `log?: string` to `Step` type.
- Emit `step:log` event in `runStep()` after template resolution and before step action execution.

## Risks / Trade-offs

- API extension in runner options requires coordinated StepCI update.
  → Mitigation: Keep option additive and optional.
- Throwing on missing test name changes failure mode from silent pass-through.
  → Mitigation: Clear actionable error message including available test names.
- `log` output order relative to retries may be surprising.
  → Mitigation: Emit once per execution attempt; document this behavior.
