'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A single validation error targeting one cell in the preview table.
 * `field` matches a standard column name (wine_name, price, quantity, etc.)
 */
export interface CellError {
  field: string
  message: string
}

/**
 * A single preview row. Keys are standard column names produced by the
 * column mapping step (wine_name, producer, price, quantity, vintage,
 * varietal, sku). The `_errors` map holds per-field validation errors.
 * The `_autoDetected` set names fields whose values came from auto-detection.
 */
export interface PreviewRow {
  wine_name?: string
  producer?: string
  price?: string
  quantity?: string
  vintage?: string
  varietal?: string
  sku?: string
  _errors?: Record<string, string>
  _autoDetected?: Set<string>
}

interface ImportPreviewProps {
  /** All mapped rows from the upload (preview shows first 20). */
  rows: PreviewRow[]
  /** The confirmed column mapping: { csvHeader: standardName }. */
  mapping: Record<string, string>
  /** Called when the user confirms and kicks off the import. */
  onConfirm: () => void
  /** Called to return to the mapping step. */
  onBack: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** The ordered display columns for the preview table. */
const DISPLAY_COLUMNS: { key: keyof Omit<PreviewRow, '_errors' | '_autoDetected'>; label: string }[] = [
  { key: 'wine_name', label: 'Wine Name' },
  { key: 'producer', label: 'Producer' },
  { key: 'vintage', label: 'Vintage' },
  { key: 'varietal', label: 'Varietal' },
  { key: 'price', label: 'Price' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'sku', label: 'SKU' },
]

/** Count total validation errors across all rows. */
function countErrors(rows: PreviewRow[]): number {
  return rows.reduce((acc, row) => {
    return acc + Object.keys(row._errors ?? {}).length
  }, 0)
}

/** Determine whether any error is in a required field (wine_name, price, quantity). */
const REQUIRED_FIELDS = new Set(['wine_name', 'price', 'quantity'])

function hasCriticalErrors(rows: PreviewRow[]): boolean {
  return rows.some((row) => {
    for (const field of Object.keys(row._errors ?? {})) {
      if (REQUIRED_FIELDS.has(field)) return true
    }
    return false
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ImportPreview — table showing the first 20 mapped rows before import.
 *
 * Cells with validation errors show a red background and a title tooltip
 * with the error message. Cells whose value came from auto-detection show a
 * subtle green indicator. A summary bar at the top shows row counts and the
 * total number of validation errors found.
 */
export function ImportPreview({ rows, mapping, onConfirm, onBack }: ImportPreviewProps) {
  const previewRows = rows.slice(0, 20)
  const totalRows = rows.length
  const totalErrors = countErrors(rows)
  const criticalErrors = hasCriticalErrors(rows)

  /**
   * Only render columns that appear in the mapping values or have data in
   * at least one row, so we don't show empty columns for unmapped fields.
   */
  const mappedTargets = new Set(Object.values(mapping))
  const activeColumns = DISPLAY_COLUMNS.filter(
    (col) =>
      mappedTargets.has(col.key) ||
      previewRows.some((row) => row[col.key] != null && row[col.key] !== '')
  )

  return (
    <div>
      {/* Page heading */}
      <h2 className="mb-1 text-xl font-semibold text-foreground">Preview Import</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Review your data before importing. Cells highlighted in red contain validation
        errors and will not be imported.
      </p>

      {/* Summary bar */}
      <div
        className={cn(
          'mb-4 flex flex-wrap items-center gap-3 rounded-md px-4 py-3 text-sm',
          totalErrors > 0 ? 'bg-yellow-50' : 'bg-green-50'
        )}
        role={totalErrors > 0 ? 'alert' : undefined}
        aria-live="polite"
      >
        <span className={totalErrors > 0 ? 'text-yellow-800' : 'text-green-800'}>
          {previewRows.length < totalRows
            ? `Showing first ${previewRows.length} of ${totalRows} rows.`
            : `All ${totalRows} row${totalRows !== 1 ? 's' : ''} shown.`}
        </span>

        {totalErrors > 0 ? (
          <Badge
            variant="destructive"
            className="rounded-full text-xs font-medium"
          >
            {totalErrors} validation error{totalErrors !== 1 ? 's' : ''} found
          </Badge>
        ) : (
          <Badge className="rounded-full bg-green-100 text-green-800 hover:bg-green-100 text-xs font-medium">
            No errors — ready to import
          </Badge>
        )}

        {criticalErrors && (
          <span className="text-xs text-red-600 font-medium">
            Some required fields have errors — fix your CSV or adjust the mapping before importing.
          </span>
        )}
      </div>

      {/* Data table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border text-sm" role="table">
          <thead className="bg-muted/50">
            <tr>
              {/* Row number column */}
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-10"
              >
                #
              </th>
              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {previewRows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-muted/50">
                {/* Row number */}
                <td className="px-3 py-2.5 text-xs text-muted-foreground/70 font-mono">
                  {rowIdx + 1}
                </td>
                {activeColumns.map((col) => {
                  const value = row[col.key] ?? ''
                  const errorMsg = row._errors?.[col.key]
                  const isAutoDetected = row._autoDetected?.has(col.key)

                  return (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-2.5 text-foreground',
                        errorMsg
                          ? 'bg-red-50 text-red-900'
                          : isAutoDetected && value
                            ? 'bg-green-50/40'
                            : ''
                      )}
                      title={errorMsg}
                      aria-label={
                        errorMsg
                          ? `${col.label}: ${value || '(empty)'} — Error: ${errorMsg}`
                          : undefined
                      }
                    >
                      <span className="flex items-center gap-1.5">
                        {/* Auto-detection indicator */}
                        {isAutoDetected && value && !errorMsg && (
                          <span
                            className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400"
                            aria-hidden="true"
                            title="Auto-detected"
                          />
                        )}

                        {/* Cell value */}
                        <span
                          className={cn(
                            'truncate max-w-[160px]',
                            !value && 'text-muted-foreground/70 italic'
                          )}
                        >
                          {value || '—'}
                        </span>

                        {/* Inline error indicator */}
                        {errorMsg && (
                          <span
                            className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold leading-none"
                            aria-hidden="true"
                            title={errorMsg}
                          >
                            !
                          </span>
                        )}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-red-100 border border-red-200" />
          Validation error (hover for details)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
          Auto-detected field
        </span>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          aria-label="Go back to column mapping"
        >
          Back to Mapping
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={criticalErrors}
          aria-label={
            criticalErrors
              ? 'Cannot start import — fix validation errors first'
              : 'Start importing the CSV data'
          }
          className={cn(
            criticalErrors && 'cursor-not-allowed opacity-50'
          )}
        >
          Start Import
        </Button>
      </div>
    </div>
  )
}
