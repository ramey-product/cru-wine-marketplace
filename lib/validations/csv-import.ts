import { z } from 'zod'

// ---------------------------------------------------------------------------
// Column mapping schema
// ---------------------------------------------------------------------------

/**
 * Maps arbitrary CSV column names to standard field names.
 * Keys are source column headers, values are the standard target names.
 *
 * Example: `{ "Wine": "wine_name", "Winery": "producer" }`
 */
export const CsvColumnMappingSchema = z.record(
  z.string(),
  z.enum([
    'wine_name',
    'producer',
    'vintage',
    'varietal',
    'sku',
    'price',
    'quantity',
  ])
)

export type CsvColumnMapping = z.infer<typeof CsvColumnMappingSchema>

// ---------------------------------------------------------------------------
// CSV import input schema
// ---------------------------------------------------------------------------

/** Maximum CSV content size: 10 MB in characters. */
const CSV_MAX_SIZE = 10_485_760

/**
 * Input schema for the CSV import server action.
 * Validates the overall import request before parsing begins.
 */
export const CsvImportInputSchema = z.object({
  org_id: z.string().uuid('org_id must be a valid UUID'),
  retailer_id: z.string().uuid('retailer_id must be a valid UUID'),
  csv_content: z
    .string()
    .min(1, 'CSV content must not be empty')
    .max(CSV_MAX_SIZE, `CSV content exceeds maximum size of ${CSV_MAX_SIZE} characters`),
  column_mapping: CsvColumnMappingSchema.optional(),
})

export type CsvImportInput = z.infer<typeof CsvImportInputSchema>

// ---------------------------------------------------------------------------
// CSV row schema (single parsed row validation)
// ---------------------------------------------------------------------------

/**
 * Schema for a single parsed CSV row after column mapping.
 * Used for structural validation before normalization.
 */
export const CsvRowSchema = z.object({
  wine_name: z.string().min(1, 'Wine name is required'),
  producer: z.string().optional(),
  vintage: z.string().optional(),
  varietal: z.string().optional(),
  sku: z.string().optional(),
  price: z.union([z.string(), z.number()]).optional(),
  quantity: z.union([z.string(), z.number()]).optional(),
})

export type CsvRow = z.infer<typeof CsvRowSchema>

// ---------------------------------------------------------------------------
// Detect columns input schema (lighter action)
// ---------------------------------------------------------------------------

/**
 * Input schema for the column detection action.
 * Only needs the CSV content to parse headers.
 */
export const DetectColumnsInputSchema = z.object({
  csv_content: z
    .string()
    .min(1, 'CSV content must not be empty')
    .max(CSV_MAX_SIZE, `CSV content exceeds maximum size of ${CSV_MAX_SIZE} characters`),
})

export type DetectColumnsInput = z.infer<typeof DetectColumnsInputSchema>
