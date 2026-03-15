'use client'

/**
 * Compact wine recommendation card used on the Profile Summary (Step 5).
 * Intentionally lightweight — no image, no availability indicator.
 * The full WineCard is used on wine listing pages; this variant is
 * optimised for the 2×4 grid on the onboarding summary screen.
 */

interface RecommendationCardProps {
  wine: {
    name: string
    producer: string
    region: string
    varietal: string
    price: string
  }
}

export function RecommendationCard({ wine }: RecommendationCardProps) {
  return (
    <article
      aria-label={`Recommendation: ${wine.name} by ${wine.producer}, ${wine.price}`}
      className="rounded-lg border border-border bg-card p-3 space-y-1 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Producer name — muted, uppercase, small */}
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground truncate">
        {wine.producer}
      </p>

      {/* Wine name */}
      <h4 className="text-sm font-medium leading-snug line-clamp-2">
        {wine.name}
      </h4>

      {/* Varietal — Region */}
      <p className="text-xs text-muted-foreground truncate">
        {wine.varietal} — {wine.region}
      </p>

      {/* Price */}
      <p className="text-sm font-semibold font-mono" aria-label={`Price: ${wine.price}`}>
        {wine.price}
      </p>
    </article>
  )
}
