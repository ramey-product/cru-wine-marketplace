'use client'

import { useEffect, useRef, useState } from 'react'
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
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart/CartContext'
import { formatCartPrice } from '@/lib/cart/cart-store'
import { useOrderTracking } from '@/lib/order-tracking/OrderTrackingContext'
import { STATUS_LABELS } from '@/lib/order-tracking/types'
import { ActiveOrderMiniCard } from '@/components/features/orders/ActiveOrderMiniCard'
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

/** Pages where the cart wing should be hidden. */
const CART_HIDDEN_PATHS = ['/cart', '/checkout']

/** Pages where the order tracking wing should be hidden. */
const ORDER_HIDDEN_PATHS = ['/cart', '/checkout', '/orders']

// ---------------------------------------------------------------------------
// Wing mode type
// ---------------------------------------------------------------------------

type WingMode = 'cart' | 'order' | 'none'

// ---------------------------------------------------------------------------
// CartWing — cart summary row above the tab bar
// ---------------------------------------------------------------------------

function CartWing() {
  const { cart } = useCart()
  const prevCountRef = useRef(cart.itemCount)
  const [pulse, setPulse] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (cart.itemCount !== prevCountRef.current && cart.itemCount > 0) {
      setPulse(true)
      const timer = setTimeout(() => setPulse(false), 200)
      prevCountRef.current = cart.itemCount
      return () => clearTimeout(timer)
    }
    prevCountRef.current = cart.itemCount
  }, [cart.itemCount])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Cart: ${cart.itemCount} ${cart.itemCount === 1 ? 'item' : 'items'}, ${formatCartPrice(cart.subtotal)}`}
      className="flex h-14 items-center justify-between px-4 bg-primary/95 text-primary-foreground"
    >
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-4 w-4" aria-hidden="true" />

        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={cart.itemCount}
            initial={shouldReduceMotion ? false : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { scale: 0.8, opacity: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 400, damping: 20 }
            }
            className={cn(
              'text-sm font-semibold tabular-nums',
              'motion-reduce:transform-none',
              pulse && 'animate-[pulse-scale_200ms_ease-out]'
            )}
          >
            {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
          </motion.span>
        </AnimatePresence>

        <span className="text-primary-foreground/60" aria-hidden="true">
          ·
        </span>

        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={cart.subtotal}
            initial={shouldReduceMotion ? false : { y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { y: 8, opacity: 0 }}
            transition={
              shouldReduceMotion ? { duration: 0 } : { duration: 0.15 }
            }
            className="text-sm font-semibold tabular-nums"
          >
            {formatCartPrice(cart.subtotal)}
          </motion.span>
        </AnimatePresence>
      </div>

      <Link
        href="/cart"
        className="flex min-h-[36px] items-center rounded-full bg-primary-foreground/20 px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/30"
        aria-label="View cart"
      >
        View Cart
      </Link>
    </div>
  )
}

// ---------------------------------------------------------------------------
// OrderWing — active order tracking row above the tab bar
// ---------------------------------------------------------------------------

function OrderWing() {
  const { mostRecentOrder, activeOrders } = useOrderTracking()
  const shouldReduceMotion = useReducedMotion()

  if (!mostRecentOrder) return null

  const statusLabel = STATUS_LABELS[mostRecentOrder.status]
  const trackHref =
    activeOrders.length === 1
      ? `/orders/${mostRecentOrder.orderId}`
      : '/orders'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Order: ${statusLabel} — from ${mostRecentOrder.retailerName}`}
      className="flex h-14 items-center justify-between px-4 bg-emerald-700/90 dark:bg-emerald-800/90 text-white"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Pulsing status dot */}
        <motion.span
          className="h-2 w-2 flex-shrink-0 rounded-full bg-white"
          animate={shouldReduceMotion ? {} : { opacity: [1, 0.4, 1] }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }
          aria-hidden="true"
        />

        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {statusLabel}
          </p>
          <p className="text-xs text-white/70 truncate">
            {mostRecentOrder.retailerName}
            {activeOrders.length > 1 && (
              <span> +{activeOrders.length - 1} more</span>
            )}
          </p>
        </div>
      </div>

      <Link
        href={trackHref}
        className="flex min-h-[36px] items-center rounded-full bg-white/20 px-4 text-sm font-medium text-white transition-colors hover:bg-white/30"
        aria-label="Track order"
      >
        Track
      </Link>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TabRow — the 5-button navigation row
