import { writeFileSync } from 'node:fs'
import { toHtml, textOf } from './shim.mjs'
import { host } from './sdk.mjs'
import { setForced } from './react_stub.mjs'

const PAYLOAD = {
  ts: 1794728410,
  chip: '~290K left',
  panel: "Below gate — won't touch\nsaved: +$0.05 — that's 42% · paid 1 · wasted 1",
  bar: { used: 10000, idle_gate: 300000, threshold: 500000 },
  savings: {
    pct: 42, net: 0.05, base: 0.12, paid: 1, wasted: 1,
    uncounted: 0, events: 2, last_ts: 1794728410
  },
  chat: { key: 'below_gate', label: "Below gate — won't touch", eta_s: 0 },
  version: '0.9.54'
}

const BANNED = [
  'seamless', 'powerful', 'effortless', 'awesome', 'delve', 'leverage',
  'robust', 'elevate', 'unlock', 'game-chang'
]

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
  if (Array.isArray(node)) {
    for (const n of node) { const f = findTag(n, tag); if (f) return f }
    return null
  }
  const { type, props } = node
  if (typeof type === 'function') return findTag(type(props), tag)
  if (type === tag) return node
  return findTag(props && props.children, tag)
}

function findClass(node, needle) {
  if (!node || typeof node !== 'object') return null
  if (Array.isArray(node)) {
    for (const n of node) { const f = findClass(n, needle); if (f) return f }
    return null
  }
  const { type, props } = node
  if (typeof type === 'function') return findClass(type(props), needle)
  const cls = props && typeof props.className === 'string' ? props.className : ''
  if (cls.includes(needle)) return node
  return findClass(props && props.children, needle)
}

function chipPart(item) {
  const tree = item.render()
  const allHtml = toHtml(tree)
  const button = findTag(tree, 'button')
  const panel = findClass(tree, 'popover-content')
  return {
    tree,
    button,
    buttonHtml: button ? toHtml(button) : '',
    buttonText: button ? textOf(button) : '',
    panel,
    panelHtml: panel ? toHtml(panel) : '',
    panelText: panel ? textOf(panel) : '',
    tip: (allHtml.match(/data-tip="([^"]*)"/) || ['', ''])[1]
  }
}

const results = []
function check(name, ok, extra) { results.push({ name, ok: !!ok, extra: extra || '' }) }

const newMod = (await import('./plugin_new.mjs')).default
const oldMod = (await import('./plugin_old.mjs')).default

// ---- new chip and panel
const fresh = boot(newMod, PAYLOAD)
const chip = chipPart(fresh.items.find((i) => i.area === 'statusBar.right'))

check('chip renders exactly one glyph', (chip.buttonHtml.match(/codicon codicon-graph/g) || []).length === 1, chip.buttonHtml.slice(0, 120))
check('glyph uses the prefixed codicon class', !chip.buttonHtml.includes('class="codicon graph"'))
check('chip text is the savings percentage', chip.buttonText.trim() === '42%', JSON.stringify(chip.buttonText))
check('chip drops the token remainder', !chip.buttonHtml.includes('290K') && !chip.buttonHtml.includes('Ready'))
check('chip drops the inline scale', !chip.buttonHtml.includes('<span style="position:relative'))
check('chip keeps the statusbar hover chrome', chip.buttonHtml.includes('hover:bg-(--chrome-action-hover)'))
check('chip numerals are tabular', chip.buttonHtml.includes('font-variant-numeric:tabular-nums'))
check('chip is one button, not nested', (chip.buttonHtml.match(/<button/g) || []).length === 1)

// tooltip / accessible name
check('tooltip names plugin, rate and state', chip.tip.startsWith('idle-compact · 42% saved · Below gate'), chip.tip)
const aria = (chip.buttonHtml.match(/aria-label="([^"]*)"/) || ['', ''])[1]
check('accessible name equals the tooltip', aria === chip.tip, aria)

