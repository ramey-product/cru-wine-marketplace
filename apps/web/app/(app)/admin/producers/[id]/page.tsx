/**
 * /admin/producers/[id] — Edit producer page.
 *
 * Server Component. Renders producer details in three tabs:
 *   1. Details — ProducerForm pre-filled with producer data
 *   2. Wines — Link to /admin/producers/[id]/wines
 *   3. Photos — Link to /admin/producers/[id]/photos
 *
 * TODO: Replace MOCK_PRODUCER with getProducerById DAL call.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Grape, Images } from 'lucide-react'
import { notFound } from 'next/navigation'
import { ProducerForm } from '@/components/features/admin/ProducerForm'
import type { ProducerFormValues } from '@/components/features/admin/ProducerForm'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Mock data — TODO: Replace with getProducerById DAL call
// ---------------------------------------------------------------------------

interface MockProducer {
  id: string
  name: string
  slug: string
  region: string | null
  country: string | null
  tagline: string | null
  story_content: string | null
  farming_practices: string[]
  vineyard_size: string | null
  year_established: number | null
  annual_production: string | null
  hero_image_url: string | null
  is_active: boolean
}

const MOCK_PRODUCERS: Record<string, MockProducer> = {
  '1': {
    id: '1',
    name: 'Domaine Tempier',
    slug: 'domaine-tempier',
    region: 'Bandol',
    country: 'France',
    tagline: 'The benchmark for Bandol — wild, sun-drenched, and deeply traditional.',
    story_content: `Domaine Tempier has been at the heart of the Bandol appellation since 1834. Owned by the Peyraud family, the estate gained its legendary status through Lulu and Lucien Peyraud, who championed the Mourvèdre grape and the Bandol AOC itself.\n\nToday, the domaine farms its vineyards with an ecological sensitivity passed down through generations, producing wines of remarkable depth and longevity.`,
    farming_practices: ['organic', 'natural'],
    vineyard_size: '25 hectares',
    year_established: 1834,
    annual_production: '80,000 bottles',
    hero_image_url: null,
    is_active: true,
  },
  '2': {
    id: '2',
    name: 'Ridge Vineyards',
    slug: 'ridge-vineyards',
    region: 'Santa Cruz Mountains',
    country: 'United States',
    tagline: "California's most celebrated mountain estate, crafting age-worthy Zinfandel and Cabernet since 1962.",
    story_content: "Founded in 1962 on the Monte Bello ridge at 2,600 feet elevation, Ridge Vineyards has long been synonymous with California's finest mountain wines. Winemaker Paul Draper spent over five decades guiding Ridge's philosophy of minimal intervention and maximum terroir expression.\n\nMonte Bello, the estate's flagship, became globally famous when it topped the 1976 Paris Tasting and the 30-year re-tasting in 2006.",
    farming_practices: ['sustainable'],
    vineyard_size: '160 acres',
    year_established: 1962,
    annual_production: '85,000 cases',
    hero_image_url: null,
    is_active: true,
  },
  '3': {
    id: '3',
    name: 'Kistler Vineyards',
    slug: 'kistler-vineyards',
    region: 'Sonoma Coast',
    country: 'United States',
    tagline: "Burgundy-inspired Chardonnay and Pinot Noir from Sonoma's coolest hillside sites.",
    story_content: 'Founded in 1978 by Steve Kistler and Mark Bixler, Kistler Vineyards is widely regarded as the benchmark for Burgundian-style Chardonnay in California.',
    farming_practices: ['sustainable', 'organic'],
    vineyard_size: '90 acres',
    year_established: 1978,
    annual_production: '26,000 cases',
    hero_image_url: null,
    is_active: true,
  },
  '4': {
    id: '4',
    name: 'Opus One Winery',
    slug: 'opus-one-winery',
    region: 'Oakville',
    country: 'United States',
    tagline: 'A joint vision between Robert Mondavi and Baron Philippe de Rothschild.',
    story_content: 'Opus One was founded in 1979 as a joint venture between Robert Mondavi and Baron Philippe de Rothschild. The winery produces a single, world-class Bordeaux-style blend from its Oakville estate.',
    farming_practices: ['sustainable'],
    vineyard_size: '170 acres',
    year_established: 1979,
    annual_production: '30,000 cases',
    hero_image_url: null,
    is_active: true,
  },
  '5': {
    id: '5',
    name: 'Caymus Vineyards',
    slug: 'caymus-vineyards',
    region: 'Napa Valley',
    country: 'United States',
    tagline: 'Family-owned since 1972, producing lush, approachable Napa Cabernet.',
    story_content: 'Caymus Vineyards was founded by Charlie Wagner in 1972. The winery is known for its rich, full-bodied Napa Valley Cabernet Sauvignon.',
    farming_practices: ['conventional'],
    vineyard_size: '400 acres',
    year_established: 1972,
    annual_production: '1,000,000+ cases',
    hero_image_url: null,
    is_active: false,
  },
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  // TODO: Replace with getProducerById DAL call
  const { id } = await params
  const producer = MOCK_PRODUCERS[id]
  if (!producer) return { title: 'Producer Not Found | Admin' }

  return {
    title: `${producer.name} | Admin`,
    description: producer.tagline ?? undefined,
  }
}

// ---------------------------------------------------------------------------
// Tab nav link
// ---------------------------------------------------------------------------

interface TabLinkProps {
  href: string
  label: string
  icon: React.ReactNode
  description: string
}

function TabLink({ href, label, icon, description }: TabLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-start gap-3 rounded-lg border border-border bg-card p-4',
        'hover:bg-muted/40 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
      aria-label={label}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function EditProducerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // TODO: Replace with getProducerById DAL call
  // const supabase = await createSupabaseServerClient()
  // const { data: producer } = await getProducerById(supabase, id)
  // if (!producer) notFound()

  const { id } = await params
  const producer = MOCK_PRODUCERS[id]
  if (!producer) notFound()

  // Map DB shape to form values
  const initialData: Partial<ProducerFormValues> = {
    name: producer.name,
    slug: producer.slug,
    region: producer.region ?? '',
    country: producer.country ?? '',
    tagline: producer.tagline ?? '',
    story_content: producer.story_content ?? '',
    farming_practices: producer.farming_practices,
    vineyard_size: producer.vineyard_size ?? '',
    year_established: producer.year_established?.toString() ?? '',
    annual_production: producer.annual_production ?? '',
    hero_image_url: producer.hero_image_url ?? '',
    is_active: producer.is_active,
  }

  return (
    <div className="space-y-8">
      {/* Back navigation */}
      <nav aria-label="Breadcrumb">
        <Link
          href="/admin/producers"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to producers list"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Producers
        </Link>
      </nav>

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{producer.name}</h2>
          {producer.region && producer.country && (
            <p className="text-sm text-muted-foreground mt-1">
              {producer.region}, {producer.country}
            </p>
          )}
        </div>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            producer.is_active
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {producer.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Quick-nav to sub-sections */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TabLink
          href={`/admin/producers/${producer.id}/wines`}
          label="Wine Portfolio"
          icon={<Grape className="h-4 w-4" aria-hidden="true" />}
          description="Manage wines, vintages, and pricing"
        />
        <TabLink
          href={`/admin/producers/${producer.id}/photos`}
          label="Photo Gallery"
          icon={<Images className="h-4 w-4" aria-hidden="true" />}
          description="Add, remove, and reorder photos"
        />
      </div>

      {/* Details form */}
      <section aria-labelledby="section-details-heading">
        <h3 id="section-details-heading" className="text-base font-semibold mb-6 pb-2 border-b border-border">
          Producer Details
        </h3>
        <ProducerForm
          initialData={initialData}
          producerId={producer.id}
        />
      </section>
    </div>
  )
}
