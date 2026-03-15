/**
 * /admin/producers — Producer list page.
 *
 * Server Component. Renders the ProducerTable with mock data.
 *
 * TODO: Replace MOCK_PRODUCERS with a getProducers DAL call once
 *       the server-side Supabase client is wired into this route.
 */

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProducerTable } from '@/components/features/admin/ProducerTable'

// TODO: Replace with getProducers DAL call
// import { createSupabaseServerClient } from '@/lib/supabase/server'
// import { getProducers } from '@/lib/dal/producers'

export const metadata = {
  title: 'Producers | Admin',
}

export default function ProducersPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Producers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage wine producers and their portfolios.
          </p>
        </div>
        <Link href="/admin/producers/new" aria-label="Create new producer">
          <Button>
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            New Producer
          </Button>
        </Link>
      </div>

      {/*
       * ProducerTable is a Client Component that owns sorting + filtering state.
       * Pass real data here once the DAL is wired in:
       *
       *   const supabase = await createSupabaseServerClient()
       *   const { data: producers } = await getProducers(supabase, { limit: 100 })
       *   <ProducerTable producers={producers ?? []} />
       */}
      <ProducerTable />
    </div>
  )
}
