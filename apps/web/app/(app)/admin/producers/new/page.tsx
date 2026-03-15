/**
 * /admin/producers/new — Create new producer.
 *
 * Server Component. Renders ProducerForm in create mode (no initialData).
 *
 * TODO: After a successful save the ProducerForm should redirect to
 *       /admin/producers/[id] using the returned producer ID.
 */

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProducerForm } from '@/components/features/admin/ProducerForm'

export const metadata = {
  title: 'New Producer | Admin',
}

export default function NewProducerPage() {
  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <nav aria-label="Breadcrumb">
        <Link
          href="/admin/producers"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to producers list"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Producers
        </Link>
      </nav>

      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">New Producer</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add a new producer to the Cru catalog.
        </p>
      </div>

      {/* Form — no initialData = create mode */}
      <ProducerForm />
    </div>
  )
}
