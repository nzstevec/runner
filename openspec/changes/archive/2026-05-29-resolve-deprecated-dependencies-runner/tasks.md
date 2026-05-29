## 1. Dependency Source and Constraint Updates

- [x] 1.1 Verify current runner dependency paths for targeted deprecated packages (`whatwg-encoding@3.1.1`, `json-schema-ref-parser@6.1.0`)
- [x] 1.2 Update runner dependency constraints to deterministic versions that avoid targeted deprecated transitive paths
- [x] 1.3 Regenerate lockfile and confirm dependency tree excludes targeted deprecated package versions

## 2. Validation and Documentation

- [x] 2.1 Run runner test suite to validate no behavior regressions
- [x] 2.2 Document dependency-resolution outcome and any residual unrelated warnings as out-of-scope follow-up
- [x] 2.3 Verify OpenSpec task checklist is fully updated for archive readiness
