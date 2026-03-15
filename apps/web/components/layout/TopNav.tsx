'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  ShoppingCart,
  Settings,
  Shield,
  Store,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navLinks = [
  { label: 'Browse', href: '/wines' },
  { label: 'Collections', href: '/collections' },
] as const

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/80 backdrop-blur-md">
      <nav aria-label="Main navigation" className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Wordmark */}
        <Link
          href="/home"
          className="font-display text-xl font-bold text-primary"
          aria-label="Cru - Home"
        >
          Cru
        </Link>

        {/* Center: Nav links (hidden on mobile) */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors relative',
                isActive(link.href)
                  ? 'text-foreground after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Search + Cart + User Avatar Dropdown */}
        <div className="flex items-center gap-3">
          {/* Search trigger — Cmd+K */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Open search (⌘K)"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">&#8984;</span>K
            </kbd>
          </button>

          {/* Cart icon */}
          <Link
            href="/cart"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground relative"
            aria-label="Shopping cart"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            {/* TODO: Show badge with item count when cart is non-empty */}
          </Link>

          {/* User avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="User menu"
            >
              <User className="h-4 w-4" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* TODO: Replace with real user name from auth context */}
              <div className="px-1.5 py-1">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Wine Lover</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    user@example.com
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/wishlist')}>
                <Heart className="h-4 w-4" aria-hidden="true" />
                Wishlist
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/orders')}>
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                Orders
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="h-4 w-4" aria-hidden="true" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Admin & Retailer links — TODO: show conditionally based on user role */}
              <DropdownMenuItem onClick={() => router.push('/admin/producers')}>
                <Shield className="h-4 w-4" aria-hidden="true" />
                Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/retailer')}>
                <Store className="h-4 w-4" aria-hidden="true" />
                Retailer Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  // TODO: Wire to Supabase auth signOut
                  console.log('Sign out clicked')
                }}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  )
}
