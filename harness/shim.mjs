// Two-line jsx shim: builds {type, props} trees, then serialises them to HTML.
export const Fragment = Symbol('Fragment')

export function jsx(type, props, key) {
  return { type, props: props || {}, key: key === undefined ? null : key }
}
export const jsxs = jsx

const UNITLESS = new Set([
  'flex', 'flexGrow', 'flexShrink', 'opacity', 'fontWeight', 'lineHeight',
  'zIndex', 'order', 'gridColumn', 'gridRow', 'columnGap', 'rowGap'
])

function styleOf(style) {
  if (!style) return ''
  const parts = []
  for (const [k, v] of Object.entries(style)) {
    if (v === null || v === undefined || v === '') continue
    const name = k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
    const value = typeof v === 'number' && !UNITLESS.has(k) ? `${v}px` : String(v)
    parts.push(`${name}:${value}`)
  }
  return parts.join(';')
}

const VOID = new Set(['img', 'br', 'hr', 'input', 'meta', 'link'])

function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function toHtml(node) {
  if (node === null || node === undefined || node === false || node === true) return ''
  if (Array.isArray(node)) return node.map(toHtml).join('')
  if (typeof node === 'string' || typeof node === 'number') return esc(node)
  const { type, props } = node
  if (typeof type === 'function') return toHtml(type(props))
  if (type === Fragment) return toHtml(props.children)
  if (typeof type !== 'string') return ''
  const attrs = []
  const children = []
  for (const [k, v] of Object.entries(props)) {
    if (k === 'children') { children.push(v); continue }
    if (k === 'key' || v === null || v === undefined || v === false) continue
    if (k === 'style') { attrs.push(`style="${esc(styleOf(v))}"`); continue }
    if (k === 'className') { attrs.push(`class="${esc(v)}"`); continue }
    if (typeof v === 'function' || typeof v === 'object') continue
    attrs.push(`${k}="${esc(v)}"`)
  }
  const open = `<${type}${attrs.length ? ' ' + attrs.join(' ') : ''}>`
  if (VOID.has(type)) return open
  return `${open}${toHtml(children)}</${type}>`
}

export function textOf(node) {
  if (node === null || node === undefined || node === false) return ''
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  const { type, props } = node
  if (typeof type === 'function') return textOf(type(props))
  return textOf(props && props.children)
}
