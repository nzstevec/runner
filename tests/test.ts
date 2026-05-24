import assert from 'node:assert/strict'
import http from 'node:http'
import { AddressInfo } from 'node:net'
import { runFromFile, runFromYAML } from '../src/index'
import { isPureTemplate, resolvePureTemplates } from '../src/utils/template'

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

function testIsPureTemplate() {
  // Exact match
  assert.equal(isPureTemplate('${{captures.body}}'), true)
  // Whitespace inside delimiters
  assert.equal(isPureTemplate('${{ captures.body }}'), true)
  assert.equal(isPureTemplate('${{  env.MY_VAR  }}'), true)
  // Mixed-content strings — must NOT match
  assert.equal(isPureTemplate('prefix-${{captures.name}}'), false)
  assert.equal(isPureTemplate('${{captures.a}}-${{captures.b}}'), false)
  assert.equal(isPureTemplate('${{name}}-suffix'), false)
  // Multi-expression string
  assert.equal(isPureTemplate('${{a}} ${{b}}'), false)
  // Non-template strings
  assert.equal(isPureTemplate('plain string'), false)
  assert.equal(isPureTemplate(''), false)
  // Expression with filter — still a pure-template wrapper, but filter presence is an internal concern
  assert.equal(isPureTemplate('${{captures.name | upcase}}'), true)
}

function testResolvePureTemplates() {
  const context = {
    captures: {
      body: { id: 1, name: 'alice' },
      list: [10, 20, 30],
      count: 42,
      flag: true,
    },
    env: { HOST: 'localhost' },
  }

  // Object value substitution
  const objResult = resolvePureTemplates({ json: '${{captures.body}}' } as any, context) as any
  assert.deepEqual(objResult.json, { id: 1, name: 'alice' })

  // Array value substitution
  const arrResult = resolvePureTemplates({ json: '${{captures.list}}' } as any, context) as any
  assert.deepEqual(arrResult.json, [10, 20, 30])

  // Scalar value substitution (number)
  const numResult = resolvePureTemplates({ retries: '${{captures.count}}' } as any, context) as any
  assert.equal(numResult.retries, 42)

  // Scalar value substitution (boolean)
  const boolResult = resolvePureTemplates({ flag: '${{captures.flag}}' } as any, context) as any
  assert.equal(boolResult.flag, true)

  // Nested object traversal
  const nested = resolvePureTemplates({ http: { json: '${{captures.body}}', url: 'http://${{env.HOST}}' } } as any, context) as any
  assert.deepEqual(nested.http.json, { id: 1, name: 'alice' })
  // Mixed-content string is left as-is for liquidless
  assert.equal(nested.http.url, 'http://${{env.HOST}}')

  // Unresolved (undefined) reference throws
  assert.throws(
    () => resolvePureTemplates({ json: '${{captures.missing}}' } as any, context),
    /undefined/
  )

  // Expression with filter is left as-is (deferred to liquidless)
  const filtered = resolvePureTemplates({ name: '${{captures.count | upcase}}' } as any, context) as any
  assert.equal(filtered.name, '${{captures.count | upcase}}')
}

async function testJsonObjectPassthrough() {
  // 4.1: Captured object passed as full json body
  await withServer((req, res) => {
    const requestUrl = new URL(req.url ?? '', 'http://127.0.0.1')

    if (requestUrl.pathname === '/get-object') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ id: 7, name: 'alice', role: 'admin' }))
      return
    }

    if (requestUrl.pathname === '/echo') {
      let body = ''
      req.on('data', (chunk) => { body += chunk })
      req.on('end', () => {
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(body)
      })
      return
    }

    res.writeHead(404)
    res.end()
  }, async (port) => {
    const workflow = `
version: "1.1"
name: JSON Object Passthrough
tests:
  example:
    steps:
      - name: Capture object
        http:
          url: http://127.0.0.1:${port}/get-object
          method: GET
          captures:
            body:
              jsonpath: $
      - name: Echo object back
        http:
          url: http://127.0.0.1:${port}/echo
          method: POST
          json: \${{captures.body}}
          check:
            status: 200
            json:
              id: 7
              name: alice
              role: admin
`
    const { result } = await runFromYAML(workflow)
    assert.equal(result.passed, true, 'json object pass-through should pass')
  })
}

