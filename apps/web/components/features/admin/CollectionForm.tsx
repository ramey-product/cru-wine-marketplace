'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export interface CollectionFormData {
  title: string
  slug: string
  description: string
  coverImageUrl: string
  displayOrder: number
  startDate: string
  endDate: string
  isActive: boolean
}

interface CollectionFormProps {
  initialData?: Partial<CollectionFormData>
  onSave?: (data: CollectionFormData) => void
}

export function CollectionForm({ initialData, onSave }: CollectionFormProps) {
  const [isPending, startTransition] = useTransition()
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const [formData, setFormData] = useState<CollectionFormData>({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    description: initialData?.description ?? '',
    coverImageUrl: initialData?.coverImageUrl ?? '',
    displayOrder: initialData?.displayOrder ?? 0,
    startDate: initialData?.startDate ?? '',
    endDate: initialData?.endDate ?? '',
    isActive: initialData?.isActive ?? true,
  })

  // Auto-generate slug from title unless manually edited
  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }))
    }
  }, [formData.title, slugManuallyEdited])

  function handleChange(
    field: keyof CollectionFormData,
    value: string | number | boolean
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true)
    setFormData((prev) => ({ ...prev, slug: slugify(value) }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(() => {
      // TODO: Call createCollection/updateCollection server action
      onSave?.(formData)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <label
          htmlFor="collection-title"
          className="text-sm font-medium text-foreground"
        >
          Title
        </label>
        <input
          id="collection-title"
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g., Summer Roses"
          aria-label="Collection title"
          className={cn(
            'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
          required
        />
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <label
          htmlFor="collection-slug"
          className="text-sm font-medium text-foreground"
        >
          Slug
        </label>
        <input
          id="collection-slug"
          type="text"
          value={formData.slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="auto-generated-from-title"
          aria-label="Collection URL slug"
          className={cn(
            'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm font-mono',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        />
        <p className="text-xs text-muted-foreground">
          Auto-generated from title. Edit to override.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label
          htmlFor="collection-description"
          className="text-sm font-medium text-foreground"
        >
          Description
        </label>
        <textarea
          id="collection-description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe this collection for customers..."
          aria-label="Collection description"
          rows={4}
          className={cn(
            'flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'resize-y'
          )}
        />
      </div>

      {/* Cover Image URL */}
      <div className="space-y-2">
        <label
          htmlFor="collection-cover-image"
          className="text-sm font-medium text-foreground"
        >
          Cover Image URL
        </label>
        <input
          id="collection-cover-image"
          type="url"
          value={formData.coverImageUrl}
          onChange={(e) => handleChange('coverImageUrl', e.target.value)}
          placeholder="https://..."
          aria-label="Cover image URL"
          className={cn(
            'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        />
      </div>

      <Separator />

      {/* Display Order and Active toggle row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label
            htmlFor="collection-display-order"
            className="text-sm font-medium text-foreground"
          >
            Display Order
          </label>
          <input
            id="collection-display-order"
            type="number"
            min={0}
            value={formData.displayOrder}
            onChange={(e) =>
              handleChange('displayOrder', parseInt(e.target.value, 10) || 0)
            }
            aria-label="Display order"
            className={cn(
              'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium text-foreground">Status</span>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              role="switch"
              aria-checked={formData.isActive}
              aria-label="Toggle collection active status"
              onClick={() => handleChange('isActive', !formData.isActive)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                formData.isActive ? 'bg-primary' : 'bg-muted'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
                  formData.isActive ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
            <span className="text-sm text-muted-foreground">
              {formData.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label
            htmlFor="collection-start-date"
            className="text-sm font-medium text-foreground"
          >
            Start Date
          </label>
          <input
            id="collection-start-date"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            aria-label="Collection start date"
            className={cn(
              'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="collection-end-date"
            className="text-sm font-medium text-foreground"
          >
            End Date
          </label>
          <input
            id="collection-end-date"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            aria-label="Collection end date"
            className={cn(
              'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          />
          <p className="text-xs text-muted-foreground">
            Leave empty for an evergreen collection.
          </p>
        </div>
      </div>

      <Separator />

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || !formData.title}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isPending ? 'Saving...' : 'Save Collection'}
        </Button>
      </div>
    </form>
  )
}
