import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { WineDetail } from '@/components/features/wines/WineDetail'
import { RecommendedWines } from '@/components/features/wines/RecommendedWines'
import { PLACEHOLDER_WINES as BROWSE_WINES } from '../_lib/placeholder-wines'

// TODO: Replace placeholder data with real DAL calls once database is wired
// import { createServerClient } from '@/lib/supabase/server'
// import { getWineBySlug } from '@/lib/dal/wines'

// ---------------------------------------------------------------------------
// Placeholder wine data — remove when DAL is connected
// ---------------------------------------------------------------------------
const PLACEHOLDER_WINES: Record<string, {
  id: string
  name: string
  slug: string
  varietal: string | null
  region: string | null
  sub_region: string | null
  country: string | null
  vintage: number | null
  image_url: string | null
  price_min: number | null
  price_max: number | null
  description: string | null
  tasting_notes: string | null
  food_pairings: string[] | null
  producer: {
    id: string
    name: string
    slug: string
    region: string | null
    country: string | null
    hero_image_url: string | null
  }
  wine_tags: { tag_name: string }[]
  wine_occasions: { occasion_name: string }[]
}> = {
  'bandol-rose-2023': {
    id: '1',
    name: 'Bandol Rose',
    slug: 'bandol-rose-2023',
    varietal: 'Mourvedre/Grenache/Cinsault',
    region: 'Bandol',
    sub_region: 'Provence',
    country: 'France',
    vintage: 2023,
    image_url: null,
    price_min: 28,
    price_max: 30,
    description: 'When you open a bottle of Domaine Tempier Bandol Rose, you are greeted by the scent of the Mediterranean. This is a wine that captures the essence of Provence in every sip.',
    tasting_notes: 'Think ripe blackberry, a hint of dried herbs, and a finish that lingers with notes of lavender and sea salt. The texture is silky yet structured, with bright acidity that makes it incredibly food-friendly.',
    food_pairings: ['Grilled lamb', 'Provencal ratatouille', 'Summer salads with olive oil', 'Fresh seafood'],
    producer: {
      id: 'p1',
      name: 'Domaine Tempier',
      slug: 'domaine-tempier',
      region: 'Bandol',
      country: 'France',
      hero_image_url: null,
    },
    wine_tags: [{ tag_name: 'Natural' }, { tag_name: 'Biodynamic' }],
    wine_occasions: [{ occasion_name: 'Summer dining' }, { occasion_name: 'Date night' }],
  },
}

async function getWine(slug: string) {
  // TODO: Replace with real DAL call
  // const supabase = await createServerClient()
  // const { data, error } = await getWineBySlug(supabase, slug)
  // if (error || !data) return null
  // return data

  return PLACEHOLDER_WINES[slug] ?? null
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const wine = await getWine(slug)

  if (!wine) {
    return { title: 'Wine Not Found | Cru' }
  }

  const displayName = wine.vintage ? `${wine.name} ${wine.vintage}` : wine.name

  return {
    title: `${displayName} by ${wine.producer.name} | Cru`,
    description: wine.tasting_notes ?? wine.description ?? `Discover ${displayName} by ${wine.producer.name} on Cru.`,
    openGraph: {
      title: `${displayName} by ${wine.producer.name}`,
      description: wine.tasting_notes ?? wine.description ?? undefined,
      type: 'website',
      url: `https://cru.wine/wines/${wine.slug}`,
      ...(wine.image_url && { images: [{ url: wine.image_url, width: 600, height: 800, alt: displayName }] }),
    },
    twitter: { card: 'summary_large_image' },
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function WineDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const wine = await getWine(slug)

  if (!wine) {
    notFound()
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Wines', href: '/wines' },
    ...(wine.country ? [{ label: wine.country, href: `/wines?country=${wine.country}` }] : []),
    { label: wine.vintage ? `${wine.name} ${wine.vintage}` : wine.name },
  ]

  return (
    <div className="space-y-10">
      <Breadcrumbs items={breadcrumbs} />
      <WineDetail wine={wine} />

      {/* "You Might Also Enjoy" section */}
      <section aria-labelledby="also-enjoy-heading" className="pt-6 border-t border-border">
        <h2 id="also-enjoy-heading" className="font-display text-2xl font-bold text-foreground mb-6">
          You Might Also Enjoy
        </h2>
        <RecommendedWines
          wines={BROWSE_WINES.filter((w) => w.slug !== wine.slug).slice(0, 6)}
        />
      </section>
    </div>
  )
}
