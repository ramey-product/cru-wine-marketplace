import { SectionSkeleton } from '@/components/features/curation/SectionSkeleton'

export default function HomeLoading() {
  return (
    <div className="space-y-12">
      <div>
        <div className="h-9 w-48 rounded bg-muted animate-pulse" />
        <div className="mt-2 h-5 w-72 rounded bg-muted animate-pulse" />
      </div>
      <SectionSkeleton variant="carousel" />
      <SectionSkeleton variant="carousel" />
      <SectionSkeleton variant="grid" />
    </div>
  )
}
