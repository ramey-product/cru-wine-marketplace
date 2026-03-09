// ---------------------------------------------------------------------------
// CSV row validation and value normalization
// ---------------------------------------------------------------------------

/**
 * A validated CSV row with normalized values ready for database insertion.
 * Price is in cents (integer). Quantity is a non-negative integer.
 */
export interface CsvValidRow {
  wine_name: string
  producer?: string
  vintage?: string
  varietal?: string
  sku?: string
  /** Price in cents (integer). */
  price: number
  /** Quantity as a non-negative integer. */
  quantity: number
}

/**
 * Describes a validation error for a specific row and field.
 */
export interface CsvRowError {
  /** 1-based row number in the CSV (excluding header). */
  row: number
  /** The field that failed validation. */
  field: string
  /** Human-readable error message. */
  message: string
}

/**
 * Result of validating a batch of CSV rows.
 */
export interface CsvValidationResult {
  /** Rows that passed all validation rules. */
  validRows: CsvValidRow[]
  /** Errors collected from rows that failed validation. */
  errors: CsvRowError[]
}

// ---------------------------------------------------------------------------
// Price normalization
// ---------------------------------------------------------------------------

/**
 * Normalize a price value to cents (integer).
 *
 * Handles:
 * - String values with "$", ",", and whitespace
 * - Numeric values (treated as dollars)
 * - Returns null for unparseable, negative, or NaN values
 *
 * @param value - Raw price value from CSV (string or number)
 * @returns Price in cents as an integer, or null if invalid
 */
export function normalizePrice(value: string | number): number | null {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  let numeric: number

  if (typeof value === 'number') {
    numeric = value
  } else {
    // Remove "$", ",", and whitespace
    const cleaned = value.replace(/[$,\s]/g, '')
    numeric = parseFloat(cleaned)
  }

  if (isNaN(numeric) || !isFinite(numeric) || numeric < 0) {
    return null
  }

  // Convert to cents and round to avoid floating-point issues
  return Math.round(numeric * 100)
}

// ---------------------------------------------------------------------------
// Quantity normalization
// ---------------------------------------------------------------------------

/**
 * Normalize a quantity value to a non-negative integer.
 *
 * Handles:
 * - String values with whitespace
 * - Numeric values (rounded to integer)
 * - Returns null for unparseable or negative values
 *
 * @param value - Raw quantity value from CSV (string or number)
 * @returns Quantity as a non-negative integer, or null if invalid
 */
export function normalizeQuantity(value: string | number): number | null {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  let numeric: number

  if (typeof value === 'number') {
    numeric = value
  } else {
    const cleaned = value.trim()
    numeric = parseInt(cleaned, 10)
  }

  if (isNaN(numeric) || !isFinite(numeric) || numeric < 0) {
    return null
  }

  return Math.floor(numeric)
}

// ---------------------------------------------------------------------------
// Single row validation
// ---------------------------------------------------------------------------

/**
 * Validate and normalize a single CSV row.
 *
 * Checks:
 * - wine_name is present and non-empty after trimming
 * - price is parseable and non-negative (converted to cents)
 * - quantity is parseable and non-negative (defaults to 0 if missing)
 *
 * @param row      - A mapped CSV row with standard column keys
 * @param rowIndex - 0-based index of the row in the data (used for error reporting as 1-based)
 * @returns An object with either a valid row or an error (never both)
 */
export function validateCsvRow(
  row: Record<string, string>,
  rowIndex: number
): { valid: CsvValidRow | null; error: CsvRowError | null } {
  const rowNumber = rowIndex + 1 // 1-based for user-facing errors

  // wine_name: required, non-empty
  const wineName = (row['wine_name'] ?? '').trim()
  if (!wineName) {
    return {
      valid: null,
      error: {
        row: rowNumber,
        field: 'wine_name',
        message: `Row ${rowNumber}: wine_name is required`,
      },
    }
  }

  // price: normalize, reject if null (unparseable) or negative
  const rawPrice = row['price'] ?? ''
  const price = normalizePrice(rawPrice)
  if (price === null) {
    return {
      valid: null,
      error: {
        row: rowNumber,
        field: 'price',
        message: `Row ${rowNumber}: price "${rawPrice}" is not a valid non-negative number`,
      },
    }
  }

  // quantity: normalize, default to 0 if missing/empty, reject if negative
  const rawQuantity = row['quantity'] ?? ''
  let quantity: number
  if (rawQuantity.trim() === '') {
    quantity = 0
  } else {
    const parsed = normalizeQuantity(rawQuantity)
    if (parsed === null) {
      return {
        valid: null,
        error: {
          row: rowNumber,
          field: 'quantity',
          message: `Row ${rowNumber}: quantity "${rawQuantity}" is not a valid non-negative integer`,
        },
      }
    }
    quantity = parsed
  }

  // Build the valid row with optional fields
  const validRow: CsvValidRow = {
    wine_name: wineName,
    price,
    quantity,
  }

  const producer = (row['producer'] ?? '').trim()
  if (producer) validRow.producer = producer

  const vintage = (row['vintage'] ?? '').trim()
  if (vintage) validRow.vintage = vintage

  const varietal = (row['varietal'] ?? '').trim()
  if (varietal) validRow.varietal = varietal

  const sku = (row['sku'] ?? '').trim()
  if (sku) validRow.sku = sku

  return { valid: validRow, error: null }
}

// ---------------------------------------------------------------------------
// Batch validation
// ---------------------------------------------------------------------------

/**
 * Validate and normalize all CSV rows, collecting valid rows and errors separately.
 *
 * Every row is processed regardless of errors in other rows, so the caller
 * receives a complete picture of the import quality.
 *
 * @param rows - Array of mapped CSV row objects with standard column keys
 * @returns Valid rows ready for insertion and any validation errors
 */
export function validateCsvRows(
  rows: Record<string, string>[]
): CsvValidationResult {
  const validRows: CsvValidRow[] = []
  const errors: CsvRowError[] = []

  for (let i = 0; i < rows.length; i++) {
    const { valid, error } = validateCsvRow(rows[i], i)

    if (valid) {
      validRows.push(valid)
    }

    if (error) {
      errors.push(error)
    }
  }

  return { validRows, errors }
}
