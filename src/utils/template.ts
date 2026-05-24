// Matches a string that is exactly one template expression: ${{ expr }}
// with optional whitespace inside the delimiters and no surrounding content.
// Uses [^}]+ to prevent matching across multiple expressions like ${{a}} ${{b}}.
const PURE_TEMPLATE_RE = /^\$\{\{\s*([^}]+?)\s*\}\}$/

/**
 * Returns true when `value` is exactly a single `${{ expr }}` template
 * expression with no surrounding text.
 */
export function isPureTemplate(value: string): boolean {
  return PURE_TEMPLATE_RE.test(value)
}

/**
 * Resolve a dot-separated path (e.g. "captures.body") against a context
 * object, returning the raw value at that path.
 */
function resolveDotPath(expr: string, context: Record<string, unknown>): unknown {
  const parts = expr.trim().split('.')
  let current: unknown = context
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

/**
 * Walk `value` recursively. Any string leaf that is exactly a pure template
 * expression is resolved against `context` and replaced with the raw resolved
 * value (preserving type — object, array, number, boolean, etc.).
 *
 * Expressions containing filters (`|`) are left as-is so that `liquidless`
 * can handle the string coercion.
 *
 * Throws if a pure-template expression resolves to `undefined` (unset capture
 * or unknown variable), producing an actionable error message.
 */
function walkAndReplace(value: unknown, context: Record<string, unknown>): unknown {
  if (typeof value === 'string') {
    const match = value.match(PURE_TEMPLATE_RE)
    if (match) {
      const expr = match[1]
      // Expressions with filters perform string transformation — defer to liquidless
      if (expr.includes('|')) {
        return value
      }
      const resolved = resolveDotPath(expr, context)
      if (resolved === undefined) {
        throw new Error(`Template expression '$\{\{${expr.trim()}\}\}' resolved to undefined`)
      }
      return resolved
    }
    return value
  }

  if (Array.isArray(value)) {
    return value.map(item => walkAndReplace(item, context))
  }

  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = walkAndReplace(v, context)
    }
    return result
  }

  return value
}

/**
 * Pre-process a step object before passing it to `liquidless` `renderObject`.
 * Pure-template string values (exactly `${{ expr }}`) are resolved to their
 * raw typed values so that objects, arrays, and non-string scalars are
 * preserved rather than coerced to strings.
 *
 * Mixed-content strings such as `"prefix-${{name}}-suffix"` are left
 * unchanged and handled by `liquidless` as before.
 */
export function resolvePureTemplates<T extends object>(obj: T, context: object): T {
  return walkAndReplace(obj, context as Record<string, unknown>) as T
}
