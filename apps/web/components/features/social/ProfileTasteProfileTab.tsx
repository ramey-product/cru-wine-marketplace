import { Badge } from '@/components/ui/badge'

// Mock taste profile data for public view
const MOCK_TASTE_PROFILE = {
  favoriteRegions: ['Bordeaux', 'Napa Valley', 'Piedmont'],
  favoriteVarietals: ['Cabernet Sauvignon', 'Pinot Noir', 'Nebbiolo'],
  flavorPreferences: ['Dark Cherry', 'Cedar', 'Vanilla', 'Earthy'],
  adventurenessLabel: 'Curious Explorer',
  drinkingContexts: ['Dinner at home', 'Special occasions'],
}

interface TasteSectionProps {
  title: string
  items: string[]
}

function TasteSection({ title, items }: TasteSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant="secondary">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  )
}

export function ProfileTasteProfileTab() {
  const profile = MOCK_TASTE_PROFILE

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6 space-y-6">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Wine Personality</h2>
          <p className="text-sm text-primary font-medium">
            {profile.adventurenessLabel}
          </p>
        </div>

        <TasteSection title="Favorite Regions" items={profile.favoriteRegions} />
        <TasteSection title="Favorite Varietals" items={profile.favoriteVarietals} />
        <TasteSection title="Flavor Preferences" items={profile.flavorPreferences} />
        <TasteSection title="Drinking Contexts" items={profile.drinkingContexts} />
      </div>
    </div>
  )
}
