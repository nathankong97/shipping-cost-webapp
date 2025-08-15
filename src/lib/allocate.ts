
/**
 * Allocate `baseUSD` across `weights` proportionally and sum EXACTLY to base,
 * using largest-remainder (Hamilton) at the chosen decimal precision.
 *
 * @param weights - non-negative weights (e.g., line weights in grams)
 * @param baseUSD - total amount to allocate (USD)
 * @param decimals - decimal places to preserve (default 2 for cents)
 */
export function allocateByWeightExact(
  weights: number[],
  baseUSD: number,
  decimals = 2
): number[] {
  const w = weights.map(v => Math.max(0, Number(v) || 0))
  const totalW = w.reduce((a, b) => a + b, 0)

  const scale = Math.pow(10, decimals)
  const totalCents = Math.round((Number(baseUSD) || 0) * scale)

  // Nothing to distribute
  if (totalW <= 0 || totalCents === 0) {
    // If base is 0 but we still want an array of zeros with same length:
    return w.map(() => 0)
  }

  // Raw ideal cents per row
  const rawCents = w.map(v => (v / totalW) * totalCents)

  // Floor to integer cents
  const floorCents = rawCents.map(c => Math.floor(c))
  let remainder = totalCents - floorCents.reduce((a, b) => a + b, 0)

  // Distribute the remaining cents to the largest fractional parts
  const order = rawCents
    .map((c, i) => ({ i, frac: c - Math.floor(c) }))
    .sort((a, b) => b.frac - a.frac)

  for (let k = 0; k < order.length && remainder > 0; k++) {
    floorCents[order[k].i] += 1
    remainder -= 1
  }

  // Convert back to dollars with fixed decimals
  return floorCents.map(c => c / scale)
}
