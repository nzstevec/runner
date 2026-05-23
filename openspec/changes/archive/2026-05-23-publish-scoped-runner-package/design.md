## Context

The runner fork has already moved its package identity to `@steve.clogic/runner` and uses a fork-specific version, but its repository metadata still points to the upstream StepCI project. The paired StepCI fork has already been updated separately, so the remaining runner work is to make the published package self-consistent, define how it is validated against `@steve.clogic/stepci`, and avoid release-time drift between local linking and published installs.

## Goals / Non-Goals

**Goals:**
- Align runner package metadata with the forked repository and npm scope.
- Define the runner-side contract required for the StepCI fork to consume the runner fork through local linking and published installs.
- Make publish readiness verifiable with a repeatable local workflow before release.

**Non-Goals:**
- Changing runner runtime behavior unrelated to package distribution.
- Reworking the StepCI fork in this repository.
- Introducing a monorepo or automated publish pipeline in this change.

## Decisions

1. Update package metadata to represent the fork as the canonical distribution target.
   Rationale: the package name is already scoped, so leaving repository, bugs, homepage, or publish access settings pointed at upstream creates a mismatch between installed artifact and maintenance surface.
   Alternative considered: keep upstream metadata and only change the published package name. Rejected because consumers would be directed to the wrong repository and issue tracker.

2. Treat fork linkage as a compatibility contract, not a direct runtime dependency in runner.
   Rationale: runner is published independently, while `@steve.clogic/stepci` consumes it. The runner-side requirement is to preserve the package interface and verify that local `npm link` and packed installs resolve correctly from the StepCI fork.
   Alternative considered: add StepCI as a dependency or embed cross-repo logic in runner. Rejected because it would couple the packages unnecessarily.

3. Validate publish readiness with packaging-focused checks.
   Rationale: the highest-risk failures are incorrect package metadata, scoped publish access, and consumer resolution from the forked StepCI package. These are better covered by `npm pack` or link-based smoke checks than by runtime tests alone.
   Alternative considered: rely only on existing unit tests. Rejected because the current tests do not validate npm package identity or install metadata.

## Risks / Trade-offs

- Incorrect fork URLs or npm publish settings could make the package installable but hard to maintain. → Mitigate by updating all package metadata fields together and validating the packed manifest.
- Local `npm link` success may hide publish-time issues. → Mitigate by including both link-based and packed-artifact validation in the implementation tasks.
- The StepCI fork may assume an interface that is not explicitly documented here. → Mitigate by keeping the runner contract limited to package name, resolution, and smoke-test compatibility.

## Migration Plan

1. Update runner package metadata to the forked package and repository identity.
2. Add or revise any release-facing documentation needed for the scoped package name.
3. Validate the runner package through local linking with `@steve.clogic/stepci` and through a packed install workflow.
4. Publish the scoped package once metadata and validation checks pass.
5. If a rollback is needed, unpublish or deprecate the forked prerelease version and restore the prior package metadata before republishing.

## Open Questions

- Which exact GitHub repository URLs should replace the current upstream metadata values?
- Should the initial publish remain on prerelease version tags until the fork linkage is exercised outside the local machine?