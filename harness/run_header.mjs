import { writeFileSync, appendFileSync } from 'node:fs'
import { toHtml, textOf } from './shim.mjs'
import { host } from './sdk.mjs'
import { setForced } from './react_stub.mjs'

const savings = { pct: 42, net: 0.05, base: 0.12, paid: 1, wasted: 1, uncounted: 0, events: 2, last_ts: 1794728410 }
const chat = { key: 'below_gate', label: "Below gate — won't touch", eta_s: 0 }
const bar = { used: 10000, idle_gate: 300000, threshold: 500000 }

function boot(mod, payload) {
  const seen = { items: [], events: [] }
  const ctx = {
    register: (item) => { seen.items.push(item) },
    onEvent: (type, fn) => { seen.events.push([type, fn]) },
    onDispose: () => {}
  }
  mod.register(ctx)
  for (const [, fn] of seen.events) fn({ payload })
  return seen
}
function findTag(node, tag) {
  if (!node || typeof node !== 'object') return null
  if (Array.isArray(node)) { for (const n of node) { const f = findTag(n, tag); if (f) return f } return null }
  const { type, props } = node
  if (typeof type === 'function') return findTag(type(props), tag)
  if (type === tag) return node
  return findTag(props && props.children, tag)
}
function findClass(node, needle) {
  if (!node || typeof node !== 'object') return null
  if (Array.isArray(node)) { for (const n of node) { const f = findClass(n, needle); if (f) return f } return null }
  const { type, props } = node
  if (typeof type === 'function') return findClass(type(props), needle)
  const cls = props && typeof props.className === 'string' ? props.className : ''
  if (cls.includes(needle)) return node
  return findClass(props && props.children, needle)
}
function panelPart(mod, version, ts) {
  const seen = boot(mod, { ts, chip: '42%', panel: 'Below gate', bar, savings, chat, version })
  const item = seen.items.find((i) => i.area === 'statusBar.right')
  const tree = item.render()
  const panel = findClass(tree, 'popover-content')
  return { html: toHtml(panel), text: textOf(panel) }
}

const newMod = (await import('./plugin_new.mjs')).default
const oldMod = (await import('./plugin_old.mjs')).default

const NEW = panelPart(newMod, '0.9.55', 1794728510)
const OLD = panelPart(oldMod, '0.9.54', 1794728500)

const res = []
const check = (n, ok, extra) => res.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${ok ? '' : '  << ' + (extra || '')}`)

// both builds show the same money and rate
check('old panel carries the rate', OLD.text.includes('42%'))
check('old panel carries the money line', OLD.text.includes('+$0.05 of $0.12 without the plugin'), OLD.text.slice(0, 160))
check('new panel carries the money line', NEW.text.includes('+$0.05 of $0.12 without the plugin'), NEW.text.slice(0, 160))
// the layout claim, read from the renderers themselves
const OLD_UNDER = 'saved</span></div><div style="margin-top:4px;font-size:0.625rem'
const NEW_INLINE = 'saved</span><span style="margin-left:auto;min-width:0px;text-align:right;font-size:0.625rem'
check('old: the money is a block under the headline row', OLD.html.includes(OLD_UNDER))
check('new: the money is a child of the headline row, pushed right', NEW.html.includes(NEW_INLINE))
check('new: the block under the row is gone', !NEW.html.includes(OLD_UNDER))
check('new: the row keeps the baseline alignment', NEW.html.includes('display:flex;align-items:baseline;gap:6px'))
check('version moved with the build', OLD.text.includes('0.9.54') && NEW.text.includes('0.9.55'))

writeFileSync('old-panel.html', OLD.html, 'utf8')
writeFileSync('new-panel.html', NEW.html, 'utf8')
writeFileSync('header-result.txt', res.join('\n') + '\n', 'utf8')
console.log(res.join('\n'))
process.exit(res.every((r) => r.startsWith('PASS')) ? 0 : 1)
