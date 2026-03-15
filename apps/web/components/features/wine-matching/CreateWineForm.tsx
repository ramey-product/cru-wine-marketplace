'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Loader2, PlusCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateWineFormProps {
  prefill: {
    name: string
    producer: string
    vintage: string
    varietal: string
  }
  onSubmit: (wine: {
    name: string
    producer: string
    vintage: string
    varietal: string
    region: string
    country: string
    description: string
  }) => void
  onCancel: () => void
}

export function CreateWineForm({
  prefill,
  onSubmit,
  onCancel,
}: CreateWineFormProps) {
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    name: prefill.name,
    producer: prefill.producer,
    vintage: prefill.vintage,
    varietal: prefill.varietal,
    region: '',
    country: '',
    description: '',
  })

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(() => {
      // TODO: Call createWineFromQueueAction server action
      onSubmit(formData)
    })
  }

  const inputClasses = cn(
    'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">
          Create New Wine Record
        </h4>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onCancel}
          aria-label="Cancel creating new wine"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Pre-populated from the raw CSV data. Review and complete the missing
        fields before saving.
      </p>

      <Separator />

      {/* Pre-populated fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="create-wine-name"
            className="text-xs font-medium text-muted-foreground"
          >
            Wine Name
          </label>
          <input
            id="create-wine-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            aria-label="Wine name"
            className={inputClasses}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="create-wine-producer"
            className="text-xs font-medium text-muted-foreground"
          >
            Producer
          </label>
          <input
            id="create-wine-producer"
            type="text"
            value={formData.producer}
            onChange={(e) => handleChange('producer', e.target.value)}
            aria-label="Producer name"
            className={inputClasses}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="create-wine-vintage"
            className="text-xs font-medium text-muted-foreground"
          >
            Vintage
          </label>
          <input
            id="create-wine-vintage"
            type="text"
            value={formData.vintage}
            onChange={(e) => handleChange('vintage', e.target.value)}
            aria-label="Vintage year"
            className={inputClasses}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="create-wine-varietal"
            className="text-xs font-medium text-muted-foreground"
          >
            Varietal
          </label>
          <input
            id="create-wine-varietal"
            type="text"
            value={formData.varietal}
            onChange={(e) => handleChange('varietal', e.target.value)}
            aria-label="Grape varietal"
            className={inputClasses}
          />
        </div>
      </div>

      <Separator />

      {/* Additional fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="create-wine-region"
            className="text-xs font-medium text-muted-foreground"
          >
            Region
          </label>
          <input
            id="create-wine-region"
            type="text"
            value={formData.region}
            onChange={(e) => handleChange('region', e.target.value)}
            placeholder="e.g., Barolo, Piedmont"
            aria-label="Wine region"
            className={inputClasses}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="create-wine-country"
            className="text-xs font-medium text-muted-foreground"
          >
            Country
          </label>
          <input
            id="create-wine-country"
            type="text"
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
            placeholder="e.g., Italy"
            aria-label="Country of origin"
            className={inputClasses}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="create-wine-description"
          className="text-xs font-medium text-muted-foreground"
        >
          Description
        </label>
        <textarea
          id="create-wine-description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Optional tasting notes or description..."
          aria-label="Wine description"
          rows={3}
          className={cn(
            'flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'resize-y'
          )}
        />
      </div>

      <div className="flex items-center gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          aria-label="Cancel"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || !formData.name || !formData.producer}
          aria-label="Create wine and resolve match"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="h-4 w-4" />
          )}
          {isPending ? 'Creating...' : 'Create & Match'}
        </Button>
      </div>
    </form>
  )
}
