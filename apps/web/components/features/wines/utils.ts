/**
 * Format a wine price range for display.
 *
 * Rules:
 *  - both null        → "Check availability"
 *  - min only         → "From $X"
 *  - max only         → "Up to $X"
 *  - min === max      → "$X"
 *  - min !== max      → "$X–$Y"
 *
 * Whole-dollar amounts omit decimals; fractional amounts show two decimals.
 */
export function formatWinePrice(
  priceMin: number | null,
  priceMax: number | null
): string {
  if (priceMin === null && priceMax === null) {
    return 'Check availability'
  }

  const fmt = (n: number) =>
    n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`

  if (priceMin !== null && priceMax !== null) {
    if (priceMin === priceMax) {
      return fmt(priceMin)
    }
    return `${fmt(priceMin)}\u2013${fmt(priceMax)}`
  }

  if (priceMin !== null) {
    return `From ${fmt(priceMin)}`
  }

  return `Up to ${fmt(priceMax!)}`
}

/**
 * Build a "Varietal — Region, Country" subtitle string.
 * Returns null when no data is available.
 */
export function formatVarietalRegion(
  varietal: string | null,
  region: string | null,
  country: string | null
): string | null {
  const parts: string[] = []
  if (varietal) parts.push(varietal)

  const location = [region, country].filter(Boolean).join(', ')
  if (location) parts.push(location)

  return parts.length > 0 ? parts.join(' \u2014 ') : null
}

/**
 * Return the user-facing availability text for a wine.
 */
export function getAvailabilityText(isAvailable: boolean): string {
  return isAvailable ? 'In stock nearby' : 'Check availability'
}
