import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

// TODO: Replace with getActiveCollections DAL call
const MOCK_COLLECTIONS = [
  {
    id: 'col-1',
    title: 'Summer Roses',
    slug: 'summer-roses',
    wineCount: 8,
    status: 'active' as const,
    displayOrder: 1,
    isActive: true,
    startDate: '2026-06-01',
    endDate: '2026-09-30',
  },
  {
    id: 'col-2',
    title: 'Natural Wines',
    slug: 'natural-wines',
    wineCount: 12,
    status: 'active' as const,
    displayOrder: 2,
    isActive: true,
    startDate: null,
    endDate: null,
  },
  {
    id: 'col-3',
    title: 'Holiday Gift Guide',
    slug: 'holiday-gift-guide',
    wineCount: 15,
    status: 'scheduled' as const,
    displayOrder: 3,
    isActive: true,
    startDate: '2026-11-15',
    endDate: '2026-12-31',
  },
  {
    id: 'col-4',
    title: 'Staff Picks',
    slug: 'staff-picks',
    wineCount: 6,
    status: 'inactive' as const,
    displayOrder: 4,
    isActive: false,
    startDate: null,
    endDate: null,
  },
]

function statusBadgeVariant(
  status: 'active' | 'inactive' | 'scheduled'
): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case 'active':
      return 'default'
    case 'scheduled':
      return 'secondary'
    case 'inactive':
      return 'outline'
  }
}

export default function CollectionsAdminPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Collections</h2>
          <p className="text-sm text-muted-foreground">
            Curate and manage wine collections for the storefront.
          </p>
        </div>
        <Link href="/admin/collections/new">
          <Button aria-label="Create a new collection">
            <Plus className="h-4 w-4" />
            New Collection
          </Button>
        </Link>
      </div>

      {/* Collections table */}
      <div className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Title
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Wines
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Display Order
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_COLLECTIONS.map((collection) => (
              <tr
                key={collection.id}
                className="transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {collection.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      /{collection.slug}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {collection.wineCount}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusBadgeVariant(collection.status)}>
                    {collection.status.charAt(0).toUpperCase() +
                      collection.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {collection.displayOrder}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/collections/${collection.id}`}
                    className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    aria-label={`Edit ${collection.title}`}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
