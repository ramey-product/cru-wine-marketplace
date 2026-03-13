import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cru Wine Marketplace',
  description: 'Multi-tenant B2B wine marketplace connecting retailers and consumers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  )
}
