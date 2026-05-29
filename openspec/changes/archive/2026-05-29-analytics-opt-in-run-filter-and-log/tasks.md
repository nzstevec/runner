## 1. Runner Test Filter

- [x] 1.1 Add optional `tests` selector to `WorkflowOptions`
- [x] 1.2 Filter `workflow.tests` in `run()` when selector is provided
- [x] 1.3 Throw actionable error for missing selected test name

## 2. Step Log Support

- [x] 2.1 Add optional `log` field to `Step` type
- [x] 2.2 Emit `step:log` event before step action execution
- [x] 2.3 Ensure log value is template-resolved with existing step context

## 3. Runner Validation

- [x] 3.1 Add test: single selected test executes
- [x] 3.2 Add test: missing selected test fails with actionable message
- [x] 3.3 Add test: `step:log` emits resolved message before execution
