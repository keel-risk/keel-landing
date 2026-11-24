import Decimal from 'decimal.js'

// Layout only: how far along an axis a decimal string sits, as a 0..1 fraction.
// The money values stay Decimal; only the unitless ratio becomes a number,
// and it is never shown to the reader.
export function fractionOf(value: string, max: string): number {
  const m = new Decimal(max)
  if (m.isZero()) return 0
  return new Decimal(value).div(m).clamp(0, 1).toNumber()
}

/** The largest of a set of decimal strings, chosen with Decimal, returned as the original string. */
export function maxOf(values: string[]): string {
  return values.reduce((a, b) => (new Decimal(b).greaterThan(a) ? b : a))
}
