import { CheckoutClient } from '@/components/features/orders/CheckoutClient'
import { PLACEHOLDER_WINES } from '@/app/(app)/wines/_lib/placeholder-wines'

export const metadata = {
  title: 'Checkout | Cru',
  description: 'Complete your wine order.',
}

// TODO: Replace with real cart data from getActiveCart() server action
const MOCK_CHECKOUT = {
  retailerName: 'Wine House Los Angeles',
  retailerAddress: '1234 Vine Street, Los Angeles, CA 90028',
  items: PLACEHOLDER_WINES.slice(0, 2).map((wine, i) => ({
    id: `line-${i + 1}`,
    wineName: wine.name,
    producer: wine.producer.name,
    price: wine.price_min ?? 0,
    quantity: i === 0 ? 2 : 1,
  })),
}

export default function CheckoutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <CheckoutClient checkout={MOCK_CHECKOUT} />
    </div>
  )
}
