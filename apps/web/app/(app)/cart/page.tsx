import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { CartPageClient } from '@/components/features/orders/CartPageClient'
import { PLACEHOLDER_WINES } from '@/app/(app)/wines/_lib/placeholder-wines'

export const metadata = {
  title: 'Cart | Cru',
  description: 'Review your order before checkout.',
}

// TODO: Replace with real cart data from getActiveCart() server action
const MOCK_CART = {
  retailerName: 'Wine House Los Angeles',
  retailerDistance: 1.2,
  items: PLACEHOLDER_WINES.slice(0, 2).map((wine, i) => ({
    id: `line-${i + 1}`,
    wineId: wine.id,
    wineName: wine.name,
    producer: wine.producer.name,
    price: wine.price_min ?? 0,
    quantity: i === 0 ? 2 : 1,
    imageUrl: null as string | null,
  })),
}

export default function CartPage() {
  const cart = MOCK_CART
  const hasItems = cart.items.length > 0

  if (!hasItems) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mb-4" aria-hidden="true" />
        <h1 className="text-lg font-medium">Your cart is empty</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Find a wine you love and add it to your cart to get started.
        </p>
        <Link
          href="/wines"
          className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Browse wines
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Your Cart</h1>
      <CartPageClient cart={cart} />
    </div>
  )
}
