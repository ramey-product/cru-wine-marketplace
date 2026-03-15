import Image from 'next/image'
import { ShareButton } from '@/components/features/producers/ShareButton'

interface ProducerHeroProps {
  name: string
  region: string | null
  country: string | null
  tagline: string | null
  heroImageUrl: string | null
  /** Canonical URL for this producer profile, used by the share button. */
  shareUrl?: string
}

export function ProducerHero({
  name,
  region,
  country,
  tagline,
  heroImageUrl,
  shareUrl,
}: ProducerHeroProps) {
  const location = [region, country].filter(Boolean).join(', ')

  return (
    <section className="space-y-6">
      {/* Hero image */}
      <div className="aspect-video overflow-hidden rounded-lg bg-muted">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt={`${name} vineyard`}
            width={1200}
            height={675}
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
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        )}
      </div>

      {/* Producer name + location + tagline */}
      <div className="space-y-2">
        {/* Name row — share button sits at the trailing edge */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-4xl font-bold text-foreground">
            {name}
          </h1>
          {shareUrl && (
            <div className="flex-shrink-0 pt-1">
              <ShareButton
                url={shareUrl}
                title={name}
                text={tagline ?? undefined}
              />
            </div>
          )}
        </div>
        {location && (
          <p className="text-base text-muted-foreground">{location}</p>
        )}
        {tagline && (
          <p className="text-lg italic text-muted-foreground">&ldquo;{tagline}&rdquo;</p>
        )}
      </div>
    </section>
  )
}
