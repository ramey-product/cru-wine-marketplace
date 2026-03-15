import Link from 'next/link'
import { ProducerCard } from '@/components/features/producers/ProducerCard'

// TODO: Replace with real getActiveProducers() DAL call (limit 3, ordered by featured_at or created_at)
const MOCK_PRODUCERS = [
  {
    id: '1',
    name: 'Domaine Leflaive',
    slug: 'domaine-leflaive',
    region: 'Burgundy',
    country: 'France',
    tagline: 'Four generations of biodynamic Chardonnay in the heart of Puligny-Montrachet.',
  },
  {
    id: '2',
    name: 'Pax Wine Cellars',
    slug: 'pax-wine-cellars',
    region: 'Sonoma Coast',
    country: 'United States',
    tagline:
      'Cool-climate Syrah and Grenache grown with deep respect for California\'s wild terroir.',
  },
  {
    id: '3',
    name: 'Bodegas Vega Sicilia',
    slug: 'bodegas-vega-sicilia',
    region: 'Ribera del Duero',
    country: 'Spain',
    tagline:
      'Spain\'s most revered estate — over 150 years of Tempranillo tradition and quiet mastery.',
  },
]

/**
 * "Discover Producers" home-page section.
 * Displays 3 producer cards in a responsive 1→3-column grid with a heading and
 * a "View All Producers" footer link.
 *
 * Currently uses mock data. When the producers DAL is available, swap
 * MOCK_PRODUCERS for an async DAL call (make this component async and await it).
 */
export function DiscoverProducers() {
  return (
    <section aria-label="Discover producers">
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Meet the People Behind the Wine</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Stories, craft, and character — straight from the source.
          </p>
        </div>
        <Link
          href="/producers"
          className="text-sm text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
          aria-label="View all producers"
        >
          See all
        </Link>
      </div>

      {/* Producer cards grid: 1 col mobile → 3 col desktop */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_PRODUCERS.map((producer) => (
          <ProducerCard key={producer.id} producer={producer} />
        ))}
      </div>

      {/* Footer CTA — secondary entry point, visible on all breakpoints */}
      <div className="mt-6 text-center">
        <Link
          href="/producers"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          aria-label="View all wine producers"
        >
          View All Producers
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
