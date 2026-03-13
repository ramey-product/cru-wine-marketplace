import Link from 'next/link'
import { TasteProfileEditor } from '@/components/features/taste-profile/TasteProfileEditor'

export const metadata = {
  title: 'Taste Profile Settings | Cru',
  description: 'View and edit your wine taste preferences.',
}

// TODO: Replace with real DAL call to getTasteProfile + getTasteProfileWines
const MOCK_PROFILE = {
  flavor_affinities: ['berry', 'vanilla', 'herbal'] as string[],
  flavor_aversions: ['very_sweet', 'oaky_buttery'] as string[],
  drinking_contexts: ['dinner_at_home', 'at_restaurants'] as string[],
  adventurousness_score: 2,
}

const MOCK_LOVED_WINES = [
  { id: '1', name: 'Estate Reserve', varietal: 'Cabernet Sauvignon', producer_name: 'Opus One' },
  { id: '5', name: 'Willamette Valley Pinot Noir', varietal: 'Pinot Noir', producer_name: 'Domaine Drouhin' },
]

// Set to true to simulate a user with no profile
const HAS_PROFILE = true

export default function TasteProfileSettingsPage() {
  if (!HAS_PROFILE) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Taste Profile</h1>
          <p className="mt-1 text-muted-foreground">
            You haven&apos;t set up your taste profile yet.
          </p>
        </div>

        <div className="rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="text-xl font-semibold">Tell us what you like</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            In 2 minutes, we&apos;ll learn your taste and show you wines you&apos;ll love.
          </p>
          <Link
            href="/onboarding"
            className="mt-4 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Taste Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your preferences as your palate evolves.
          </p>
        </div>
        <Link
          href="/onboarding?redo=true"
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Redo Taste Profile
        </Link>
      </div>

      <TasteProfileEditor profile={MOCK_PROFILE} lovedWines={MOCK_LOVED_WINES} />
    </div>
  )
}
