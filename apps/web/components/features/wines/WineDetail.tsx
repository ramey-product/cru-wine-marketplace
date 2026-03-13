import Image from 'next/image'
import Link from 'next/link'
import { TastingNotes } from './TastingNotes'
import { FoodPairings } from './FoodPairings'
import { WineAvailability } from './WineAvailability'
import { PurchaseCard } from './PurchaseCard'
import { formatWinePrice, formatVarietalRegion } from './utils'

interface WineDetailProps {
  wine: {
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
    wine_tags?: { tag_name: string }[]
    wine_occasions?: { occasion_name: string }[]
  }
}

export function WineDetail({ wine }: WineDetailProps) {
  const displayName = wine.vintage ? `${wine.name} ${wine.vintage}` : wine.name
  const price = formatWinePrice(wine.price_min, wine.price_max)
  const varietalRegion = formatVarietalRegion(wine.varietal, wine.region, wine.country)

  // Build a producer story hook from description (first 2-3 sentences)
  const storyHook = wine.description
    ? wine.description.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ')
    : null

  return (
    <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-10">
      {/* Left column: Image + Wine info */}
      <div className="space-y-8">
        {/* Wine image */}
        <div className="aspect-[3/4] max-w-md mx-auto lg:mx-0 overflow-hidden rounded-lg bg-muted">
          {wine.image_url ? (
            <Image
              src={wine.image_url}
              alt={displayName}
              width={600}
              height={800}
              className="w-full h-full object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M8 22h8" />
                <path d="M7 10h10" />
                <path d="M12 15v7" />
                <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" />
              </svg>
            </div>
          )}
        </div>

        {/* Producer overline */}
        <div className="space-y-1">
          <Link
            href={`/producers/${wine.producer.slug}`}
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors duration-150"
          >
            {wine.producer.name}
          </Link>

          {/* Wine name */}
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            {displayName}
          </h1>

          {/* Varietal / Region */}
          {varietalRegion && (
            <p className="text-base text-muted-foreground">{varietalRegion}</p>
          )}
        </div>

        {/* Producer story hook */}
        {storyHook && (
          <div className="space-y-2">
            <p className="text-base leading-relaxed text-muted-foreground">
              {storyHook}
            </p>
            <Link
              href={`/producers/${wine.producer.slug}`}
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              Read full story
              <span className="ml-1" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        )}

        {/* Divider */}
        <hr className="border-border" />

        {/* Tasting Notes */}
        <TastingNotes description={wine.tasting_notes} />

        {/* Food Pairings */}
        <FoodPairings pairings={wine.food_pairings} />

        {/* Tags / Occasions */}
        {((wine.wine_tags && wine.wine_tags.length > 0) ||
          (wine.wine_occasions && wine.wine_occasions.length > 0)) && (
          <div className="space-y-3">
            {wine.wine_tags && wine.wine_tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {wine.wine_tags.map((tag) => (
                  <span
                    key={tag.tag_name}
                    className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
                  >
                    {tag.tag_name}
                  </span>
                ))}
              </div>
            )}
            {wine.wine_occasions && wine.wine_occasions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {wine.wine_occasions.map((occasion) => (
                  <span
                    key={occasion.occasion_name}
                    className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    {occasion.occasion_name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Availability section (mobile only — desktop shows in PurchaseCard sidebar) */}
        <div className="lg:hidden">
          <WineAvailability id="availability-mobile" />
        </div>
      </div>

      {/* Right column: Purchase card (desktop sidebar) */}
      <div>
        <PurchaseCard
          price={price}
          isAvailable={false}
          wineName={displayName}
        />
        {/* Availability in desktop sidebar */}
        <div className="hidden lg:block mt-6">
          <WineAvailability id="availability-desktop" />
        </div>
      </div>
    </div>
  )
}
