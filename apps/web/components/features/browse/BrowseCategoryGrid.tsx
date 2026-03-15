import Link from 'next/link'
import { MapPin, Grape, Sparkles, Store } from 'lucide-react'
import type { BrowseTab } from './BrowseTabs'

interface CategoryItem {
  name: string
  slug: string
  count: number
  description?: string
}

interface BrowseCategoryGridProps {
  tab: BrowseTab
  regions: CategoryItem[]
  varietals: CategoryItem[]
  occasions: CategoryItem[]
  producers: CategoryItem[]
}

const TAB_CONFIG: Record<
  Exclude<BrowseTab, 'all'>,
  {
    title: string
    subtitle: string
    icon: typeof MapPin
    hrefPrefix: string
  }
> = {
  region: {
    title: 'Explore by Region',
    subtitle: 'Discover wines from the world\'s most celebrated growing regions.',
    icon: MapPin,
    hrefPrefix: '/wines/region/',
  },
  varietal: {
    title: 'Explore by Varietal',
    subtitle: 'Find wines crafted from your favorite grape varieties.',
    icon: Grape,
    hrefPrefix: '/wines/varietal/',
  },
  occasion: {
    title: 'Explore by Occasion',
    subtitle: 'The perfect bottle for every moment.',
    icon: Sparkles,
    hrefPrefix: '/wines?occasion=',
  },
  producer: {
    title: 'Explore by Producer',
    subtitle: 'Meet the winemakers behind every bottle.',
    icon: Store,
    hrefPrefix: '/producers/',
  },
}

function getItems(
  tab: Exclude<BrowseTab, 'all'>,
  props: BrowseCategoryGridProps
): CategoryItem[] {
  switch (tab) {
    case 'region':
      return props.regions
    case 'varietal':
      return props.varietals
    case 'occasion':
      return props.occasions
    case 'producer':
      return props.producers
  }
}

function getHref(tab: Exclude<BrowseTab, 'all'>, slug: string): string {
  const config = TAB_CONFIG[tab]
  if (tab === 'occasion') {
    // Occasion doesn't have a dedicated route yet, link back to wines with param
    return `/wines?occasion=${encodeURIComponent(slug)}`
  }
  return `${config.hrefPrefix}${encodeURIComponent(slug)}`
}

export function BrowseCategoryGrid(props: BrowseCategoryGridProps) {
  const { tab } = props

  if (tab === 'all') return null

  const config = TAB_CONFIG[tab]
  const items = getItems(tab, props)
  const Icon = config.icon

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-xl font-semibold tracking-tight">{config.title}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{config.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={getHref(tab, item.slug)}
            className="group block rounded-lg border border-border p-5 transition-colors hover:bg-muted/50 hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Browse ${item.name} wines`}
          >
            <h3 className="font-medium text-foreground group-hover:text-foreground/90">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {item.count} {item.count === 1 ? 'wine' : 'wines'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
