import Image from 'next/image'

interface ProducerHeroProps {
  name: string
  region: string | null
  country: string | null
  tagline: string | null
  heroImageUrl: string | null
}

export function ProducerHero({
  name,
  region,
  country,
  tagline,
  heroImageUrl,
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
        <h1 className="font-display text-4xl font-bold text-foreground">
          {name}
        </h1>
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
