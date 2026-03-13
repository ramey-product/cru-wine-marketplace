import { PreferencesForm } from '@/components/features/settings/PreferencesForm'

export const metadata = {
  title: 'Preferences | Cru',
}

// TODO: Fetch real preferences from DAL
const MOCK_PREFERENCES = {
  locationZip: '',
  priceRangeMin: null as number | null,
  priceRangeMax: null as number | null,
  occasionTags: [] as string[],
}

export default function PreferencesSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Help us personalize your experience.
        </p>
      </div>

      <PreferencesForm initialData={MOCK_PREFERENCES} />
    </div>
  )
}