async function testJsonObjectPassthroughWithUpdate() {
  // 4.2: Updated capture object passed as full json body
  await withServer((req, res) => {
    const requestUrl = new URL(req.url ?? '', 'http://127.0.0.1')

    if (requestUrl.pathname === '/get-object') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ id: 7, name: 'original' }))
      return
    }

    if (requestUrl.pathname === '/echo') {
      let body = ''
      req.on('data', (chunk) => { body += chunk })
      req.on('end', () => {
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(body)
      })
      return
    }

    res.writeHead(404)
    res.end()
  }, async (port) => {
    const workflow = `
version: "1.1"
name: JSON Object Passthrough With Update
tests:
  example:
    steps:
      - name: Capture and update object
        http:
          url: http://127.0.0.1:${port}/get-object
          method: GET
          captures:
            item:
              jsonpath: $
              update:
                name: updated-name
      - name: Echo updated object back
        http:
          url: http://127.0.0.1:${port}/echo
          method: POST
          json: \${{captures.item}}
          check:
            status: 200
            json:
              id: 7
              name: updated-name
`
    const { result } = await runFromYAML(workflow)
    assert.equal(result.passed, true, 'updated capture object pass-through should pass')
  })
}

async function testJsonArrayPassthrough() {
  // 4.3: Captured array passed as top-level json body
  await withServer((req, res) => {
    const requestUrl = new URL(req.url ?? '', 'http://127.0.0.1')

    if (requestUrl.pathname === '/get-array') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify([1, 2, 3]))
      return
    }

    if (requestUrl.pathname === '/echo') {
      let body = ''
      req.on('data', (chunk) => { body += chunk })
      req.on('end', () => {
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(body)
      })
      return
    }

    res.writeHead(404)
    res.end()
  }, async (port) => {
    const workflow = `
version: "1.1"
name: JSON Array Passthrough
tests:
  example:
    steps:
      - name: Capture array
        http:
          url: http://127.0.0.1:${port}/get-array
          method: GET
          captures:
            list:
              jsonpath: $
      - name: Echo array back
        http:
          url: http://127.0.0.1:${port}/echo
          method: POST
          json: \${{captures.list}}
          check:
            status: 200
`
    const { result } = await runFromYAML(workflow)
    assert.equal(result.passed, true, 'json array pass-through should pass')
  })
}

async function testMixedContentTemplateUnchanged() {
  // 4.4: Mixed-content string templates continue to coerce to strings
  await withServer((req, res) => {
    const requestUrl = new URL(req.url ?? '', 'http://127.0.0.1')

    if (requestUrl.pathname === '/get-data') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ name: 'alice' }))
      return
    }

    if (requestUrl.pathname === '/hello/alice') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
      return
    }

    res.writeHead(404, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ path: requestUrl.pathname }))
  }, async (port) => {
    const workflow = `
version: "1.1"
name: Mixed Content Template Coercion
tests:
  example:
    steps:
      - name: Capture name
        http:
          url: http://127.0.0.1:${port}/get-data
          method: GET
          captures:
            name:
              jsonpath: $.name
      - name: Use name in mixed-content URL
        http:
          url: http://127.0.0.1:${port}/hello/\${{captures.name}}
          method: GET
          check:
            status: 200
`
    const { result } = await runFromYAML(workflow)
    assert.equal(result.passed, true, 'mixed-content string templates should still work')
  })
}

async function testUndefinedCaptureInJsonFails() {
  // 4.5: Undefined capture in json pure-template fails with actionable error
  await withServer((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({}))
  }, async (port) => {
    const workflow = `
version: "1.1"
name: Undefined Capture In JSON
tests:
  example:
    steps:
      - name: Use undefined capture
        http:
          url: http://127.0.0.1:${port}/
          method: POST
          json: \${{captures.missing}}
`
    const { result } = await runFromYAML(workflow)
    const step = result.tests[0].steps[0]
    assert.equal(result.passed, false, 'workflow should fail')
    assert.equal(step.errored, true, 'step should be errored')
    assert.match(step.errorMessage ?? '', /undefined/i, 'error should mention undefined')
  })
}

async function main() {
  testIsPureTemplate()
  testResolvePureTemplates()
  await assertWorkflowPasses('./tests/basic.yml')
  await assertWorkflowPasses('./tests/filelist.yml')
  await assertWorkflowPasses('./tests/multipart.yml')
  await testCaptureUpdateFlow()
  await testInvalidArrayPathFails()
  await testDuplicatePathFails()
  await testJsonObjectPassthrough()
  await testJsonObjectPassthroughWithUpdate()
  await testJsonArrayPassthrough()
  await testMixedContentTemplateUnchanged()
  await testUndefinedCaptureInJsonFails()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
