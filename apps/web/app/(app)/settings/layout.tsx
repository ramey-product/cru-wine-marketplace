import { SettingsNav } from '@/components/features/settings/SettingsNav'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      <div className="flex flex-col sm:flex-row gap-8">
        {/* Sidebar nav — client component for active-state detection */}
        <SettingsNav />

        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
