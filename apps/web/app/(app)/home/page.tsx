import { Suspense } from 'react'
import { HeroGreeting } from '@/components/features/curation/HeroGreeting'
import { PickedForYou } from '@/components/features/curation/PickedForYou'
import { CuratedCollectionsRow } from '@/components/features/curation/CuratedCollectionsRow'
import { PopularNearYou } from '@/components/features/curation/PopularNearYou'
import { TasteProfileCTA } from '@/components/features/curation/TasteProfileCTA'
import { SectionSkeleton } from '@/components/features/curation/SectionSkeleton'

export const metadata = {
  title: 'Home | Cru',
  description: 'Discover wines picked for your taste, curated collections, and trending bottles nearby.',
}

// TODO: Replace with real auth check for taste profile existence
const HAS_TASTE_PROFILE = true

export default function HomePage() {
  return (
    <div className="space-y-12">
      <HeroGreeting />

      {HAS_TASTE_PROFILE ? (
        <Suspense fallback={<SectionSkeleton variant="carousel" />}>
          <PickedForYou />
        </Suspense>
      ) : (
        <TasteProfileCTA />
      )}

      <Suspense fallback={<SectionSkeleton variant="carousel" />}>
        <CuratedCollectionsRow />
      </Suspense>

      <Suspense fallback={<SectionSkeleton variant="grid" />}>
        <PopularNearYou />
      </Suspense>
    </div>
  )
}
