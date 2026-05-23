## Why

`parse-duration` is pinned to `^1.1.2` (resolved `1.1.2`) in the lockfile. A high severity vulnerability exists in this version range and is addressed in `2.1.6`. Upgrading removes the exposure and brings the dependency in line with the maintained release line.

## What Changes

- Bump `parse-duration` in `package.json` from `^1.1.2` to `^2.1.6`.
- Regenerate `package-lock.json` to resolve to `2.1.6`.
- Validate that all call sites remain compatible with the `2.x` API.

## Capabilities

### New Capabilities
- `parse-duration-security`: version constraint requiring `parse-duration >= 2.1.6` to eliminate the high-severity vulnerability.

### Modified Capabilities
<!-- No existing end-user behaviour changes. -->

## Impact

- **`package.json`**: version constraint updated for `parse-duration`.
- **`package-lock.json`**: resolved entry updated from `1.1.2` to `2.1.6`.
- **`src/steps/`** and any other files that import `parse-duration`: must be verified against the `2.x` API surface (return-type and argument handling may differ between major versions).
- No public API changes to the runner library itself are expected.
