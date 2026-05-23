# Step CI Runner

Step CI Test Runner

## Installation

```
npm install @steve.clogic/runner
```

## Usage

### Run workflow from file

```js
import { runFromFile } from '@steve.clogic/runner'
runFromFile('./examples/status.yml').then(console.log)
```

### Run workflow from config

```js
import { run } from '@steve.clogic/runner'

// Example workflow
const workflow = {
  version: "1.0",
  name: "Status Test",
  env: {
    host: "example.com"
  },
  tests: {
    example: {
      steps: [{
        name: "GET request",
        http: {
          url: "https://${{env.host}}",
          method: "GET",
          check: {
            status: "/^20/"
          }
        }
      }]
    }
  }
}

run(workflow).then(console.log)
```

### Events

If you supply an `EventEmitter` as argument, you can subscribe to following events:

- `step:http_request`, when a http request is made
- `step:http_response`, when a http response is received
- `step:grpc_request`, when a grpc request is made
- `step:grpc_response`, when a grpc is received
- `step:result`, when step finishes
- `step:error`, when step errors
- `test:result`, when test finishes
- `workflow:result`, when workflow finishes
- `loadtest:result`, when loadtest finishes

**Example: Events**

```js
import { run } from '@steve.clogic/runner'
import { EventEmitter } from 'node:events'

// Example workflow
const workflow = {
  version: "1.0",
  name: "Status Test",
  env: {
    host: "example.com"
  },
  tests: {
    example: {
      steps: [{
        name: "GET request",
        http: {
          url: "https://${{env.host}}",
          method: "GET",
          check: {
            status: "/^20/"
          }
        }
      }]
    }
  }
}

const ee = new EventEmitter()
ee.on('done', console.log)
run(workflow, { ee })
```

## Fork Versioning

This fork uses the upstream version as the base and appends a fork-specific prerelease suffix.

Example:

- upstream: `2.0.7`
- fork: `2.0.7-steve.0`

## Fork Maintenance

- Runner repository: `https://github.com/nzstevec/runner`
- Paired StepCI package: `@steve.clogic/stepci`
- Paired StepCI repository: `https://github.com/nzstevec/stepci`

### Pre-publish smoke test

Run these checks before publishing a new `@steve.clogic/runner` version:

1. In this repository, run `npm test`.
2. In this repository, run `npm link`.
3. In the `@steve.clogic/stepci` repository, run `npm link @steve.clogic/runner`.
4. In the `@steve.clogic/stepci` repository, run `npm run build` to confirm the linked runner still exposes `dist/index.d.ts` for the `Workflow` schema build.
5. Validate tarball installation in a disposable directory by packing both repositories and installing them together, then confirm `@steve.clogic/stepci` resolves `@steve.clogic/runner`.
6. Publish with `npm publish` from this repository after the package metadata and smoke tests pass.
