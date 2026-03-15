import { CsvImportWizard } from '@/components/features/csv-import/CsvImportWizard'
import { Upload } from 'lucide-react'

/**
 * CSV Import page — admin area inventory import wizard.
 *
 * Route: /admin/inventory/import
 *
 * Renders the full CsvImportWizard which orchestrates:
 *   1. File upload + validation
 *   2. Column mapping (auto-detect + manual override)
 *   3. Preview table with validation error highlights
 *   4. Import progress indicator
 *   5. Post-import summary with match/pending/error counts
 *
 * TODO: Pass retailerId derived from the authenticated user's session.
 *       Once auth context helpers are available, call something like:
 *         const { orgId, retailerId } = await getRetailerFromSession()
 *       and forward them to CsvImportWizard.
 */
export default function InventoryImportPage() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Upload className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Import Inventory</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Upload a CSV file to import retailer inventory. Rows are matched
            against the wine catalogue and queued for manual review when no
            automatic match is found.
          </p>
        </div>
      </div>

      {/* Wizard */}
      {/*
       * TODO: Pass retailerId from auth context
       * e.g. <CsvImportWizard orgId={orgId} retailerId={retailerId} />
       */}
      <CsvImportWizard />
    </div>
  )
}
