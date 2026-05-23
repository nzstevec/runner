import assert from 'node:assert/strict'
import http from 'node:http'
import { AddressInfo } from 'node:net'
import { runFromFile, runFromYAML } from '../src/index'

async function withServer(
  handler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
  run: (port: number) => Promise<void>
) {
  const server = http.createServer(handler)

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve)
  })

  const address = server.address() as AddressInfo

  try {
    await run(address.port)
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => resolve())
    })
  }
}

async function assertWorkflowPasses(path: string) {
  const { result } = await runFromFile(path)
  assert.equal(result.passed, true, `${path} should pass`)
}

async function testCaptureUpdateFlow() {
  await withServer((req, res) => {
    const requestUrl = new URL(req.url ?? '', 'http://127.0.0.1')

    if (requestUrl.pathname === '/token') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ token: 'abc-123' }))
      return
    }

    if (requestUrl.pathname === '/profile') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          profile: {
            displayName: 'original-name',
            metadata: {
              source: 'api',
              token: null,
            },
          },
        })
      )
      return
    }

    if (requestUrl.pathname === '/verify/stepci/abc-123/ada-lovelace') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
      return
    }

    res.writeHead(404, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: 'not found', path: requestUrl.pathname }))
  }, async (port) => {
    const workflow = `
version: "1.1"
name: Capture Update
env:
  displayName: ada-lovelace
  sourceName: stepci
tests:
  example:
    steps:
      - name: Get token
        http:
          url: http://127.0.0.1:${port}/token
          method: GET
          captures:
            token:
              jsonpath: $.token
      - name: Get profile
        http:
          url: http://127.0.0.1:${port}/profile
          method: GET
          captures:
            profile:
              jsonpath: $.profile
              update:
                metadata.source: \${{ env.sourceName }}
                metadata.token: \${{ captures.token }}
                displayName: \${{ env.displayName }}
      - name: Verify updated capture
        http:
          url: http://127.0.0.1:${port}/verify/\${{ captures.profile.metadata.source }}/\${{ captures.profile.metadata.token }}/\${{ captures.profile.displayName }}
          method: GET
          check:
            status: 200
`

    const { result } = await runFromYAML(workflow)
    const steps = result.tests[0].steps

    assert.equal(result.passed, true)
    assert.equal(steps[0].passed, true)
    assert.equal(steps[1].passed, true)
    assert.equal(steps[2].passed, true)

    assert.deepEqual(steps[1].captures?.profile, {
      displayName: 'ada-lovelace',
      metadata: {
        source: 'stepci',
        token: 'abc-123',
      },
    })
  })
}

async function testInvalidArrayPathFails() {
  await withServer((req, res) => {
    const requestUrl = new URL(req.url ?? '', 'http://127.0.0.1')

    if (requestUrl.pathname === '/profile') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          profile: {
            tags: ['alpha', 'beta'],
          },
        })
      )
      return
    }

    res.writeHead(404, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: 'not found' }))
  }, async (port) => {
    const workflow = `
version: "1.1"
name: Capture Update Invalid Path
tests:
  example:
    steps:
      - name: Get profile
        http:
          url: http://127.0.0.1:${port}/profile
          method: GET
          captures:
            profile:
              jsonpath: $.profile
              update:
                tags.0.name: invalid
`

    const { result } = await runFromYAML(workflow)
    const step = result.tests[0].steps[0]

    assert.equal(result.passed, false)
    assert.equal(step.errored, true)
    assert.match(step.errorMessage ?? '', /non-object|array index|invalid/i)
  })
}

async function testDuplicatePathFails() {
  await withServer((req, res) => {
    const requestUrl = new URL(req.url ?? '', 'http://127.0.0.1')

    if (requestUrl.pathname === '/profile') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ profile: { metadata: { source: 'api' } } }))
      return
    }

    res.writeHead(404, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: 'not found' }))
  }, async (port) => {
    const workflow = `
version: "1.1"
name: Capture Update Duplicate Path
tests:
  example:
    steps:
      - name: Get profile
        http:
          url: http://127.0.0.1:${port}/profile
          method: GET
          captures:
            profile:
              jsonpath: $.profile
              update:
                metadata.source: one
                metadata.source: two
`

    await assert.rejects(async () => runFromYAML(workflow), /duplicate|duplicated/i)
  })
}

async function main() {
  await assertWorkflowPasses('./tests/basic.yml')
  await assertWorkflowPasses('./tests/filelist.yml')
  await assertWorkflowPasses('./tests/multipart.yml')
  await testCaptureUpdateFlow()
  await testInvalidArrayPathFails()
  await testDuplicatePathFails()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
