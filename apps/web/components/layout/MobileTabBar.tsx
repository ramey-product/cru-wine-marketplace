'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusCircle, Heart, User, Bookmark, ScanLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const tabs = [
  { label: 'Home', href: '/home', icon: Home },
  { label: 'Browse', href: '/wines', icon: Search },
  // Center "+" is handled separately as a sheet trigger
  { label: 'Wishlist', href: '/wishlist', icon: Heart },
  { label: 'Profile', href: '/settings/profile', icon: User },
] as const

const quickActions = [
  { label: 'Add to Wishlist', href: '/wines', icon: Bookmark, description: 'Search and save a wine' },
  { label: 'Scan Label', href: '#', icon: ScanLine, description: 'Coming soon' },
] as const

export function MobileTabBar() {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)

  function isActive(href: string): boolean {
    if (href === '/home') return pathname === '/home' || pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 h-14 border-t border-border bg-background/80 backdrop-blur-md lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex h-full items-center justify-around">
        {/* First two tabs: Home, Browse */}
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors min-w-[44px] min-h-[44px]',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{tab.label}</span>
            </Link>
          )
        })}

        {/* Center: Quick action "+" button — opens sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            className="flex flex-col items-center justify-center gap-0.5 text-[10px] text-muted-foreground transition-colors min-w-[44px] min-h-[44px]"
            aria-label="Quick actions"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <PlusCircle className="h-5 w-5" aria-hidden="true" />
            </div>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-xl">
            <SheetHeader>
              <SheetTitle>Quick Actions</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-2 pb-6">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    onClick={() => setSheetOpen(false)}
                    className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </SheetContent>
        </Sheet>

        {/* Last two tabs: Wishlist, Profile */}
        {tabs.slice(2).map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors min-w-[44px] min-h-[44px]',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
