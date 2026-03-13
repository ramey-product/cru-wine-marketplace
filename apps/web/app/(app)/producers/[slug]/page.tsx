import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ProducerHero } from '@/components/features/producers/ProducerHero'
import { ProducerStory } from '@/components/features/producers/ProducerStory'
import { ProducerQuickFacts } from '@/components/features/producers/ProducerQuickFacts'
import { PhotoGallery } from '@/components/features/producers/PhotoGallery'
import { ProducerWineGrid } from '@/components/features/producers/ProducerWineGrid'

// TODO: Replace placeholder data with real DAL calls once database is wired
// import { createServerClient } from '@/lib/supabase/server'
// import { getProducerBySlug } from '@/lib/dal/producers'
// import { getWinesByProducer } from '@/lib/dal/wines'

// ---------------------------------------------------------------------------
// Placeholder producer data — remove when DAL is connected
// ---------------------------------------------------------------------------
const PLACEHOLDER_PRODUCERS: Record<string, {
  id: string
  name: string
  slug: string
  region: string | null
  country: string | null
  tagline: string | null
  story_content: string | null
  hero_image_url: string | null
  year_established: number | null
  vineyard_size: string | null
  annual_production: string | null
  farming_practices: string[] | null
  producer_photos: { id: string; image_url: string; caption: string | null; display_order: number }[]
}> = {
  'domaine-tempier': {
    id: 'p1',
    name: 'Domaine Tempier',
    slug: 'domaine-tempier',
    region: 'Bandol',
    country: 'France',
    tagline: 'Where old-vine Mourvedre meets the Mediterranean',
    story_content: `When Daniel Ravier first took over Domaine Tempier in 1951, Bandol was a forgotten appellation. The region's wines were largely used for blending, and few believed that Mourvedre could produce wines of true distinction. Ravier saw things differently.

Over the next five decades, he and his family transformed Domaine Tempier into one of the most celebrated estates in Provence. They championed Mourvedre as the noble grape of Bandol, proving that it could produce wines of extraordinary depth, complexity, and longevity.

Today, the estate is managed by the next generation, who continue the family's commitment to traditional winemaking. The vineyards are farmed biodynamically, the grapes are hand-harvested, and the wines are aged in large oak foudres. The result is a collection of wines that are at once timeless and utterly of their place.`,
    hero_image_url: null,
    year_established: 1834,
    vineyard_size: '30 hectares',
    annual_production: '80,000 bottles',
    farming_practices: ['Organic', 'Biodynamic'],
    producer_photos: [],
  },
}

// Placeholder wines for the producer
const PLACEHOLDER_PRODUCER_WINES: Record<string, Array<{
  id: string
  name: string
  slug: string
  varietal: string | null
  region: string | null
  country: string | null
  vintage: number | null
  image_url: string | null
  price_min: number | null
  price_max: number | null
  description: string | null
  producer: { name: string; slug: string }
}>> = {
  'p1': [
    {
      id: '1',
      name: 'Bandol Rose',
      slug: 'bandol-rose-2023',
      varietal: 'Mourvedre/Grenache/Cinsault',
      region: 'Bandol',
      country: 'France',
      vintage: 2023,
      image_url: null,
      price_min: 28,
      price_max: 30,
      description: 'A wine that captures the essence of Provence in every sip.',
      producer: { name: 'Domaine Tempier', slug: 'domaine-tempier' },
    },
    {
      id: '2',
      name: 'Bandol Rouge La Tourtine',
      slug: 'bandol-rouge-la-tourtine-2020',
      varietal: 'Mourvedre',
      region: 'Bandol',
      country: 'France',
      vintage: 2020,
      image_url: null,
      price_min: 55,
      price_max: 60,
      description: 'From the estate\'s oldest vines, a wine of remarkable depth.',
      producer: { name: 'Domaine Tempier', slug: 'domaine-tempier' },
    },
  ],
}

async function getProducer(slug: string) {
  // TODO: Replace with real DAL call
  // const supabase = await createServerClient()
  // const { data, error } = await getProducerBySlug(supabase, slug)
  // if (error || !data) return null
  // return data

  return PLACEHOLDER_PRODUCERS[slug] ?? null
}

async function getProducerWines(producerId: string) {
  // TODO: Replace with real DAL call
  // const supabase = await createServerClient()
  // const { data } = await getWinesByProducer(supabase, producerId)
  // return data

  return PLACEHOLDER_PRODUCER_WINES[producerId] ?? []
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
  const producer = await getProducer(slug)

  if (!producer) {
    return { title: 'Producer Not Found | Cru' }
  }

  return {
    title: `${producer.name} | Cru`,
    description: producer.tagline ?? `Discover wines from ${producer.name} on Cru.`,
    openGraph: {
      title: producer.name,
      description: producer.tagline ?? undefined,
      type: 'website',
      url: `https://cru.wine/producers/${producer.slug}`,
      ...(producer.hero_image_url && {
        images: [{ url: producer.hero_image_url, width: 1200, height: 675, alt: producer.name }],
      }),
    },
    twitter: { card: 'summary_large_image' },
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProducerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const producer = await getProducer(slug)

  if (!producer) {
    notFound()
  }

  const wines = await getProducerWines(producer.id)

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Producers', href: '/producers' },
    { label: producer.name },
  ]

  return (
    <div className="space-y-10">
      <Breadcrumbs items={breadcrumbs} />

      <ProducerHero
        name={producer.name}
        region={producer.region}
        country={producer.country}
        tagline={producer.tagline}
        heroImageUrl={producer.hero_image_url}
      />

      {/* Story + Quick Facts layout */}
      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
        <ProducerStory storyContent={producer.story_content} />
        <ProducerQuickFacts
          yearEstablished={producer.year_established}
          vineyardSize={producer.vineyard_size}
          annualProduction={producer.annual_production}
          farmingPractices={producer.farming_practices}
        />
      </div>

      {/* Photo Gallery */}
      <PhotoGallery
        photos={producer.producer_photos}
        producerName={producer.name}
      />

      {/* Wine Portfolio */}
      <ProducerWineGrid producerName={producer.name} wines={wines} />
    </div>
  )
}
