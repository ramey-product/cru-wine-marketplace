import { TopNav } from '@/components/layout/TopNav'
import { MobileTabBar } from '@/components/layout/MobileTabBar'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <TopNav />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-20 lg:pb-6">
        {children}
      </main>

      <MobileTabBar />
    </div>
  )
}
