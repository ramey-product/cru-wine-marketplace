import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Wines | Cru',
  description: 'Discover and browse our curated selection of wines from trusted producers.',
}

export default function WinesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
  )
}
