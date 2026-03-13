// ---------------------------------------------------------------------------
// CSV column mapping utilities
// ---------------------------------------------------------------------------

/**
 * Standard field names that CSV columns can map to.
 * These correspond to the fields in the wine match queue.
 */
export type StandardColumnName =
  | 'wine_name'
  | 'producer'
  | 'vintage'
  | 'varietal'
  | 'sku'
  | 'price'
  | 'quantity'

/**
 * Known variations of column headers mapped to their standard name.
 * All keys are lowercase for case-insensitive comparison.
 */
const COLUMN_ALIASES: Record<string, StandardColumnName> = {
  // wine_name
  'wine': 'wine_name',
  'wine name': 'wine_name',
  'wine_name': 'wine_name',
  'name': 'wine_name',
  'product': 'wine_name',
  'product name': 'wine_name',

  // producer
  'producer': 'producer',
  'winery': 'producer',
  'maker': 'producer',
  'brand': 'producer',

  // vintage
  'vintage': 'vintage',
  'year': 'vintage',

  // varietal
  'varietal': 'varietal',
  'variety': 'varietal',
  'grape': 'varietal',
  'grape variety': 'varietal',

  // sku
  'sku': 'sku',
  'item number': 'sku',
  'product code': 'sku',
  'upc': 'sku',
  'barcode': 'sku',

  // price
  'price': 'price',
  'cost': 'price',
  'retail': 'price',
  'retail price': 'price',
  'unit price': 'price',

  // quantity
  'quantity': 'quantity',
  'qty': 'quantity',
  'stock': 'quantity',
  'count': 'quantity',
  'on hand': 'quantity',
  'on_hand': 'quantity',
  'inventory': 'quantity',
}

/**
 * Apply a column mapping to an array of row objects.
 *
 * The mapping defines `{ sourceColumnName: targetStandardName }`.
 * Each row's keys are remapped accordingly. Keys not present in the
 * mapping are passed through unchanged.
 *
 * @param rows    - Parsed CSV rows with original column headers as keys
 * @param mapping - Map from source column names to standard target names
 * @returns New array of row objects with remapped keys
 */
export function applyColumnMapping(
  rows: Record<string, string>[],
  mapping: Record<string, string>
): Record<string, string>[] {
  if (Object.keys(mapping).length === 0) {
    return rows
  }

  return rows.map((row) => {
    const mapped: Record<string, string> = {}

    for (const [key, value] of Object.entries(row)) {
      const targetKey = mapping[key] ?? key
      mapped[targetKey] = value
    }

    return mapped
  })
}

/**
 * Auto-detect standard column names from CSV headers.
 *
 * Performs case-insensitive matching against known column name variations.
 * Only maps each standard name once (first match wins if multiple headers
 * map to the same standard name).
 *
 * @param headers - Array of column header strings from the CSV
 * @returns Mapping of `{ sourceHeader: standardName }` for detected columns
 */
export function detectStandardColumns(
  headers: string[]
): Record<string, string> {
  const detected: Record<string, string> = {}
  const assignedTargets = new Set<string>()

  for (const header of headers) {
    const normalized = header.toLowerCase().trim()
    const standardName = COLUMN_ALIASES[normalized]

    if (standardName && !assignedTargets.has(standardName)) {
      detected[header] = standardName
      assignedTargets.add(standardName)
    }
  }

  return detected
}
