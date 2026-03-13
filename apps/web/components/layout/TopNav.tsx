'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Browse', href: '/wines' },
  { label: 'Collections', href: '/collections' },
  { label: 'Community', href: '/community' },
] as const

export function TopNav() {
  const pathname = usePathname()

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/80 backdrop-blur-md">
      <nav aria-label="Main navigation" className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Wordmark */}
        <Link
          href="/"
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

        {/* Right: Search + Avatar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Open search"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">&#8984;</span>K
            </kbd>
          </button>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            aria-label="User menu"
          >
            <User className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </nav>
    </header>
  )
}
