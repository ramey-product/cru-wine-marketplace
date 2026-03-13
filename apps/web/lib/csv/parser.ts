// ---------------------------------------------------------------------------
// Lightweight CSV parser — no external dependencies
// ---------------------------------------------------------------------------

/**
 * Result of parsing a CSV string.
 */
export interface CsvParseResult {
  /** Column headers from the first row. */
  headers: string[]
  /** Data rows as key-value objects keyed by header name. */
  rows: Record<string, string>[]
}

/**
 * Parse a CSV string into headers and rows.
 *
 * Handles:
 * - Quoted fields (fields containing commas, newlines, or double quotes)
 * - Escaped quotes (doubled `""` inside quoted fields)
 * - Mixed line endings (`\r\n`, `\n`, `\r`)
 * - BOM (byte order mark) at the start of UTF-8 files
 * - Whitespace trimming on unquoted values
 *
 * @param content - Raw CSV string content
 * @returns Parsed headers and row objects
 */
export function parseCsv(content: string): CsvParseResult {
  if (!content || content.trim().length === 0) {
    return { headers: [], rows: [] }
  }

  // Strip UTF-8 BOM if present
  const cleaned = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content

  const records = parseRecords(cleaned)

  if (records.length === 0) {
    return { headers: [], rows: [] }
  }

  const headers = records[0].map((h) => h.trim())
  const rows: Record<string, string>[] = []

  for (let i = 1; i < records.length; i++) {
    const record = records[i]

    // Skip completely empty rows
    if (record.length === 1 && record[0].trim() === '') {
      continue
    }

    const row: Record<string, string> = {}
    for (let j = 0; j < headers.length; j++) {
      const value = j < record.length ? record[j] : ''
      row[headers[j]] = value.trim()
    }
    rows.push(row)
  }

  return { headers, rows }
}

// ---------------------------------------------------------------------------
// Internal: RFC 4180-compliant record parser
// ---------------------------------------------------------------------------

/**
 * Parse CSV content into a two-dimensional array of strings (records x fields).
 * Implements RFC 4180 parsing with support for quoted fields.
 */
function parseRecords(content: string): string[][] {
  const records: string[][] = []
  let currentField = ''
  let currentRecord: string[] = []
  let inQuotes = false
  let i = 0

  while (i < content.length) {
    const char = content[i]

    if (inQuotes) {
      if (char === '"') {
        // Check for escaped quote (doubled "")
        if (i + 1 < content.length && content[i + 1] === '"') {
          currentField += '"'
          i += 2
          continue
        }
        // End of quoted field
        inQuotes = false
        i++
        continue
      }
      // Any character inside quotes is literal (including commas, newlines)
      currentField += char
      i++
      continue
    }

    // Not inside quotes
    if (char === '"') {
      // Start of quoted field (should be at field start, but be lenient)
      inQuotes = true
      i++
      continue
    }

    if (char === ',') {
      // Field separator
      currentRecord.push(currentField)
      currentField = ''
      i++
      continue
    }

    if (char === '\r') {
      // Handle \r\n or standalone \r as record separator
      currentRecord.push(currentField)
      currentField = ''
      records.push(currentRecord)
      currentRecord = []
      if (i + 1 < content.length && content[i + 1] === '\n') {
        i += 2
      } else {
        i++
      }
      continue
    }

    if (char === '\n') {
      // Record separator
      currentRecord.push(currentField)
      currentField = ''
      records.push(currentRecord)
      currentRecord = []
      i++
      continue
    }

    // Regular character
    currentField += char
    i++
  }

  // Flush last field and record if there is remaining content
  if (currentField.length > 0 || currentRecord.length > 0) {
    currentRecord.push(currentField)
    records.push(currentRecord)
  }

  return records
}
