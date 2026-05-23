export type CaptureUpdateMap = {
  [key: string]: any
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function assertValidPath(path: string) {
  if (!path || !path.trim()) {
    throw new Error('Capture update path cannot be empty')
  }

  if (path.includes('[') || path.includes(']')) {
    throw new Error(`Capture update path "${path}" uses unsupported array index syntax`)
  }

  if (path.split('.').some(segment => segment.trim() === '')) {
    throw new Error(`Capture update path "${path}" is invalid`)
  }
}

function setDotPath(target: Record<string, any>, path: string, value: any) {
  const segments = path.split('.')
  let current: Record<string, any> = target

  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index]
    const isLeaf = index === segments.length - 1

    if (!isLeaf) {
      const existing = current[segment]

      if (existing === undefined) {
        current[segment] = {}
      } else if (!isObject(existing)) {
        throw new Error(`Capture update path "${path}" cannot traverse through non-object value at "${segments.slice(0, index + 1).join('.')}"`)
      }

      current = current[segment]
      continue
    }

    current[segment] = value
  }
}

export function applyCaptureUpdates<T>(capture: T, updates?: CaptureUpdateMap): T {
  if (!updates) {
    return capture
  }

  if (!isObject(capture)) {
    throw new Error('Capture updates require an object source')
  }

  const updatedCapture = cloneValue(capture)
  const seenPaths = new Set<string>()

  for (const [path, value] of Object.entries(updates)) {
    assertValidPath(path)

    if (seenPaths.has(path)) {
      throw new Error(`Duplicate capture update path: ${path}`)
    }

    seenPaths.add(path)
    setDotPath(updatedCapture, path, value)
  }

  return updatedCapture
}