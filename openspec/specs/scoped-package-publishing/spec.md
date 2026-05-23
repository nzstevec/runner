## ADDED Requirements

### Requirement: Runner package metadata matches the forked distribution
The runner package SHALL publish as `@steve.clogic/runner` and SHALL expose repository, homepage, bug-reporting, and publish metadata that point to the forked maintenance surface rather than the upstream StepCI project.

#### Scenario: Packed manifest reflects fork metadata
- **WHEN** a maintainer generates a publishable package artifact from this repository
- **THEN** the manifest identifies the package as `@steve.clogic/runner`
- **AND** the manifest does not reference the upstream `StepCI/runner` repository for maintenance metadata

### Requirement: Runner package remains consumable by the forked StepCI package
The runner package SHALL preserve the package interface required by `@steve.clogic/stepci` so that the forked StepCI package can resolve and execute the forked runner package through local linking and published installation workflows.

#### Scenario: Local link resolves the forked runner package
- **WHEN** a maintainer links `@steve.clogic/runner` into the forked StepCI repository during local development
- **THEN** the StepCI fork resolves the linked runner package without falling back to the upstream package

#### Scenario: Published install resolves the forked runner package
- **WHEN** the forked StepCI package is configured to consume the published runner fork
- **THEN** package installation resolves `@steve.clogic/runner`
- **AND** the StepCI fork can execute a basic runner-backed workflow using that package

### Requirement: Publish readiness is validated before release
The release workflow SHALL include an explicit validation step for scoped publish readiness and fork compatibility before maintainers publish a new runner fork version.

#### Scenario: Release checklist covers package compatibility
- **WHEN** a maintainer prepares a new runner fork release
- **THEN** the release validation confirms the package can be packed or published with the expected scope settings
- **AND** the validation confirms compatibility with `@steve.clogic/stepci` using a documented smoke test