'use client'

import { useState, useCallback, useRef, useTransition } from 'react'
import { ColumnMapper } from './ColumnMapper'
import { ImportPreview, type PreviewRow } from './ImportPreview'
import { ImportProgress, type ImportStatus } from './ImportProgress'
import { ImportSummary } from './ImportSummary'
import { detectColumnsAction, importCsvAction } from '@/lib/actions/csv-import'
import { cn } from '@/lib/utils'
import { UploadCloud, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

/**
 * Mock preview rows — realistic wine data used while the preview step is
 * populated from the uploaded CSV.
 *
 * TODO: Replace MOCK_PREVIEW_ROWS with real rows derived from the uploaded
 * CSV content + applied column mapping. Use parseCsv + applyColumnMapping
 * from lib/csv to build actual PreviewRow objects, then attach per-field
 * errors from validateCsvRows.
 */
const MOCK_PREVIEW_ROWS: PreviewRow[] = [
  {
    wine_name: 'Tempier Rose',
    producer: 'Domaine Tempier',
    price: '42.99',
    quantity: '24',
    vintage: '2022',
    varietal: 'Mourvedre Blend',
    _autoDetected: new Set(['wine_name', 'producer', 'price', 'quantity']),
  },
  {
    wine_name: 'Ridge Monte Bello',
    producer: 'Ridge Vineyards',
    price: '189.99',
    quantity: '6',
    vintage: '2018',
    varietal: 'Cabernet Sauvignon',
    _autoDetected: new Set(['wine_name', 'producer', 'price', 'quantity']),
  },
  {
    wine_name: '',
    producer: 'Unknown',
    price: '-5.00',
    quantity: '12',
    _errors: {
      wine_name: 'Wine name is required',
      price: 'Invalid price: -5.00 — must be a positive number',
    },
  },
  {
    wine_name: 'Bedrock Zinfandel',
    producer: 'Bedrock Wine Co.',
    price: '38.00',
    quantity: '48',
    vintage: '2021',
    varietal: 'Zinfandel',
    sku: 'BW-ZIN-21',
    _autoDetected: new Set(['wine_name', 'producer', 'price', 'quantity', 'vintage']),
  },
  {
    wine_name: 'Domaine Weinbach Riesling',
    producer: 'Domaine Weinbach',
    price: '55.00',
    quantity: '18',
    vintage: '2020',
    varietal: 'Riesling',
    _autoDetected: new Set(['wine_name', 'producer', 'price', 'quantity']),
  },
  {
    wine_name: 'Giacomo Conterno Barolo',
    producer: 'Giacomo Conterno',
    price: 'not-a-price',
    quantity: '3',
    vintage: '2016',
    varietal: 'Nebbiolo',
    _errors: {
      price: 'Invalid price: "not-a-price" — must be a valid number',
    },
  },
  {
    wine_name: 'Cristom Pinot Noir',
    producer: 'Cristom Vineyards',
    price: '48.00',
    quantity: '36',
    vintage: '2021',
    varietal: 'Pinot Noir',
    sku: 'CV-PN-21',
    _autoDetected: new Set(['wine_name', 'producer', 'price', 'quantity', 'sku']),
  },
  {
    wine_name: 'Arnoux-Lachaux Vosne-Romanee',
    producer: 'Arnoux-Lachaux',
    price: '225.00',
    quantity: '',
    vintage: '2019',
    varietal: 'Pinot Noir',
    _errors: {
      quantity: 'Quantity is missing — will default to 0',
    },
  },
]

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

/**
 * Wizard step keys in order of progression.
 * The state machine only moves forward (except mapping → upload via onBack).
 */
type WizardStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'summary'

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'upload', label: 'Upload' },
  { key: 'mapping', label: 'Mapping' },
  { key: 'preview', label: 'Preview' },
  { key: 'importing', label: 'Importing' },
  { key: 'summary', label: 'Summary' },
]

const STEP_INDEX: Record<WizardStep, number> = {
  upload: 0,
  mapping: 1,
  preview: 2,
  importing: 3,
  summary: 4,
}

// ---------------------------------------------------------------------------
// CsvImportWizard state types
// ---------------------------------------------------------------------------

interface WizardState {
  step: WizardStep
  /** Raw CSV text from the uploaded file */
  csvContent: string
  /** Parsed column headers from the CSV */
  headers: string[]
  /** Number of data rows in the CSV (excluding header) */
  rowCount: number
  /** Mapping returned by detectColumnsAction and confirmed/adjusted in ColumnMapper */
  detectedMapping: Record<string, string>
  /** Final confirmed mapping from the ColumnMapper step */
  confirmedMapping: Record<string, string>
  /** Import progress (0..rowCount) */
  importProgress: number
  /** Import status once the job kicks off */
  importStatus: ImportStatus
  /** Error message for the failed state */
  importError: string | undefined
  /** Summary data returned by importCsvAction */
  summary: {
    matched: number
    pendingReview: number
    errors: number
    syncLogId: string
  } | null
}

