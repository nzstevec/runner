## 1. Package Metadata Alignment

- [x] 1.1 Update runner package metadata fields to point at the forked repository, homepage, and issue tracker
- [x] 1.2 Add or confirm scoped publish settings required to publish `@steve.clogic/runner`
- [x] 1.3 Review the packed package manifest to verify no upstream maintenance metadata remains

## 2. Fork Consumption Compatibility

- [x] 2.1 Identify the runner package interface that the forked StepCI package consumes and confirm it remains unchanged
- [x] 2.2 Validate local `npm link` consumption from `@steve.clogic/stepci` to `@steve.clogic/runner`
- [x] 2.3 Validate a packed or published-install workflow so the StepCI fork resolves the scoped runner package instead of the upstream package

## 3. Release-Facing Documentation

- [x] 3.1 Update any runner documentation that still points users to upstream package or repository coordinates
- [x] 3.2 Document the smoke-test steps maintainers must run before publishing a new forked runner version

## 4. Final Verification

- [x] 4.1 Run the runner test suite after metadata and documentation changes
- [x] 4.2 Record the fork compatibility and publish-readiness checks needed for the first release of `@steve.clogic/runner`