'use client'

/**
 * DashboardGreeting — Client Component.
 *
 * Renders a time-sensitive greeting and the current date.
 * Must be a Client Component so `new Date()` reflects the browser's
 * local clock rather than the server render time.
 *
 * TODO: Replace `storeName` prop default with the authenticated retailer's
 *       store name once the DAL / org context is wired up.
 */

interface DashboardGreetingProps {
  /** Display name of the retailer's store, e.g. "Wine House Los Angeles" */
  storeName: string
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatCurrentDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function DashboardGreeting({ storeName }: DashboardGreetingProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {getGreeting()}, {storeName}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {formatCurrentDate()}
      </p>
    </div>
  )
}
