import { Calendar, Grape, Leaf, Wine } from 'lucide-react'

interface ProducerQuickFactsProps {
  yearEstablished: number | null
  vineyardSize: string | null
  annualProduction: string | null
  farmingPractices: string[] | null
}

export function ProducerQuickFacts({
  yearEstablished,
  vineyardSize,
  annualProduction,
  farmingPractices,
}: ProducerQuickFactsProps) {
  const hasFacts =
    yearEstablished || vineyardSize || annualProduction || (farmingPractices && farmingPractices.length > 0)

  if (!hasFacts) {
    return null
  }

  return (
    <aside aria-labelledby="quick-facts-heading">
      <h2
        id="quick-facts-heading"
        className="text-lg font-semibold text-foreground mb-4"
      >
        Quick Facts
      </h2>
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        {yearEstablished && (
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs text-muted-foreground">Established</p>
              <p className="text-sm font-medium text-foreground">{yearEstablished}</p>
            </div>
          </div>
        )}

        {vineyardSize && (
          <div className="flex items-center gap-3">
            <Grape className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs text-muted-foreground">Vineyard Size</p>
              <p className="text-sm font-medium text-foreground">{vineyardSize}</p>
            </div>
          </div>
        )}

        {annualProduction && (
          <div className="flex items-center gap-3">
            <Wine className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs text-muted-foreground">Annual Production</p>
              <p className="text-sm font-medium text-foreground">{annualProduction}</p>
            </div>
          </div>
        )}

        {farmingPractices && farmingPractices.length > 0 && (
          <div className="flex items-start gap-3">
            <Leaf className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Farming Practices</p>
              <div className="flex flex-wrap gap-1.5">
                {farmingPractices.map((practice) => (
                  <span
                    key={practice}
                    className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                  >
                    {practice}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
