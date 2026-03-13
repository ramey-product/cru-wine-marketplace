'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

interface CartIndicatorProps {
  itemCount: number
}

export function CartIndicator({ itemCount }: CartIndicatorProps) {
  if (itemCount === 0) return null

  return (
    <Link
      href="/cart"
      aria-label={`Cart with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
      className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
        {itemCount > 99 ? '99+' : itemCount}
      </span>
    </Link>
  )
}
