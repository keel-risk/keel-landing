// Display helpers for decimal strings. Pure string work: a money value never
// becomes a JavaScript number here, and nothing is rounded.

export interface DecimalParts {
  sign: string
  int: string
  frac: string
}

/** Splits "113172.1010…" into grouped integer digits and the untouched fraction. */
export function splitDecimal(value: string): DecimalParts {
  const sign = value.startsWith('-') ? '-' : ''
  const body = sign ? value.slice(1) : value
  const [intRaw, frac = ''] = body.split('.')
  const int = intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return { sign, int, frac }
}

/** GA5Z…KZVN style shortening for issuer addresses. */
export function shortAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}

/** "2026-11-24T16:20:43Z" -> "24 Nov 2026, 16:20 UTC" without reading the clock. */
export function formatUtc(iso: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const [date, time] = iso.split('T')
  const [y, m, d] = date.split('-')
  return `${Number(d)} ${months[Number(m) - 1]} ${y}, ${time.slice(0, 5)} UTC`
}

/** delta 0.02 -> "2%". delta is the one numeric field the contract allows. */
export function deltaLabel(delta: number): string {
  return `${Math.round(delta * 100)}%`
}
