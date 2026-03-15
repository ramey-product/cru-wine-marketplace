import { TopNav } from '@/components/layout/TopNav'
import { MobileNavIsland } from '@/components/layout/MobileNavIsland'
import { LocationProvider } from '@/lib/geo/LocationContext'
import { getServerLocation } from '@/lib/geo/server'
import { LocationPicker } from '@/components/features/location/LocationPicker'
import { CartProvider } from '@/lib/cart/CartContext'
import { RetailerConflictDialog } from '@/components/features/cart/RetailerConflictDialog'
import { OrderTrackingProvider } from '@/lib/order-tracking/OrderTrackingContext'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initialLocation = await getServerLocation()

  return (
    <div className="min-h-screen">
      <LocationProvider initialLocation={initialLocation}>
        <CartProvider>
          <OrderTrackingProvider>
            <TopNav />

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-[calc(var(--nav-island-height)*2+var(--nav-island-bottom)+1.5rem)] lg:pb-6">
              {children}
            </main>

            <MobileNavIsland />
            <LocationPicker />
            <RetailerConflictDialog />
          </OrderTrackingProvider>
        </CartProvider>
      </LocationProvider>
    </div>
  )
}
