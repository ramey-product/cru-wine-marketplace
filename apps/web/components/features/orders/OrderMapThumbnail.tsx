import { MapPin, Navigation } from 'lucide-react'

interface OrderMapThumbnailProps {
  lat?: number | null
  lng?: number | null
  retailerName: string
  address?: string | null
}

/**
 * Static Mapbox map thumbnail with retailer pin and "Get Directions" button.
 * Falls back to address text + directions link when coordinates are unavailable.
 */
export function OrderMapThumbnail({
  lat,
  lng,
  retailerName,
  address,
}: OrderMapThumbnailProps) {
  const hasCoordinates = lat != null && lng != null
  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN

  // Google Maps directions link (works with both coords and address)
  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : address
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
      : null

  // Static Mapbox image URL with branded burgundy pin
  const mapUrl =
    hasCoordinates && mapboxToken
      ? `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-l-wine+722F37(${lng},${lat})/${lng},${lat},14,0/600x200@2x?access_token=${mapboxToken}`
      : null

  return (
    <div className="relative overflow-hidden rounded-lg">
      {mapUrl ? (
        <img
          src={mapUrl}
          alt={`Map showing ${retailerName} location`}
          className="h-[200px] w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-[200px] w-full items-center justify-center bg-muted">
          <div className="text-center">
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
            <p className="mt-2 text-sm text-muted-foreground">{retailerName}</p>
            {address && (
              <p className="mt-1 text-xs text-muted-foreground/70">{address}</p>
            )}
          </div>
        </div>
      )}

      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
          aria-label={`Get directions to ${retailerName}`}
        >
          <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
          Get Directions
        </a>
      )}
    </div>
  )
}
