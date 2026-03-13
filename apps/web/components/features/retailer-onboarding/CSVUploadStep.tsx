'use client'

import { useState, useCallback, useRef } from 'react'
import type { WizardFormData } from './OnboardingWizard'

interface CSVUploadStepProps {
  formData: WizardFormData
  updateFormData: (updates: Partial<WizardFormData>) => void
  onNext: () => void
  onBack: () => void
}

type CsvRow = NonNullable<WizardFormData['csv_items']>[number]

/** Parse a CSV string into rows. Handles quoted fields and newlines within quotes. */
function parseCsvText(text: string): string[][] {
  const rows: string[][] = []
  let current = ''
  let inQuotes = false
  let row: string[] = []

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"'
        i++ // skip escaped quote
      } else if (char === '"') {
        inQuotes = false
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        row.push(current.trim())
        current = ''
      } else if (char === '\n' || (char === '\r' && next === '\n')) {
        row.push(current.trim())
        if (row.some((cell) => cell.length > 0)) {
          rows.push(row)
        }
        row = []
        current = ''
        if (char === '\r') i++ // skip \n after \r
      } else {
        current += char
      }
    }
  }

  // Last row
  row.push(current.trim())
  if (row.some((cell) => cell.length > 0)) {
    rows.push(row)
  }

  return rows
}

/** Auto-detect column mappings from header row */
function detectColumns(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {}
  const lower = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''))

  lower.forEach((h, i) => {
    if (['wine', 'winename', 'name', 'product', 'productname', 'title'].includes(h)) {
      mapping.raw_wine_name = i
    } else if (['producer', 'winery', 'brand', 'maker'].includes(h)) {
      mapping.raw_producer = i
    } else if (['vintage', 'year'].includes(h)) {
      mapping.raw_vintage = i
    } else if (['varietal', 'grape', 'variety', 'type'].includes(h)) {
      mapping.raw_varietal = i
    } else if (['sku', 'upc', 'barcode', 'code', 'itemcode'].includes(h)) {
      mapping.raw_sku = i
    } else if (['price', 'retail', 'retailprice', 'unitprice', 'cost'].includes(h)) {
      mapping.raw_price = i
    } else if (['quantity', 'qty', 'stock', 'count', 'onhand', 'inventory'].includes(h)) {
      mapping.raw_quantity = i
    }
  })

  return mapping
}

export function CSVUploadStep({
  formData,
  updateFormData,
  onNext,
  onBack,
}: CSVUploadStepProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [previewRows, setPreviewRows] = useState<CsvRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    (file: File) => {
      setParseError(null)

      if (!file.name.endsWith('.csv') && !file.name.endsWith('.tsv')) {
        setParseError('Please upload a .csv or .tsv file')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setParseError('File is too large (max 10 MB)')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        if (!text) {
          setParseError('Could not read file')
          return
        }

        const rows = parseCsvText(text)
        if (rows.length < 2) {
          setParseError('CSV must have a header row and at least one data row')
          return
        }

        const headers = rows[0]
        const dataRows = rows.slice(1)
        const columnMap = detectColumns(headers)

        if (!('raw_wine_name' in columnMap)) {
          setParseError(
            'Could not detect a wine name column. Please include a column named "Wine", "Name", or "Product".'
          )
          return
        }

        const csvItems: CsvRow[] = dataRows
          .map((row) => ({
            raw_wine_name: row[columnMap.raw_wine_name] ?? '',
            raw_producer:
              columnMap.raw_producer !== undefined ? row[columnMap.raw_producer] : undefined,
            raw_vintage:
              columnMap.raw_vintage !== undefined ? row[columnMap.raw_vintage] : undefined,
            raw_varietal:
              columnMap.raw_varietal !== undefined ? row[columnMap.raw_varietal] : undefined,
            raw_sku:
              columnMap.raw_sku !== undefined ? row[columnMap.raw_sku] : undefined,
            raw_price:
              columnMap.raw_price !== undefined
                ? parseFloat(row[columnMap.raw_price]?.replace(/[$,]/g, '') ?? '')
                : undefined,
            raw_quantity:
              columnMap.raw_quantity !== undefined
                ? parseInt(row[columnMap.raw_quantity] ?? '', 10)
                : undefined,
          }))
          .filter((item) => item.raw_wine_name.length > 0)
          .map((item) => ({
            ...item,
            raw_price: item.raw_price && isNaN(item.raw_price) ? undefined : item.raw_price,
            raw_quantity:
              item.raw_quantity && isNaN(item.raw_quantity) ? undefined : item.raw_quantity,
          }))

        if (csvItems.length === 0) {
          setParseError('No valid rows found in the CSV')
          return
        }

        setTotalRows(csvItems.length)
        setPreviewRows(csvItems.slice(0, 5))
        updateFormData({ csv_items: csvItems })
      }

      reader.onerror = () => {
        setParseError('Error reading file')
      }

      reader.readAsText(file)
    },
    [updateFormData]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const clearUpload = () => {
    updateFormData({ csv_items: undefined })
    setPreviewRows([])
    setTotalRows(0)
    setParseError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const hasUploadedData = previewRows.length > 0

  return (
    <div>
      <h2 className="mb-1 text-xl font-semibold text-gray-900">Initial Inventory</h2>
      <p className="mb-6 text-sm text-gray-500">
        Upload a CSV of your wine inventory to get started. This step is optional
        &mdash; you can add inventory later.
      </p>

      {!hasUploadedData ? (
        <>
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              isDragOver
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <svg
              className="mb-3 h-10 w-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-600">
              Drag and drop your CSV file here, or
            </p>
            <label className="cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-purple-600 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50">
              Browse Files
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv"
                onChange={handleFileSelect}
                className="sr-only"
                aria-label="Upload CSV file"
              />
            </label>
            <p className="mt-2 text-xs text-gray-400">
              CSV or TSV up to 10 MB
            </p>
          </div>

          {parseError && (
            <div className="mt-3 rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-700">{parseError}</p>
            </div>
          )}

          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-medium text-gray-700">Expected Columns</h3>
            <p className="mt-1 text-xs text-gray-500">
              Your CSV should include at minimum a <strong>Wine Name</strong> column.
              Other recognized columns: Producer, Vintage, Varietal, SKU, Price, Quantity.
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Preview */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm font-medium text-green-800">
                  {totalRows} wine{totalRows !== 1 ? 's' : ''} detected
                </span>
              </div>
              <button
                type="button"
                onClick={clearUpload}
                className="text-sm text-gray-500 underline hover:text-gray-700"
                aria-label="Remove uploaded file"
              >
                Remove
              </button>
            </div>
          </div>

          {/* Preview Table */}
          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Wine</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Producer</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Vintage</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-500">Price</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-500">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {previewRows.map((row, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-gray-900">{row.raw_wine_name}</td>
                    <td className="px-3 py-2 text-gray-600">{row.raw_producer ?? '—'}</td>
                    <td className="px-3 py-2 text-gray-600">{row.raw_vintage ?? '—'}</td>
                    <td className="px-3 py-2 text-right text-gray-600">
                      {row.raw_price != null ? `$${row.raw_price.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-600">
                      {row.raw_quantity ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalRows > 5 && (
              <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                Showing 5 of {totalRows} rows
              </div>
            )}
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label="Go back to fulfillment options"
        >
          Back
        </button>
        <div className="flex gap-3">
          {!hasUploadedData && (
            <button
              type="button"
              onClick={onNext}
              className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Skip inventory upload"
            >
              Skip
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="rounded-md bg-purple-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label="Continue to review"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
