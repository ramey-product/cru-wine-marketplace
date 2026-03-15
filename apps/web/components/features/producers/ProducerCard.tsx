import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ProducerCardProps {
  producer: {
    name: string
    slug: string
    region: string | null
    country: string | null
    tagline: string | null
  }
  className?: string
}

/**
 * Compact producer card used in discovery contexts (home page, search results).
 * Links to the full producer profile page at /producers/[slug].
 */
export function ProducerCard({ producer, className }: ProducerCardProps) {
  const location = [producer.region, producer.country].filter(Boolean).join(', ')

  return (
    <Link
      href={`/producers/${producer.slug}`}
      aria-label={`Visit ${producer.name} producer page${location ? `, ${location}` : ''}`}
      className={cn(
        'group block rounded-lg border border-border bg-card overflow-hidden',
        'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
        className
      )}
    >
      {/* Image placeholder — replace with <Image> once producer images are available */}
      <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
        {/* Vineyard / landscape icon — matches the placeholder style used in ProducerHero */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground group-hover:scale-110 transition-transform duration-300"
          aria-hidden="true"
        >
          {/* Simple vine/grape cluster icon */}
          <circle cx="12" cy="8" r="3" />
          <path d="M12 11v2" />
          <path d="M9 13.5c0 1.5 1.3 2.5 3 2.5s3-1 3-2.5" />
          <path d="M7.5 10.5c-1.5.5-2.5 1.7-2.5 3" />
          <path d="M16.5 10.5c1.5.5 2.5 1.7 2.5 3" />
          <path d="M5 20h14" />
          <path d="M8 20c0-2.2 1.8-4 4-4s4 1.8 4 4" />
        </svg>
      </div>

      <div className="p-4 space-y-1.5">
        <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">
          {producer.name}
        </h3>

        {location && (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {location}
          </p>
        )}

        {producer.tagline && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {producer.tagline}
          </p>
        )}
      </div>
    </Link>
  )
}
