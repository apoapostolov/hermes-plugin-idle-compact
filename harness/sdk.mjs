// The slice of @hermes/plugin-sdk the idle-compact half touches, rendered
// headlessly: an app atom, the status-bar Tip, the codicon, and the Popover
// surface. Markup only — no React, no Radix, no Electron.
import { jsx } from './shim.mjs'

export function atom(initial) {
  let value = initial
  return {
    get: () => value,
    set: (next) => { value = next },
    listen: () => () => {}
  }
}

export function useValue(a) {
  return a && typeof a.get === 'function' ? a.get() : undefined
}

export const host = {
  state: {
    activeSessionId: atom(null),
    focusedSessionId: atom(null),
    focusedStoredSessionId: atom(null)
  },
  __payload: null,
  __requests: [],
  __notices: [],
  async request(method, params, timeoutMs) {
    host.__requests.push({ method, params, timeoutMs })
    if (host.__requestError) throw host.__requestError
    return host.__payload
  },
  notify(n) { host.__notices.push(n) }
}

// Tip: a tip is a label, so the stub carries it as an attribute.
export function Tip({ label, children }) {
  return jsx('span', { 'data-tip': label, children })
}

export function Codicon({ name, size, className, style }) {
  return jsx('i', {
    'aria-hidden': 'true',
    className: `codicon codicon-${name}${className ? ' ' + className : ''}`,
    'data-font-size': size,
    style
  })
}

export function Popover({ children }) {
  return jsx('span', { 'data-popover': 'root', children })
}

export function PopoverTrigger({ children }) {
  return children
}

export function PopoverContent({ children, className, side, align }) {
  return jsx('div', {
    'data-popover': 'content',
    'data-side': side,
    'data-align': align,
    className: `popover-content ${className || ''}`.trim(),
    children
  })
}

export function Separator({ style }) {
  return jsx('div', { className: 'separator', style })
}
