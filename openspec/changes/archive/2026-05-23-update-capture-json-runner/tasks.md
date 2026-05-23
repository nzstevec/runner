## 1. Workflow Contract and Types

- [x] 1.1 Define capture update syntax fields in step capture type definitions
- [x] 1.2 Add validation rules for required update fields and unsupported value/path formats

## 2. Runner Capture Update Implementation

- [x] 2.1 Implement capture update evaluation flow: extract base capture, resolve template values, apply updates, store final capture
- [x] 2.2 Implement deterministic dot-notation path update utility
- [x] 2.3 Implement support for writing updated output to either same capture key or a new capture key
- [x] 2.4 Implement explicit failure handling for invalid path traversal and non-object source capture values

## 3. Test Coverage

- [x] 3.1 Add runner tests for overriding existing keys and adding new keys
- [x] 3.2 Add runner tests for nested path updates and duplicate-path rejection
- [x] 3.3 Add runner tests for template-resolved update values from env and captures
- [x] 3.4 Add runner tests for invalid path and non-object source failures with actionable errors

## 4. Validation and Release Readiness

- [x] 4.1 Run the test suite and confirm no regressions in existing capture workflows
- [x] 4.2 Verify backward compatibility by running existing capture examples unchanged
- [x] 4.3 Prepare release note entry describing the new capture JSON update capability and constraints
