'use client'

/**
 * WineForm — Admin client component.
 *
 * Create or edit a wine that belongs to a producer. Used on
 * /admin/producers/[id]/wines (inline Sheet) and standalone.
 *
 * Price is entered as a dollar amount (e.g. 42.00) and converted to
 * cents for storage.
 *
 * TODO: Call createWine / updateWine server actions on submit.
 */

import { useState, useTransition } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WineFormValues {
  name: string
  slug: string
  vintage: string
  varietal: string
  region: string
  country: string
  appellation: string
  description: string
  alcohol_percentage: string
  /** Dollar amount as a string, e.g. "42.00" */
  price_display: string
  bottle_size: '375ml' | '750ml' | '1500ml'
  tags: string
  occasions: string
  image_url: string
  is_active: boolean
}

const BOTTLE_SIZE_OPTIONS = [
  { value: '375ml', label: '375ml (Half bottle)' },
  { value: '750ml', label: '750ml (Standard)' },
  { value: '1500ml', label: '1500ml (Magnum)' },
] as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const EMPTY_FORM: WineFormValues = {
  name: '',
  slug: '',
  vintage: '',
  varietal: '',
  region: '',
  country: '',
  appellation: '',
  description: '',
  alcohol_percentage: '',
  price_display: '',
  bottle_size: '750ml',
  tags: '',
  occasions: '',
  image_url: '',
  is_active: true,
}

// ---------------------------------------------------------------------------
// Shared field primitives
// ---------------------------------------------------------------------------

interface FieldProps {
  label: string
  htmlFor: string
  required?: boolean
  hint?: string
  children: React.ReactNode
  className?: string
}

function Field({ label, htmlFor, required, hint, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    />
  )
}

function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string }) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'min-h-[6rem] resize-y',
        className
      )}
    />
  )
}

