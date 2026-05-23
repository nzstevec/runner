## Context

`parse-duration` converts human-readable duration strings (e.g. `"500ms"`, `"1m"`) to millisecond integers. It is used in four source files:

| File | Usage |
|---|---|
| `src/index.ts` | Retry interval parsing |
| `src/steps/delay.ts` | Delay step timeout |
| `src/steps/grpc.ts` | gRPC deadline |
| `src/steps/http.ts` | HTTP request timeout |

All four call sites follow the same pattern: `parseDuration(str) ?? undefined`, relying on the function returning `null` (coerced to `undefined` via `??`) when parsing fails.

The current constraint is `^1.1.2` (resolved `1.1.2`). A high-severity vulnerability is present in the `1.x` line. The fix is available in `2.1.6`.

## Goals / Non-Goals

**Goals:**
- Update `parse-duration` to `^2.1.6` in `package.json`.
- Ensure all existing call sites work correctly with the `2.x` API.
- No changes to observable runner behaviour.

**Non-Goals:**
- Refactoring duration-handling logic.
- Upgrading other dependencies in the same PR.

## Decisions

### Use `^2.1.6` as the version constraint

`parse-duration` `2.x` retains the same default export signature: `parseDuration(str: string, format?: string) => number | null`. The `?? undefined` pattern used at every call site is compatible — `null` is still returned for unparseable input. Pinning to `^2.1.6` allows patch-level fixes while staying on the secure major version.

**Alternative considered**: Exact pin `2.1.6` — rejected because it prevents automatic receipt of future patch security fixes.

### No call-site changes required

The `2.x` changelog introduced no breaking changes to the primary API used in this project (default export, string input, numeric ms output). Call sites are unchanged.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| `2.x` introduces subtle behaviour differences for edge-case duration strings | Existing test suite covers delay/timeout behaviour; run tests after upgrade |
| `^2.1.6` resolves a future `2.x` patch that itself introduces a regression | Lockfile pins the exact resolved version; `npm ci` in CI is deterministic |

## Migration Plan

1. Change `"parse-duration": "^1.1.2"` → `"parse-duration": "^2.1.6"` in `package.json`.
2. Run `npm install` to regenerate `package-lock.json`.
3. Run `ts-node ./tests/test.ts` to confirm no regressions.
4. Commit both `package.json` and `package-lock.json`.

**Rollback**: Revert both files and re-run `npm install`.

## Open Questions

None — the `2.x` API is a drop-in for the patterns used here.
