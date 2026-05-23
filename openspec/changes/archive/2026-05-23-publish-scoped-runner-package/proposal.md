## Why

The runner fork still carries upstream package metadata and has no documented contract for publishing and consuming the forked packages together. This change defines the runner-side requirements needed to publish `@steve.clogic/runner` and ensure it interoperates cleanly with `@steve.clogic/stepci`.

## What Changes

- Define packaging requirements for the forked runner package name, publish metadata, and repository references.
- Define how the runner package must reference and remain compatible with the forked StepCI package.
- Establish verification expectations for local linking and publish readiness before release.
- Document the release-facing updates needed so consumers install the forked packages instead of the upstream packages.

## Capabilities

### New Capabilities
- `scoped-package-publishing`: requirements for publishing the runner fork under `@steve.clogic/runner` and linking it to `@steve.clogic/stepci`.

### Modified Capabilities

None.

## Impact

- Package metadata in `/package.json` and any release-facing documentation.
- Runner integration points that assume the upstream StepCI package or repository identity.
- Validation steps for `npm link`, local consumption, and publish readiness.