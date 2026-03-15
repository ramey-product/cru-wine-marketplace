import { TopNav } from '@/components/layout/TopNav'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { LocationProvider } from '@/lib/geo/LocationContext'
import { getServerLocation } from '@/lib/geo/server'
import { LocationPicker } from '@/components/features/location/LocationPicker'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initialLocation = await getServerLocation()

  return (
    <div className="min-h-screen">
      <LocationProvider initialLocation={initialLocation}>
        <TopNav />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-20 lg:pb-6">
          {children}
        </main>

        <MobileTabBar />
        <LocationPicker />
      </LocationProvider>
    </div>
  )
}
