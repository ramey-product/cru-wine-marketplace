import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

interface CartSummaryProps {
  subtotal: number
  deliveryFee: number | null
  tax: number
  total: number
  itemCount: number
  fulfillmentType: 'pickup' | 'delivery'
}

export function CartSummary({
  subtotal,
  deliveryFee,
  tax,
  total,
  itemCount,
  fulfillmentType,
}: CartSummaryProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <h2 className="text-lg font-semibold">Order Summary</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="font-mono">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'}
          </span>
          <span className="font-mono">
            {deliveryFee != null && deliveryFee > 0
              ? `$${deliveryFee.toFixed(2)}`
              : 'Free'}
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

      <Link
        href="/checkout"
        className="block w-full rounded-lg bg-primary py-3 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Checkout
      </Link>
    </div>
  )
}
