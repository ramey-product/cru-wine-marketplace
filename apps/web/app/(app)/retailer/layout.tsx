'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ClipboardList,
  Package,
  BarChart3,
  Settings,
  Store,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const RETAILER_NAV = [
  { label: 'Orders', href: '/retailer', icon: ClipboardList },
  { label: 'Inventory', href: '/retailer/inventory', icon: Package },
  { label: 'Analytics', href: '/retailer/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/retailer/settings', icon: Settings },
] as const

export default function RetailerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/retailer') {
      return pathname === '/retailer' || pathname.startsWith('/retailer/orders')
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Store className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Retailer Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage orders, inventory, and settings
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop sidebar nav */}
        <nav
          aria-label="Retailer dashboard navigation"
          className="hidden lg:flex lg:flex-col gap-1 lg:w-52 flex-shrink-0"
        >
          {RETAILER_NAV.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Mobile horizontal tab nav */}
        <nav
          aria-label="Retailer dashboard navigation"
          className="flex lg:hidden gap-1 overflow-x-auto -mx-4 px-4 border-b border-border pb-2"
        >
          {RETAILER_NAV.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
