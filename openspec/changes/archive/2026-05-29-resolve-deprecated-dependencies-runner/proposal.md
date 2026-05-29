## Why

Runner currently uses dependency ranges that can resolve to different transitive trees in downstream consumers, reintroducing deprecation warnings for `whatwg-encoding@3.1.1` even when local runner installs appear clean. This change ensures runner publishes deterministic dependency constraints that avoid targeted deprecated packages in both runner and consuming projects.

## What Changes

- Make runner dependency resolution deterministic for the cheerio path so downstream installs do not drift to transitive trees that include `whatwg-encoding@3.1.1`.
- Keep parser dependency on maintained `@apidevtools/json-schema-ref-parser` and verify no deprecated `json-schema-ref-parser@6.1.0` path appears in runner installs.
- Regenerate lockfile and validate with dependency-tree checks and runner test suite.
- Document residual warnings, if any, as out-of-scope follow-up.

## Capabilities

### New Capabilities
- `dependency-hygiene`: Ensures runner dependency constraints do not resolve to the targeted deprecated package paths in runner installs or downstream consumer installs.

### Modified Capabilities
- None.

## Impact

Affected files include `package.json`, `package-lock.json`, and OpenSpec change artifacts. This change affects dependency resolution behavior and package publication characteristics, with no expected runtime API or workflow behavior changes.
