import { MapPin } from 'lucide-react'

interface Retailer {
  id: string
  name: string
  distance_miles: number
  price: number
  fulfillment: ('pickup' | 'delivery')[]
}

interface WineAvailabilityProps {
  retailers?: Retailer[] | null
}

export function WineAvailability({ retailers }: WineAvailabilityProps) {
  // TODO: Wire up real retailer availability data
  if (!retailers || retailers.length === 0) {
    return (
      <section aria-labelledby="availability-heading">
        <h2
          id="availability-heading"
          className="text-lg font-semibold text-foreground mb-3"
        >
          Availability
        </h2>
        <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Check back soon for availability near you.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="availability-heading">
      <h2
        id="availability-heading"
        className="text-lg font-semibold text-foreground mb-3"
      >
        Available Nearby
      </h2>
      <ul className="space-y-3">
        {retailers.map((retailer) => (
          <li
            key={retailer.id}
            className="rounded-lg border border-border p-3 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-foreground">{retailer.name}</p>
              <p className="text-xs text-muted-foreground">
                {retailer.distance_miles} mi &middot; ${retailer.price.toFixed(2)}
              </p>
              <div className="flex gap-1.5 mt-1">
                {retailer.fulfillment.map((method) => (
                  <span
                    key={method}
                    className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
