'use client'

import { useState, useTransition } from 'react'
import { MapPin, CreditCard, AlertTriangle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

const DELIVERY_FEE = 9.99
const TAX_RATE = 0.095

interface CheckoutItem {
  id: string
  wineName: string
  producer: string
  price: number
  quantity: number
}

interface CheckoutClientProps {
  checkout: {
    retailerName: string
    retailerAddress: string
    items: CheckoutItem[]
  }
}

export function CheckoutClient({ checkout }: CheckoutClientProps) {
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup')
  const [ageVerified, setAgeVerified] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState({
    line1: '',
    city: '',
    state: 'CA',
    zip: '',
  })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const subtotal = checkout.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const deliveryFee = fulfillment === 'delivery' ? DELIVERY_FEE : 0
  const tax = (subtotal + deliveryFee) * TAX_RATE
  const total = subtotal + deliveryFee + tax

  const canSubmit =
    ageVerified &&
    !isPending &&
    (fulfillment === 'pickup' ||
      (deliveryAddress.line1 && deliveryAddress.city && deliveryAddress.zip))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)

    startTransition(async () => {
      // TODO: Call initiateCheckout server action
      // On success, redirect to Stripe: window.location.href = sessionUrl
      // For now, simulate redirect to confirmation
      await new Promise((r) => setTimeout(r, 1000))
      window.location.href = '/orders/mock-order-1/confirmation'
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
        {/* Left: Checkout form */}
        <div className="space-y-8">
          {/* Retailer info */}
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium">{checkout.retailerName}</p>
                <p className="text-muted-foreground">{checkout.retailerAddress}</p>
              </div>
            </div>
          </div>

          {/* Fulfillment */}
          <div>
            <h2 className="text-base font-medium mb-3">Fulfillment</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFulfillment('pickup')}
                className={`rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  fulfillment === 'pickup'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-foreground/20'
                }`}
              >
                <p className="text-sm font-medium">Pickup</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ready in ~1 hour &middot; Free
                </p>
              </button>
              <button
                type="button"
                onClick={() => setFulfillment('delivery')}
                className={`rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  fulfillment === 'delivery'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-foreground/20'
                }`}
              >
                <p className="text-sm font-medium">Delivery</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  $9.99 &middot; 2-4 hours
                </p>
              </button>
            </div>
          </div>

          {/* Delivery address (conditional) */}
          {fulfillment === 'delivery' && (
            <div className="space-y-3">
              <h2 className="text-base font-medium">Delivery Address</h2>
              <div className="space-y-3">
                <div>
                  <label htmlFor="address-line1" className="block text-sm font-medium mb-1">
                    Street address
                  </label>
                  <input
                    id="address-line1"
                    type="text"
                    value={deliveryAddress.line1}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, line1: e.target.value })}
                    required
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    autoComplete="street-address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="address-city" className="block text-sm font-medium mb-1">
                      City
                    </label>
                    <input
                      id="address-city"
                      type="text"
                      value={deliveryAddress.city}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                      required
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      autoComplete="address-level2"
                    />
                  </div>
                  <div>
                    <label htmlFor="address-zip" className="block text-sm font-medium mb-1">
                      ZIP code
                    </label>
                    <input
                      id="address-zip"
                      type="text"
                      value={deliveryAddress.zip}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 5)
                        setDeliveryAddress({ ...deliveryAddress, zip: val })
                      }}
                      required
                      inputMode="numeric"
                      maxLength={5}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      autoComplete="postal-code"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Age verification */}
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="age-verify"
                checked={ageVerified}
                onCheckedChange={(val) => setAgeVerified(val === true)}
                aria-describedby="age-verify-desc"
              />
              <div>
                <label htmlFor="age-verify" className="text-sm font-medium cursor-pointer">
                  I confirm I am 21 years of age or older
                </label>
                <p id="age-verify-desc" className="text-xs text-muted-foreground mt-0.5">
                  You must be at least 21 to purchase alcohol. Valid ID required at pickup/delivery.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 flex items-start gap-3" role="alert">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        {/* Right: Order summary */}
        <div className="mt-8 lg:mt-0">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4 lg:sticky lg:top-20">
            <h2 className="text-lg font-semibold">Order Summary</h2>

            {/* Items */}
            <div className="space-y-2">
              {checkout.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.wineName}
                  </span>
                  <span className="font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}
                </span>
                <span className="font-mono">
                  {deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : 'Free'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (est.)</span>
                <span className="font-mono">${tax.toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="font-mono">${total.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center justify-center gap-2"
            >
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              {isPending ? 'Processing...' : `Pay $${total.toFixed(2)}`}
            </button>

            <p className="text-xs text-center text-muted-foreground">
              You&apos;ll be redirected to Stripe to complete payment
            </p>
          </div>
        </div>
      </div>
    </form>
  )
}