// ---------------------------------------------------------------------------

function TabRow() {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)
  const { cart } = useCart()
  const { activeOrders } = useOrderTracking()

  function isActive(href: string): boolean {
    if (href === '/home') return pathname === '/home' || pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex h-[var(--nav-island-height)] items-center justify-around bg-background/75 backdrop-blur-md">
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

            {/* ---- Active Orders Section ---- */}
            {activeOrders.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Active Orders</p>
                  {activeOrders.length > 3 && (
                    <Link
                      href="/orders"
                      onClick={() => setSheetOpen(false)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View all
                    </Link>
                  )}
                </div>
                <div className="space-y-2">
                  {activeOrders.slice(0, 3).map((order) => (
                    <ActiveOrderMiniCard
                      key={order.orderId}
                      order={order}
                      onClick={() => setSheetOpen(false)}
                    />
                  ))}
                </div>
                {activeOrders.length <= 3 && (
                  <Link
                    href="/orders"
                    onClick={() => setSheetOpen(false)}
                    className="mt-2 block text-center text-xs font-medium text-primary hover:underline"
                  >
                    View All Orders
                  </Link>
                )}
              </div>
            )}

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
  )
}

// ---------------------------------------------------------------------------
// MobileNavIsland — unified floating island
// ---------------------------------------------------------------------------

export function MobileNavIsland() {
  const { cart } = useCart()
  const { hasActiveOrders } = useOrderTracking()
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  // Wing priority: cart > order tracking > none
  const isCartHidden = CART_HIDDEN_PATHS.some((p) => pathname.startsWith(p))
  const isOrderHidden = ORDER_HIDDEN_PATHS.some((p) => pathname.startsWith(p))

  let wingMode: WingMode = 'none'
  if (cart.itemCount > 0 && !isCartHidden) {
    wingMode = 'cart'
  } else if (hasActiveOrders && !isOrderHidden) {
    wingMode = 'order'
  }

  const showWing = wingMode !== 'none'

  return (
    <div
      className={cn(
        'fixed z-50 lg:hidden',
        'left-[var(--nav-island-inset)] right-[var(--nav-island-inset)]',
        'bottom-[var(--nav-island-bottom)]',
        'rounded-[var(--nav-island-radius)]',
        'border border-border/50',
        'shadow-lg shadow-black/5',
        'overflow-hidden',
        'will-change-transform'
      )}
    >
      {/* Wing — expands above the tab row (cart or order tracking) */}
      <AnimatePresence initial={false} mode="wait">
        {wingMode === 'cart' && (
          <motion.div
            key="cart-wing"
            initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 56, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    height: { type: 'spring', stiffness: 350, damping: 30 },
                    opacity: { duration: 0.15 },
                  }
            }
          >
            <CartWing />
          </motion.div>
        )}
        {wingMode === 'order' && (
          <motion.div
            key="order-wing"
            initial={
              shouldReduceMotion ? false : { height: 0, opacity: 0 }
            }
            animate={{ height: 56, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    height: { type: 'spring', stiffness: 350, damping: 30 },
                    opacity: { duration: 0.15 },
                  }
            }
          >
            <OrderWing />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider — only when wing is visible */}
      {showWing && (
        <div className="h-px bg-border/30" aria-hidden="true" />
      )}

      {/* Tab row — always visible */}
      <nav aria-label="Mobile navigation">
        <TabRow />
      </nav>
    </div>
  )
}
