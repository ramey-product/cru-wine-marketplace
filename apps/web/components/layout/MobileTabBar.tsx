'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusCircle, Heart, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Browse', href: '/wines', icon: Search },
  { label: 'Add', href: '/add', icon: PlusCircle },
  { label: 'Wishlist', href: '/profile/wishlist', icon: Heart },
  { label: 'Profile', href: '/profile', icon: User },
] as const

export function MobileTabBar() {
  const pathname = usePathname()

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 h-14 border-t border-border bg-background/80 backdrop-blur-md lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex h-full items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors',
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
