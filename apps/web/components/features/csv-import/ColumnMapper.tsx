'use client'

import { useState, useCallback } from 'react'
import type { StandardColumnName } from '@/lib/csv/column-mapper'

/** All standard column names the mapper supports */
const STANDARD_COLUMNS: {
  value: StandardColumnName
  label: string
  required: boolean
}[] = [
  { value: 'wine_name', label: 'Wine Name', required: true },
  { value: 'price', label: 'Price', required: true },
  { value: 'quantity', label: 'Quantity', required: true },
  { value: 'producer', label: 'Producer', required: false },
  { value: 'vintage', label: 'Vintage', required: false },
  { value: 'varietal', label: 'Varietal', required: false },
  { value: 'sku', label: 'SKU', required: false },
]

const REQUIRED_FIELDS: StandardColumnName[] = ['wine_name', 'price', 'quantity']

interface ColumnMapperProps {
  /** CSV column headers from the uploaded file */
  headers: string[]
  /** Auto-detected mapping from detectColumnsAction: { csvHeader: standardName } */
  detectedMapping: Record<string, string>
  /** Called when the user confirms their mapping */
  onConfirm: (mapping: Record<string, string>) => void
  /** Called to go back to file upload */
  onBack: () => void
}

export function ColumnMapper({
  headers,
  detectedMapping,
  onConfirm,
  onBack,
}: ColumnMapperProps) {
  // Initialize mapping from auto-detected values
  const [mapping, setMapping] = useState<Record<string, string>>(() => ({
    ...detectedMapping,
  }))

  const [error, setError] = useState<string | null>(null)

  /** Get the set of standard names already assigned to prevent duplicates */
  const assignedTargets = new Set(Object.values(mapping))

  const handleChange = useCallback(
    (header: string, value: string) => {
      setMapping((prev) => {
        const next = { ...prev }
        if (value === '') {
          delete next[header]
        } else {
          next[header] = value
        }
        return next
      })
      setError(null)
    },
    []
  )

  const handleConfirm = () => {
    const assignedValues = new Set(Object.values(mapping))
    const missing = REQUIRED_FIELDS.filter((f) => !assignedValues.has(f))

    if (missing.length > 0) {
      const labels = missing.map(
        (f) => STANDARD_COLUMNS.find((c) => c.value === f)?.label ?? f
      )
      setError(`Required columns not mapped: ${labels.join(', ')}`)
      return
    }

    onConfirm(mapping)
  }

  const autoDetectedCount = Object.keys(detectedMapping).length
  const totalMapped = Object.keys(mapping).length

  return (
    <div>
      <h2 className="mb-1 text-xl font-semibold text-gray-900">
        Map CSV Columns
      </h2>
      <p className="mb-2 text-sm text-gray-500">
        Match your CSV columns to the standard fields below. Required fields are
        marked with an asterisk.
      </p>

      {autoDetectedCount > 0 && (
        <div className="mb-4 rounded-md bg-green-50 px-4 py-3">
          <p className="text-sm text-green-800">
            <span className="font-medium">{autoDetectedCount}</span> column
            {autoDetectedCount !== 1 ? 's' : ''} auto-detected. Review and
            adjust if needed.
          </p>
        </div>
      )}

      {/* Mapping table */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                CSV Column
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Maps To
              </th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {headers.map((header) => {
              const currentValue = mapping[header] ?? ''
              const isAutoDetected = header in detectedMapping
              const isManuallySet = currentValue && !isAutoDetected

              return (
                <tr
                  key={header}
                  className={
                    currentValue
                      ? isAutoDetected
                        ? 'bg-green-50/50'
                        : 'bg-blue-50/50'
                      : ''
                  }
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {header}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={currentValue}
                      onChange={(e) => handleChange(header, e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      aria-label={`Map column "${header}"`}
                    >
                      <option value="">— Unmapped —</option>
                      {STANDARD_COLUMNS.map((col) => {
                        const isAssignedElsewhere =
                          assignedTargets.has(col.value) &&
                          currentValue !== col.value
                        return (
                          <option
                            key={col.value}
                            value={col.value}
                            disabled={isAssignedElsewhere}
                          >
                            {col.label}
                            {col.required ? ' *' : ''}
                            {isAssignedElsewhere ? ' (already mapped)' : ''}
                          </option>
                        )
                      })}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isAutoDetected && currentValue && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Auto
                      </span>
                    )}
                    {isManuallySet && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        Manual
                      </span>
                    )}
                    {!currentValue && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                        Skipped
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <span>{totalMapped} of {headers.length} columns mapped</span>
        <span className="text-gray-300">|</span>
        <span>
          Required:{' '}
          {REQUIRED_FIELDS.map((f) => {
            const col = STANDARD_COLUMNS.find((c) => c.value === f)
            const isMapped = assignedTargets.has(f)
            return (
              <span
                key={f}
                className={
                  isMapped
                    ? 'font-medium text-green-600'
                    : 'font-medium text-red-500'
                }
              >
                {col?.label ?? f}
                {isMapped ? ' \u2713' : ' \u2717'}
                {f !== REQUIRED_FIELDS[REQUIRED_FIELDS.length - 1] ? ', ' : ''}
              </span>
            )
          })}
        </span>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label="Go back to file upload"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="rounded-md bg-purple-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label="Confirm column mapping and continue"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
