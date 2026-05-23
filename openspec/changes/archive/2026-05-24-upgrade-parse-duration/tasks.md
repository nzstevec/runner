## 1. Update Dependency

- [x] 1.1 Change `"parse-duration": "^1.1.2"` to `"parse-duration": "^2.1.6"` in `package.json`
- [x] 1.2 Run `npm install` to regenerate `package-lock.json` with the new resolved version
- [x] 1.3 Verify `package-lock.json` resolves `parse-duration` to `>= 2.1.6`

## 2. Validate Call Sites

- [x] 2.1 Confirm imports in `src/index.ts`, `src/steps/delay.ts`, `src/steps/grpc.ts`, and `src/steps/http.ts` compile cleanly against the `2.x` type definitions
- [x] 2.2 Run `tsc -p tsconfig.json` and confirm no type errors

## 3. Test

- [x] 3.1 Run `ts-node ./tests/test.ts` and confirm all tests pass
- [x] 3.2 Manually verify a delay step and an HTTP timeout step behave correctly with duration strings (e.g. `"500ms"`, `"2s"`)
