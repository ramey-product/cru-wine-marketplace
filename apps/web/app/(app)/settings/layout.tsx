import Link from 'next/link'

const SETTINGS_NAV = [
  { label: 'Profile', href: '/settings/profile' },
  { label: 'Taste Profile', href: '/settings/taste-profile' },
  { label: 'Preferences', href: '/settings/preferences' },
  { label: 'Notifications', href: '/settings/notifications' },
  { label: 'Account', href: '/settings/account' },
] as const

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      <div className="flex flex-col sm:flex-row gap-8">
        {/* Sidebar nav (desktop) / horizontal scroll (mobile) */}
        <nav
          aria-label="Settings navigation"
          className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible sm:w-48 flex-shrink-0 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {SETTINGS_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
