'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const SETTINGS_NAV = [
  { label: 'Account', href: '/settings/account' },
  { label: 'Preferences', href: '/settings/preferences' },
  { label: 'Notifications', href: '/settings/notifications' },
  { label: 'Privacy', href: '/settings/privacy' },
] as const

/**
 * Settings sidebar navigation.
 * Must be a client component to read the current pathname for active-link styling.
 */
export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Settings navigation"
      className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible sm:w-48 flex-shrink-0 -mx-4 px-4 sm:mx-0 sm:px-0"
    >
      {SETTINGS_NAV.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={[
              'whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isActive
                ? 'bg-muted text-foreground font-medium border-l-2 border-primary pl-2.5'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            ].join(' ')}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
