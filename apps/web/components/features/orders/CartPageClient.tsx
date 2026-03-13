'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { CartItem } from './CartItem'
import { CartSummary } from './CartSummary'

const DELIVERY_FEE = 9.99
const TAX_RATE = 0.095

interface CartItemData {
  id: string
  wineId: string
  wineName: string
  producer: string
  price: number
  quantity: number
  imageUrl: string | null
}

interface CartPageClientProps {
  cart: {
    retailerName: string
    retailerDistance: number
    items: CartItemData[]
  }
}

export function CartPageClient({ cart }: CartPageClientProps) {
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup')
  const [items, setItems] = useState(cart.items)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = fulfillment === 'delivery' ? DELIVERY_FEE : 0
  const tax = (subtotal + deliveryFee) * TAX_RATE
  const total = subtotal + deliveryFee + tax
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleUpdateQuantity = async (lineItemId: string, quantity: number) => {
    // TODO: Call updateCartItemQuantity server action
    setItems((prev) =>
      prev.map((item) => (item.id === lineItemId ? { ...item, quantity } : item))
    )
  }

  const handleRemove = async (lineItemId: string) => {
    // TODO: Call removeFromCart server action
    setItems((prev) => prev.filter((item) => item.id !== lineItemId))
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
      {/* Left: Cart items */}
      <div>
        {/* Retailer info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>
            From <span className="font-medium text-foreground">{cart.retailerName}</span>
            {' '}({cart.retailerDistance} mi)
          </span>
        </div>

        {/* Items */}
        <div className="divide-y divide-border">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
            />
          ))}
        </div>

        {/* Fulfillment selection */}
        <div className="mt-6">
          <h2 className="text-sm font-medium mb-3">Fulfillment</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFulfillment('pickup')}
              className={`rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                fulfillment === 'pickup'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-foreground/20'
              }`}
            >
              <p className="text-sm font-medium">Pickup</p>
              <p className="text-xs text-muted-foreground mt-0.5">Ready in ~1 hour</p>
            </button>
            <button
              onClick={() => setFulfillment('delivery')}
              className={`rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                fulfillment === 'delivery'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-foreground/20'
              }`}
            >
              <p className="text-sm font-medium">Delivery</p>
              <p className="text-xs text-muted-foreground mt-0.5">$9.99, 2-4 hours</p>
            </button>
          </div>
        </div>
      </div>

      {/* Right: Order summary */}
      <div className="mt-8 lg:mt-0">
        <CartSummary
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          tax={tax}
          total={total}
          itemCount={itemCount}
          fulfillmentType={fulfillment}
        />
      </div>

      {/* Mobile: Sticky bottom checkout bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <p className="text-lg font-semibold font-mono">${total.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{itemCount} items</p>
          </div>
          <a
            href="/checkout"
            className="rounded-lg bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Checkout
          </a>
        </div>
      </div>
    </div>
  )
}
