'use client'

import { useTransition } from 'react'

/** Represents a single OAuth provider connection */
interface ServiceConnection {
  id: string
  label: string
  /** Whether the user currently has this provider linked */
  connected: boolean
}

// TODO: Replace with real OAuth connection state fetched from Supabase auth.identities
const MOCK_SERVICES: ServiceConnection[] = [
  { id: 'google', label: 'Google', connected: true },
]

/**
 * Displays linked OAuth providers and allows the user to connect or disconnect
 * each one.  Mutations are stubbed — wire to Supabase OAuth link/unlink actions
 * when auth integrations are implemented.
 */
export function ConnectedServices() {
  const [isPending, startTransition] = useTransition()

  const handleToggle = (service: ServiceConnection) => {
    startTransition(async () => {
      // TODO: Call linkOAuthProvider / unlinkOAuthProvider server action
      // For now this is a no-op stub
      await new Promise((r) => setTimeout(r, 300))
    })
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-3">Connected services</h3>

      <div className="rounded-lg border border-border bg-card divide-y divide-border">
        {MOCK_SERVICES.map((service) => (
          <div key={service.id} className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              {/* Google "G" icon — inline SVG avoids an external dependency */}
              {service.id === 'google' && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 shrink-0"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}

              <div>
                <p className="text-sm font-medium text-foreground">{service.label}</p>
                <p className="text-xs text-muted-foreground">
                  {service.connected ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle(service)}
              disabled={isPending}
              aria-label={service.connected ? `Disconnect ${service.label}` : `Connect ${service.label}`}
              className={[
                'shrink-0 rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:opacity-50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                service.connected
                  ? 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                  : 'border-primary text-primary hover:bg-primary/10',
              ].join(' ')}
            >
              {service.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