function initialState(): WizardState {
  return {
    step: 'upload',
    csvContent: '',
    headers: [],
    rowCount: 0,
    detectedMapping: {},
    confirmedMapping: {},
    importProgress: 0,
    importStatus: 'processing',
    importError: undefined,
    summary: null,
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CsvImportWizardProps {
  /**
   * TODO: Pass retailerId from auth context once auth integration is wired.
   * The importCsvAction requires org_id + retailer_id.
   */
  orgId?: string
  retailerId?: string
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepIndicator({ current }: { current: WizardStep }) {
  const currentIdx = STEP_INDEX[current]

  return (
    <nav aria-label="Import progress steps" className="mb-8">
      <ol className="flex items-center">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIdx
          const isActive = idx === currentIdx
          const isUpcoming = idx > currentIdx
          const isLast = idx === STEPS.length - 1

          return (
            <li key={step.key} className="flex items-center flex-1 last:flex-none">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ring-2',
                    isCompleted
                      ? 'bg-purple-600 text-white ring-purple-600'
                      : isActive
                        ? 'bg-white text-purple-600 ring-purple-600'
                        : 'bg-white text-gray-400 ring-gray-300'
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? (
                    // Checkmark for completed steps
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </span>
                <span
                  className={cn(
                    'mt-1 text-xs font-medium hidden sm:block',
                    isActive
                      ? 'text-purple-600'
                      : isCompleted
                        ? 'text-gray-600'
                        : 'text-gray-400'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line between steps */}
              {!isLast && (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1',
                    idx < currentIdx ? 'bg-purple-600' : 'bg-gray-300'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Upload step (step 1)
// ---------------------------------------------------------------------------

interface UploadStepProps {
  onFileAccepted: (csvContent: string, fileName: string) => void
  isPending: boolean
}

function UploadStep({ onFileAccepted, isPending }: UploadStepProps) {
  const [dragOver, setDragOver] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function validateAndRead(file: File) {
    setFileError(null)

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setFileError('Only .csv files are supported.')
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum size is 10 MB.`)
      return
    }

    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text === 'string') {
        onFileAccepted(text, file.name)
      } else {
        setFileError('Failed to read file. Please try again.')
      }
    }
    reader.onerror = () => {
      setFileError('Failed to read file. Please try again.')
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndRead(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) validateAndRead(file)
  }

  return (
    <div>
      <h2 className="mb-1 text-xl font-semibold text-gray-900">Upload CSV File</h2>
      <p className="mb-6 text-sm text-gray-500">
        Upload a CSV file containing your retailer inventory. Maximum file size is 10 MB.
      </p>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop zone for CSV file upload — click to browse or drag and drop a file here"
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-8 py-12 text-center transition-colors cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2',
          dragOver
            ? 'border-purple-500 bg-purple-50'
            : fileError
              ? 'border-red-400 bg-red-50'
              : fileName
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        )}
      >
        <UploadCloud
          className={cn(
            'mb-3 h-10 w-10',
            dragOver ? 'text-purple-500' : fileError ? 'text-red-400' : 'text-gray-400'
          )}
          aria-hidden="true"
        />

        {fileName && !fileError ? (
          <>
            <p className="text-sm font-medium text-green-700">{fileName}</p>
            <p className="mt-1 text-xs text-green-600">
              File selected — click to choose a different file
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700">
              Drag &amp; drop your CSV here
            </p>
            <p className="mt-1 text-xs text-gray-500">
              or click to browse your files
            </p>
          </>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="sr-only"
          aria-label="CSV file input"
          tabIndex={-1}
        />
      </div>

      {/* File validation error */}
      {fileError && (
        <div
          className="mt-3 flex items-start gap-2 rounded-md bg-red-50 px-3 py-2"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" aria-hidden="true" />
          <p className="text-sm text-red-700">{fileError}</p>
        </div>
      )}

      {/* Processing indicator */}
      {isPending && (
        <p className="mt-3 text-sm text-gray-500 text-center">
          Detecting columns…
        </p>
      )}

      <p className="mt-4 text-xs text-gray-400">
        Supported format: CSV (.csv) &middot; Max size: 10 MB
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main wizard component
// ---------------------------------------------------------------------------

/**
 * CsvImportWizard — orchestrates the five-step CSV import flow.
 *
 * Step 1 — Upload:     File drop zone, size/extension validation, header parsing
 * Step 2 — Mapping:    ColumnMapper component (existing) for column assignment
 * Step 3 — Preview:    ImportPreview showing first 20 rows with error highlights
 * Step 4 — Importing:  ImportProgress with polling placeholder
 * Step 5 — Summary:    ImportSummary with stat cards and navigation actions
 *
 * @param orgId      - Platform org ID (TODO: derive from auth context)
 * @param retailerId - Retailer ID for the import target (TODO: derive from auth context)
 */
export function CsvImportWizard({ orgId, retailerId }: CsvImportWizardProps) {
  const [state, setState] = useState<WizardState>(initialState)
  const [isPending, startTransition] = useTransition()

  // --------------------------------------------------------------------------
  // Step 1 → Step 2: file accepted — detect columns
  // --------------------------------------------------------------------------

  const handleFileAccepted = useCallback(
    (csvContent: string) => {
      startTransition(async () => {
        const result = await detectColumnsAction({ csv_content: csvContent })

        if (result.error) {
          setState((prev) => ({
            ...prev,
            // Stay on upload step but surface error via a field set
            // (We'll rely on the UploadStep's own error display; here we
            // just store the content so ColumnMapper has it if the user
            // retries after partial detect.)
            csvContent,
          }))
          return
        }

        setState((prev) => ({
          ...prev,
          step: 'mapping',
          csvContent,
          headers: result.data!.headers,
          rowCount: result.data!.row_count,
          detectedMapping: result.data!.detected_mapping,
        }))
      })
    },
    []
  )

  // --------------------------------------------------------------------------
  // Step 2 → Step 3: mapping confirmed
  // --------------------------------------------------------------------------

  const handleMappingConfirm = useCallback((mapping: Record<string, string>) => {
    setState((prev) => ({
      ...prev,
      step: 'preview',
      confirmedMapping: mapping,
    }))
  }, [])

  // --------------------------------------------------------------------------
  // Step 3 → Step 4: preview confirmed — kick off import
  // --------------------------------------------------------------------------

  const handleImportConfirm = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: 'importing',
      importStatus: 'processing',
      importProgress: 0,
      importError: undefined,
    }))

    startTransition(async () => {
      // TODO: Pass real orgId + retailerId from auth context once wired
      const result = await importCsvAction({
        org_id: orgId ?? 'TODO_ORG_ID',
        retailer_id: retailerId ?? 'TODO_RETAILER_ID',
        csv_content: state.csvContent,
        column_mapping: state.confirmedMapping,
      })

      if (result.error) {
        setState((prev) => ({
          ...prev,
          importStatus: 'failed',
          importError: result.error,
        }))
        return
      }

      const data = result.data!

      setState((prev) => ({
        ...prev,
        step: 'summary',
        importStatus: 'completed',
        importProgress: data.records_processed,
        summary: {
          // TODO: Once the match queue DAL returns matched vs pending counts,
          // replace these placeholder calculations with real values from the
          // action response.
          matched: Math.max(0, data.records_created - data.records_failed),
          pendingReview: data.records_created,
          errors: data.records_failed,
          syncLogId: data.sync_log_id ?? '',
        },
      }))
    })
  }, [state.csvContent, state.confirmedMapping, orgId, retailerId])

  // --------------------------------------------------------------------------
  // Polling callback (ImportProgress calls this every 3s while processing)
  // --------------------------------------------------------------------------

  const handlePoll = useCallback(() => {
    // TODO: Fetch import job status from GET /api/v1/import-jobs/:id/status
    // and update importProgress + importStatus accordingly.
    // For now, simulate linear progress toward completion.
    setState((prev) => {
      if (prev.importStatus !== 'processing') return prev
      const next = Math.min(prev.importProgress + Math.ceil(prev.rowCount / 10), prev.rowCount)
      return { ...prev, importProgress: next }
    })
  }, [])

  // --------------------------------------------------------------------------
  // Retry after failure
  // --------------------------------------------------------------------------

  const handleRetry = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: 'preview',
      importStatus: 'processing',
      importError: undefined,
    }))
  }, [])

  // --------------------------------------------------------------------------
  // Reset to beginning
  // --------------------------------------------------------------------------

  const handleReset = useCallback(() => {
    setState(initialState())
  }, [])

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  const { step } = state

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      {/* Step indicator */}
      <StepIndicator current={step} />

      {/* Step content */}
      <div>
        {step === 'upload' && (
          <UploadStep
            onFileAccepted={handleFileAccepted}
            isPending={isPending}
          />
        )}

        {step === 'mapping' && (
          <ColumnMapper
            headers={state.headers}
            detectedMapping={state.detectedMapping}
            onConfirm={handleMappingConfirm}
            onBack={() => setState((prev) => ({ ...prev, step: 'upload' }))}
          />
        )}

        {step === 'preview' && (
          <ImportPreview
            /**
             * TODO: Replace MOCK_PREVIEW_ROWS with rows built from the real
             * CSV content + confirmedMapping using parseCsv + applyColumnMapping
             * + validateCsvRows from lib/csv.
             */
            rows={MOCK_PREVIEW_ROWS}
            mapping={state.confirmedMapping}
            onConfirm={handleImportConfirm}
            onBack={() => setState((prev) => ({ ...prev, step: 'mapping' }))}
          />
        )}

        {step === 'importing' && (
          <ImportProgress
            status={state.importStatus}
            progress={state.importProgress}
            total={state.rowCount}
            errorMessage={state.importError}
            onRetry={handleRetry}
            onPoll={handlePoll}
          />
        )}

        {step === 'summary' && state.summary && (
          <ImportSummary
            matched={state.summary.matched}
            pendingReview={state.summary.pendingReview}
            errors={state.summary.errors}
            syncLogId={state.summary.syncLogId}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  )
}
