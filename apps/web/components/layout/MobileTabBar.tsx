'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Search,
  ShoppingBag,
  Heart,
  User,
  Wine,
  Bookmark,
  ScanLine,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart/CartContext'
import { formatCartPrice } from '@/lib/cart/cart-store'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

// ---------------------------------------------------------------------------
// Tab configuration
// ---------------------------------------------------------------------------

const tabs = [
  { label: 'Home', href: '/home', icon: Home },
  { label: 'Browse', href: '/wines', icon: Search },
  // Center button is handled separately as a Commerce Hub sheet trigger
  { label: 'Wishlist', href: '/wishlist', icon: Heart },
  { label: 'Profile', href: '/settings/profile', icon: User },
] as const

// ---------------------------------------------------------------------------
// Quick path links for Commerce Hub
// ---------------------------------------------------------------------------

const quickPaths: {
  label: string
  href: string
  icon: typeof Search
  description: string
  comingSoon?: boolean
}[] = [
  {
    label: 'Browse Wines',
    href: '/wines',
    icon: Search,
    description: 'Explore our full selection',
  },
  {
    label: 'Explore Producers',
    href: '/producers',
    icon: Wine,
    description: 'Discover winemakers and stories',
  },
  {
    label: 'My Wishlist',
    href: '/wishlist',
    icon: Bookmark,
    description: 'Wines you want to try',
  },
  {
    label: 'Scan a Label',
    href: '#',
    icon: ScanLine,
    description: 'Coming soon',
    comingSoon: true,
  },
]

// ---------------------------------------------------------------------------
// MobileTabBar
// ---------------------------------------------------------------------------

export function MobileTabBar() {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)
  const { cart } = useCart()

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

        {/* Center: Commerce Hub button — opens sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            className="flex flex-col items-center justify-center gap-0.5 text-[10px] text-muted-foreground transition-colors min-w-[44px] min-h-[44px]"
            aria-label="Your Wine Hub"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] font-bold text-destructive-foreground">
                  {cart.itemCount > 9 ? '9+' : cart.itemCount}
                </span>
              )}
            </div>
          </SheetTrigger>

          <SheetContent side="bottom" className="rounded-t-xl">
            <SheetHeader>
              <SheetTitle>Your Wine Hub</SheetTitle>
            </SheetHeader>

            <div className="mt-4 space-y-6 pb-6">
              {/* ---- Cart Preview Section ---- */}
              <div>
                {cart.itemCount > 0 ? (
                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {cart.itemCount}{' '}
                          {cart.itemCount === 1 ? 'item' : 'items'} ·{' '}
                          {formatCartPrice(cart.subtotal)}
                        </p>
                        {cart.retailerName && (
                          <p className="text-xs text-muted-foreground">
                            from {cart.retailerName}
                          </p>
                        )}
                      </div>
                      <Link
                        href="/cart"
                        onClick={() => setSheetOpen(false)}
                        className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        aria-label="View cart"
                      >
                        View Cart
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-4 text-center">
                    <ShoppingBag
                      className="mx-auto h-8 w-8 text-muted-foreground/50"
                      aria-hidden="true"
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Your cart is empty — great wines are waiting.
                    </p>
                    <Link
                      href="/wines"
                      onClick={() => setSheetOpen(false)}
                      className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                    >
                      Browse Wines
                    </Link>
                  </div>
                )}
              </div>

              {/* ---- Quick Paths Section ---- */}
              <div className="space-y-1">
                {quickPaths.map((path) => {
                  const Icon = path.icon
                  return (
                    <Link
                      key={path.label}
                      href={path.href}
                      onClick={() => {
                        if (!path.comingSoon) setSheetOpen(false)
                      }}
                      className={cn(
                        'flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted',
                        path.comingSoon && 'pointer-events-none opacity-60'
                      )}
                      aria-disabled={path.comingSoon}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon
                          className="h-5 w-5 text-primary"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{path.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {path.description}
                        </p>
                      </div>
                      {path.comingSoon && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          Soon
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
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
