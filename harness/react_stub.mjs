// The one React hook the chip uses. `setForced` pins the state for a pass so a
// frame can show the open chip without a click; the harness resets it after.
let forced = null

export function setForced(value) {
  forced = value
}

export function useState(initial) {
  const value = forced === null ? initial : forced
  return [value, () => {}]
}
