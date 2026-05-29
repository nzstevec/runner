## Context

Runner currently depends on `cheerio` with a broad range (`^1.0.0-rc.12`). While local lockfiles may keep installs on older resolution trees, downstream consumers can resolve this range to newer versions and inherit transitive warnings such as `whatwg-encoding@3.1.1`. Runner already uses maintained `@apidevtools/json-schema-ref-parser`, so parser warnings are not expected from runner itself.

## Goals / Non-Goals

**Goals:**
- Prevent runner dependency ranges from resolving to the targeted deprecated encoding package path in downstream installs.
- Preserve runner runtime behavior and test outcomes.
- Keep changes minimal and focused on dependency hygiene.

**Non-Goals:**
- Broad dependency modernization across all packages.
- StepCI repository changes (handled separately).
- Introducing runtime feature changes.

## Decisions

- Pin `cheerio` to a deterministic version that does not pull the deprecated encoding path currently seen in downstream installs.
- Keep `@apidevtools/json-schema-ref-parser` as the parser dependency and verify no deprecated parser package path appears in runner resolution.
- Validate with lockfile refresh, dependency-tree checks, and existing test suite.

## Risks / Trade-offs

- [Pinning cheerio may delay adoption of newer upstream fixes] -> Mitigation: track cheerio updates and revisit pinning once an upstream path remains warning-free.
- [Downstream environments may still show unrelated warnings] -> Mitigation: scope verification to targeted warnings and document residual items separately.

## Migration Plan

1. Update runner dependency constraint for cheerio to deterministic version.
2. Regenerate lockfile.
3. Verify dependency tree excludes targeted deprecated packages.
4. Run runner tests.
5. Publish runner and confirm downstream consumer (e.g., StepCI) resolution is clean.

## Open Questions

- Should runner add CI guard checks for targeted deprecated packages to prevent future reintroduction?

## Source Mapping Findings

- Baseline runner dependency tree:
	- `@apidevtools/json-schema-ref-parser@9.1.0` present
	- no resolved `json-schema-ref-parser@6.1.0`
	- no resolved `whatwg-encoding@3.1.1`
- Drift risk for downstream consumers came from semver expansion of `cheerio` from `^1.0.0-rc.12` to stable releases where dependency tree includes `encoding-sniffer@^0.2.1`.

## Validation Outcomes

- Dependency constraint update applied: `cheerio` pinned to `1.0.0-rc.12`.
- Local dependency tree after update excludes targeted deprecated packages.
- Downstream consumer verification using packed tarball also excludes targeted deprecated packages.
- Runner test suite execution is currently blocked by external test dependency outage:
	- `tests/basic.yml` hits `https://httpbin.org/basic-auth/hello/world`
	- endpoint returned HTTP 503 during test run.

Residual out-of-scope items:
- External service availability for `httpbin.org` in integration-style tests is not addressed by this dependency change.