function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { id: string }) {
  return (
    <select
      {...props}
      className={cn(
        'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    />
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface WineFormProps {
  /** Pre-populated values for edit mode. */
  initialData?: Partial<WineFormValues>
  /** Wine ID — required for update; omit for create. */
  wineId?: string
  /** Producer ID — always required for association. */
  producerId: string
  /** Called after a successful save (e.g. to close a Sheet). */
  onSuccess?: () => void
}

export function WineForm({ initialData, wineId, producerId, onSuccess }: WineFormProps) {
  const isEditMode = Boolean(wineId)

  const [values, setValues] = useState<WineFormValues>({
    ...EMPTY_FORM,
    ...initialData,
  })
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditMode)
  const [isPending, startTransition] = useTransition()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  function handleField<K extends keyof WineFormValues>(key: K, value: WineFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setValues((prev) => ({
      ...prev,
      name,
      slug: slugManuallyEdited ? prev.slug : slugify(name),
    }))
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugManuallyEdited(true)
    handleField('slug', e.target.value)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)
    setSaveSuccess(false)

    startTransition(async () => {
      try {
        // Convert dollar string to cents for storage
        // const priceCents = Math.round(parseFloat(values.price_display || '0') * 100)

        // TODO: Call createWine / updateWine server action
        // const payload = {
        //   producer_id: producerId,
        //   name: values.name,
        //   slug: values.slug,
        //   vintage: values.vintage ? parseInt(values.vintage, 10) : null,
        //   varietal: values.varietal || null,
        //   region: values.region || null,
        //   country: values.country || null,
        //   appellation: values.appellation || null,
        //   description: values.description || null,
        //   image_url: values.image_url || null,
        //   price_min: priceCents,
        //   is_active: values.is_active,
        // }
        // const result = isEditMode
        //   ? await updateWine(wineId!, payload)
        //   : await createWine(payload)
        // if (result.error) { setSaveError(result.error); return }
        setSaveSuccess(true)
        onSuccess?.()
      } catch {
        setSaveError('An unexpected error occurred. Please try again.')
      }
    })
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label={isEditMode ? 'Edit wine' : 'Create wine'}
    >
      <div className="space-y-8">

        {/* ── Section: Identity ── */}
        <section aria-labelledby="wine-section-identity">
          <h3 id="wine-section-identity" className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Identity
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Name" htmlFor="wine-name" required className="sm:col-span-2">
              <Input
                id="wine-name"
                name="name"
                value={values.name}
                onChange={handleNameChange}
                placeholder="e.g. Monte Bello"
                required
                autoComplete="off"
              />
            </Field>

            <Field label="Slug" htmlFor="wine-slug" hint="Auto-generated from name.">
              <Input
                id="wine-slug"
                name="slug"
                value={values.slug}
                onChange={handleSlugChange}
                placeholder="e.g. monte-bello"
                pattern="[a-z0-9-]+"
              />
            </Field>

            <Field label="Vintage" htmlFor="wine-vintage">
              <Input
                id="wine-vintage"
                name="vintage"
                type="number"
                value={values.vintage}
                onChange={(e) => handleField('vintage', e.target.value)}
                placeholder="2019"
                min={1900}
                max={new Date().getFullYear()}
              />
            </Field>
          </div>
        </section>

        <Separator />

        {/* ── Section: Terroir ── */}
        <section aria-labelledby="wine-section-terroir">
          <h3 id="wine-section-terroir" className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Terroir
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Varietal" htmlFor="wine-varietal">
              <Input
                id="wine-varietal"
                name="varietal"
                value={values.varietal}
                onChange={(e) => handleField('varietal', e.target.value)}
                placeholder="e.g. Cabernet Sauvignon"
              />
            </Field>

            <Field label="Region" htmlFor="wine-region">
              <Input
                id="wine-region"
                name="region"
                value={values.region}
                onChange={(e) => handleField('region', e.target.value)}
                placeholder="e.g. Santa Cruz Mountains"
              />
            </Field>

            <Field label="Country" htmlFor="wine-country">
              <Input
                id="wine-country"
                name="country"
                value={values.country}
                onChange={(e) => handleField('country', e.target.value)}
                placeholder="e.g. United States"
              />
            </Field>

            <Field label="Appellation" htmlFor="wine-appellation">
              <Input
                id="wine-appellation"
                name="appellation"
                value={values.appellation}
                onChange={(e) => handleField('appellation', e.target.value)}
                placeholder="e.g. Monte Bello AVA"
              />
            </Field>
          </div>
        </section>

        <Separator />

        {/* ── Section: Details ── */}
        <section aria-labelledby="wine-section-details">
          <h3 id="wine-section-details" className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Details
          </h3>
          <div className="space-y-5">
            <Field label="Description" htmlFor="wine-description">
              <Textarea
                id="wine-description"
                name="description"
                value={values.description}
                onChange={(e) => handleField('description', e.target.value)}
                placeholder="Describe the wine's character, style, and story."
                rows={4}
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field
                label="Alcohol %"
                htmlFor="wine-alcohol"
                hint="e.g. 13.5"
              >
                <Input
                  id="wine-alcohol"
                  name="alcohol_percentage"
                  type="number"
                  step="0.1"
                  min={0}
                  max={25}
                  value={values.alcohol_percentage}
                  onChange={(e) => handleField('alcohol_percentage', e.target.value)}
                  placeholder="13.5"
                />
              </Field>

              <Field
                label="Price"
                htmlFor="wine-price"
                hint="Enter as USD dollars (e.g. 42.00)"
              >
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                    aria-hidden="true"
                  >
                    $
                  </span>
                  <Input
                    id="wine-price"
                    name="price_display"
                    type="number"
                    step="0.01"
                    min={0}
                    value={values.price_display}
                    onChange={(e) => handleField('price_display', e.target.value)}
                    placeholder="0.00"
                    className="pl-6"
                    aria-label="Price in US dollars"
                  />
                </div>
              </Field>

              <Field label="Bottle Size" htmlFor="wine-bottle-size">
                <Select
                  id="wine-bottle-size"
                  name="bottle_size"
                  value={values.bottle_size}
                  onChange={(e) =>
                    handleField('bottle_size', e.target.value as WineFormValues['bottle_size'])
                  }
                  aria-label="Select bottle size"
                >
                  {BOTTLE_SIZE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>
        </section>

        <Separator />

        {/* ── Section: Tags & Context ── */}
        <section aria-labelledby="wine-section-tags">
          <h3 id="wine-section-tags" className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Tags &amp; Context
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="Tags"
              htmlFor="wine-tags"
              hint="Comma-separated. e.g. bold, earthy, structured"
            >
              <Input
                id="wine-tags"
                name="tags"
                value={values.tags}
                onChange={(e) => handleField('tags', e.target.value)}
                placeholder="bold, earthy, structured"
              />
            </Field>

            <Field
              label="Occasions"
              htmlFor="wine-occasions"
              hint="Comma-separated. e.g. dinner party, celebration"
            >
              <Input
                id="wine-occasions"
                name="occasions"
                value={values.occasions}
                onChange={(e) => handleField('occasions', e.target.value)}
                placeholder="dinner party, celebration"
              />
            </Field>
          </div>
        </section>

        <Separator />

        {/* ── Section: Media ── */}
        <section aria-labelledby="wine-section-media">
          <h3 id="wine-section-media" className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Media
          </h3>
          <Field
            label="Image URL"
            htmlFor="wine-image-url"
            hint="Paste a full URL to the wine image. File upload coming in V2."
          >
            <Input
              id="wine-image-url"
              name="image_url"
              type="url"
              value={values.image_url}
              onChange={(e) => handleField('image_url', e.target.value)}
              placeholder="https://example.com/wine.jpg"
            />
          </Field>
        </section>

        <Separator />

        {/* ── Section: Settings ── */}
        <section aria-labelledby="wine-section-settings">
          <h3 id="wine-section-settings" className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Settings
          </h3>
          <label
            htmlFor="wine-is-active"
            className="flex items-center gap-3 cursor-pointer w-fit"
          >
            <Checkbox
              id="wine-is-active"
              checked={values.is_active}
              onCheckedChange={(checked) => handleField('is_active', Boolean(checked))}
              aria-label="Set wine as active"
            />
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">
                Active wines appear in search results and the producer catalog.
              </p>
            </div>
          </label>
        </section>

        {/* ── Save bar ── */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div aria-live="polite" aria-atomic="true">
            {saveError && <p className="text-sm text-destructive">{saveError}</p>}
            {saveSuccess && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Wine saved successfully.
              </p>
            )}
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? isEditMode
                ? 'Saving...'
                : 'Creating...'
              : isEditMode
              ? 'Save Changes'
              : 'Create Wine'}
          </Button>
        </div>
      </div>
    </form>
  )
}
