import { Separator } from '@/components/ui/separator'

/**
 * Skeleton loading state for the retailer settings page.
 * Mirrors the section layout of the settings page so the UI feels stable on load.
 */
export default function RetailerSettingsLoading() {
  return (
    <div className="space-y-10 pb-16" aria-busy="true" aria-label="Loading settings">
      {/* Page heading skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-24 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-80 rounded-md bg-muted animate-pulse" />
      </div>

      {/* Section 1: Store Information */}
      <section aria-label="Loading store information">
        <SectionHeaderSkeleton titleWidth="w-40" descWidth="w-72" />
        <div className="mt-4 space-y-4">
          <FieldSkeleton labelWidth="w-24" />
          <FieldSkeleton labelWidth="w-32" />
          <div className="grid grid-cols-6 gap-3">
            <div className="col-span-3"><FieldSkeleton labelWidth="w-16" /></div>
            <div className="col-span-1"><FieldSkeleton labelWidth="w-12" /></div>
            <div className="col-span-2"><FieldSkeleton labelWidth="w-10" /></div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldSkeleton labelWidth="w-14" />
            <FieldSkeleton labelWidth="w-14" />
          </div>
          {/* Hours skeleton — 7 rows */}
          <div className="space-y-2 pt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                <div className="h-8 w-28 rounded bg-muted animate-pulse" />
                <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                <div className="h-8 w-28 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
          <SaveButtonSkeleton />
        </div>
      </section>

      <Separator />

      {/* Section 2: Fulfillment */}
      <section aria-label="Loading fulfillment settings">
        <SectionHeaderSkeleton titleWidth="w-28" descWidth="w-80" />
        <div className="mt-4 space-y-4">
          <ToggleRowSkeleton />
          <ToggleRowSkeleton />
          <SaveButtonSkeleton />
        </div>
      </section>

      <Separator />

      {/* Section 3: POS Connection */}
      <section aria-label="Loading POS connection status">
        <SectionHeaderSkeleton titleWidth="w-36" descWidth="w-64" />
        <div className="mt-4 h-20 rounded-lg bg-muted animate-pulse" />
      </section>

      <Separator />

      {/* Section 4: Notifications */}
      <section aria-label="Loading notification preferences">
        <SectionHeaderSkeleton titleWidth="w-32" descWidth="w-72" />
        <div className="mt-4 space-y-4">
          <ToggleRowSkeleton />
          <ToggleRowSkeleton />
          <SaveButtonSkeleton />
        </div>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Small skeleton sub-components kept local to this file
// ---------------------------------------------------------------------------

function SectionHeaderSkeleton({
  titleWidth,
  descWidth,
}: {
  titleWidth: string
  descWidth: string
}) {
  return (
    <div className="space-y-1.5">
      <div className={`h-5 ${titleWidth} rounded-md bg-muted animate-pulse`} />
      <div className={`h-4 ${descWidth} rounded-md bg-muted animate-pulse`} />
    </div>
  )
}

function FieldSkeleton({ labelWidth }: { labelWidth: string }) {
  return (
    <div className="space-y-1.5">
      <div className={`h-4 ${labelWidth} rounded-md bg-muted animate-pulse`} />
      <div className="h-9 w-full rounded-lg bg-muted animate-pulse" />
    </div>
  )
}

function ToggleRowSkeleton() {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 h-4 w-4 rounded bg-muted animate-pulse" />
      <div className="space-y-1.5 flex-1">
        <div className="h-4 w-36 rounded-md bg-muted animate-pulse" />
        <div className="h-3 w-64 rounded-md bg-muted animate-pulse" />
      </div>
    </div>
  )
}

function SaveButtonSkeleton() {
  return (
    <div className="flex justify-end pt-2">
      <div className="h-9 w-28 rounded-lg bg-muted animate-pulse" />
    </div>
  )
}