// panel
check('panel names the plugin', chip.panelText.includes('idle-compact'))
check('panel shows the version', chip.panelText.includes('0.9.54'))
check('panel leads with the percentage', (chip.panelHtml.match(/>42%</g) || []).length === 1)
check('panel carries the money behind it', chip.panelText.includes('+$0.05 of $0.12'), chip.panelText.slice(0, 120))
check('panel names the baseline', chip.panelText.includes('+$0.05 of $0.12 without the plugin'))
check('panel states this chat', chip.panelText.includes('Below gate'))
check('panel shows the context reading with units', chip.panelText.includes('~10K tokens now'))
check('panel names both reference points under the scale', chip.panelText.includes('idle gate ~300K') && chip.panelText.includes('Hermes compacts at ~500K'))
check('the two scale captions are separate lines', (chip.panelHtml.match(/<br>/g) || []).length === 1)
check('panel draws the scale bar once', (chip.panelHtml.match(/position:relative;display:block/g) || []).length === 1)
check('panel breaks the ledger down', chip.panelText.includes('1 paid off · 1 wasted'))
check('panel glosses the word wasted', chip.panelText.includes('wasted = returned before the cache expired'))
check('panel dates the last compaction unambiguously', /Last\d{1,2} [A-Z][a-z]{2} \d\d:\d\d$/.test(chip.panelText.trim()), JSON.stringify(chip.panelText.slice(-26)))
check('panel opens above the chip', chip.panelHtml.includes('data-side="top"'))
check('panel is anchored to the chip end', chip.panelHtml.includes('data-align="end"'))
check('panel is a popover surface', (chip.panelHtml.match(/class="popover-content w-80"/) || []).length === 1, chip.panelHtml.slice(0, 140))
check('panel label column is fixed', chip.panelHtml.includes('grid-template-columns:82px minmax(0, 1fr)'))
check('no banned words', !BANNED.some((w) => chip.panelText.toLowerCase().includes(w)))

// ---- no ledger yet
// Each boot replays onto the same module-level lastPushTs guard, so the
// pushes in this script climb instead of restarting.
const noLedger = boot(newMod, {
  ts: 1794728420, chip: 'idle-compact', panel: 'No measurements yet', bar: null,
  savings: null, chat: { key: 'unknown', label: 'No measurements yet', eta_s: 0 }, version: '0.9.54'
})
const bare = chipPart(noLedger.items.find((i) => i.area === 'statusBar.right'))
check('no ledger: chip is the glyph alone', bare.buttonText.trim() === '' && bare.buttonHtml.includes('codicon-graph'), JSON.stringify(bare.buttonText))
check('no ledger: panel explains in words', bare.panelText.includes('No compactions yet') && bare.panelText.includes('Savings appear after the first idle compaction'))
check('no ledger: no invented percentage', !bare.panelHtml.includes('%'))
check('no ledger: tooltip stays honest', bare.tip === 'idle-compact · No measurements yet', bare.tip)

// ---- legacy events with no baseline: money without a percentage
const noBaseline = boot(newMod, {
  ts: 1794728430, chip: 'idle-compact', panel: 'Below gate',
  bar: { used: 10000, idle_gate: 300000, threshold: 500000 },
  savings: { pct: null, net: 0.05, base: 0, paid: 2, wasted: 0, uncounted: 0, events: 2, last_ts: 0 },
  chat: { key: 'below_gate', label: "Below gate — won't touch", eta_s: 0 }, version: '0.9.54'
})
const nb = chipPart(noBaseline.items.find((i) => i.area === 'statusBar.right'))
check('no baseline: chip falls back to the glyph', nb.buttonText.trim() === '', JSON.stringify(nb.buttonText))
check('no baseline: panel still shows the money', nb.panelText.includes('+$0.05') && nb.panelText.includes('saved so far'), nb.panelText.slice(0, 200))

// ---- the same chip with its panel open: the trigger stays lit
setForced(true)
const opened = boot(newMod, {
  ts: 1794728440, chip: '~290K left', panel: 'Below gate',
  bar: { used: 10000, idle_gate: 300000, threshold: 500000 },
  savings: { pct: 42, net: 0.05, base: 0.12, paid: 1, wasted: 1, uncounted: 0, events: 2, last_ts: 1794728410 },
  chat: { key: 'below_gate', label: "Below gate — won't touch", eta_s: 0 }, version: '0.9.54'
})
const openChip = chipPart(opened.items.find((i) => i.area === 'statusBar.right'))
setForced(null)
check('open chip stays lit', openChip.buttonHtml.includes('background:var(--chrome-action-hover)'), openChip.buttonHtml.slice(0, 200))
check('open chip keeps its glyph and rate', openChip.buttonText.trim() === '42%' && openChip.buttonHtml.includes('codicon-graph'))

// ---- old chip, for the comparison frame
const legacy = boot(oldMod, PAYLOAD)
const oldChip = chipPart(legacy.items.find((i) => i.area === 'statusBar.right'))

// ---- artifacts
const rows = results.map((r) => `${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : '  << ' + r.extra}`)
writeFileSync('result.txt', rows.join('\n') + '\n', 'utf8')
writeFileSync('new-chip.html', chip.buttonHtml, 'utf8')
writeFileSync('new-panel.html', chip.panelHtml, 'utf8')
writeFileSync('open-chip.html', openChip.buttonHtml, 'utf8')
writeFileSync('new-panel.html', chip.panelHtml, 'utf8')
writeFileSync('old-chip.html', oldChip.buttonHtml, 'utf8')
writeFileSync('old-tip.txt', oldChip.tip, 'utf8')
console.log(rows.join('\n'))
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} passed`)
process.exit(results.every((r) => r.ok) ? 0 : 1)
