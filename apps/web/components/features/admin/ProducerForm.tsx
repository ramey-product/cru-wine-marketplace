'use client'

/**
 * ProducerForm — Admin client component.
 *
 * Create or edit a producer. Used on both /admin/producers/new and
 * /admin/producers/[id]. Pass `initialData` to pre-fill for editing.
 *
 * TODO: Call createProducer / updateProducer server actions on submit.
 */

import { useState, useTransition, useCallback } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProducerFormValues {
  name: string
  slug: string
  region: string
  country: string
  tagline: string
  story_content: string
  farming_practices: string[]
  vineyard_size: string
  year_established: string
  annual_production: string
  hero_image_url: string
  is_active: boolean
}

const FARMING_PRACTICE_OPTIONS = [
  { value: 'organic', label: 'Organic' },
  { value: 'biodynamic', label: 'Biodynamic' },
  { value: 'sustainable', label: 'Sustainable' },
  { value: 'conventional', label: 'Conventional' },
  { value: 'natural', label: 'Natural' },
] as const

const TAGLINE_MAX = 150

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Converts a display name into a URL-safe slug. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const EMPTY_FORM: ProducerFormValues = {
  name: '',
  slug: '',
  region: '',
  country: '',
  tagline: '',
  story_content: '',
  farming_practices: [],
  vineyard_size: '',
  year_established: '',
  annual_production: '',
  hero_image_url: '',
  is_active: true,
}

// ---------------------------------------------------------------------------
// Sub-components
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
        {required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
}

function Input({ className, ...props }: InputProps) {
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

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string
}

function Textarea({ className, ...props }: TextareaProps) {
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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ProducerFormProps {
  /** Pre-populated values for edit mode. Omit for create mode. */
  initialData?: Partial<ProducerFormValues>
  /** Producer ID — required for update; omit for create. */
  producerId?: string
}

export function ProducerForm({ initialData, producerId }: ProducerFormProps) {
  const isEditMode = Boolean(producerId)

  const [values, setValues] = useState<ProducerFormValues>({
    ...EMPTY_FORM,
    ...initialData,
  })
  const [storyPreviewMode, setStoryPreviewMode] = useState<'edit' | 'preview'>('edit')
  /** Tracks whether the slug was manually edited so auto-gen stops overwriting it. */
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditMode)
  const [isPending, startTransition] = useTransition()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  function handleField<K extends keyof ProducerFormValues>(
    key: K,
    value: ProducerFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setValues((prev) => ({
      ...prev,
      name,
      // Auto-generate slug while the user hasn't manually touched it
      slug: slugManuallyEdited ? prev.slug : slugify(name),
    }))
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugManuallyEdited(true)
    handleField('slug', e.target.value)
  }

  function handleTaglineChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.slice(0, TAGLINE_MAX)
    handleField('tagline', value)
  }

  const togglePractice = useCallback((practice: string) => {
    setValues((prev) => {
      const has = prev.farming_practices.includes(practice)
      return {
        ...prev,
        farming_practices: has
          ? prev.farming_practices.filter((p) => p !== practice)
          : [...prev.farming_practices, practice],
      }
    })
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)
    setSaveSuccess(false)

    startTransition(async () => {
      try {
        // TODO: Call createProducer or updateProducer server action
        // const result = isEditMode
        //   ? await updateProducer(producerId!, values)
        //   : await createProducer(values)
        // if (result.error) { setSaveError(result.error); return }
        // router.push(`/admin/producers/${result.data.id}`)
        setSaveSuccess(true)
      } catch {
        setSaveError('An unexpected error occurred. Please try again.')
      }
    })
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const taglineRemaining = TAGLINE_MAX - values.tagline.length
  const taglineClass = taglineRemaining < 20 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'

  return (
    <form onSubmit={handleSubmit} noValidate aria-label={isEditMode ? 'Edit producer' : 'Create producer'}>
      <div className="space-y-8">

        {/* ── Section: Identity ── */}
        <section aria-labelledby="section-identity">
          <h2 id="section-identity" className="text-base font-semibold mb-4">
            Identity
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Name" htmlFor="producer-name" required>
              <Input
                id="producer-name"
                name="name"
                value={values.name}
                onChange={handleNameChange}
                placeholder="e.g. Domaine Tempier"
                required
                autoComplete="off"
              />
            </Field>

            <Field
              label="Slug"
              htmlFor="producer-slug"
              hint="Used in URLs. Auto-generated from name."
            >
              <Input
                id="producer-slug"
                name="slug"
                value={values.slug}
                onChange={handleSlugChange}
                placeholder="e.g. domaine-tempier"
                pattern="[a-z0-9-]+"
                autoComplete="off"
              />
            </Field>

            <Field label="Region" htmlFor="producer-region">
              <Input
                id="producer-region"
                name="region"
                value={values.region}
                onChange={(e) => handleField('region', e.target.value)}
                placeholder="e.g. Bandol"
              />
            </Field>

            <Field label="Country" htmlFor="producer-country">
              <Input
                id="producer-country"
                name="country"
                value={values.country}
                onChange={(e) => handleField('country', e.target.value)}
                placeholder="e.g. France"
              />
            </Field>
          </div>
        </section>

        <Separator />

        {/* ── Section: Story ── */}
        <section aria-labelledby="section-story">
          <h2 id="section-story" className="text-base font-semibold mb-4">
            Story &amp; Voice
          </h2>
          <div className="space-y-5">
            {/* Tagline with character counter */}
            <Field
              label="Tagline"
              htmlFor="producer-tagline"
              hint={`${values.tagline.length}/${TAGLINE_MAX}`}
            >
              <Input
                id="producer-tagline"
                name="tagline"
                value={values.tagline}
                onChange={handleTaglineChange}
                placeholder="A short, evocative description of the producer"
                maxLength={TAGLINE_MAX}
                aria-describedby="tagline-counter"
              />
              <p
                id="tagline-counter"
                className={cn('text-xs', taglineClass)}
                aria-live="polite"
                aria-atomic="true"
              >
                {taglineRemaining} characters remaining
              </p>
            </Field>

            {/* Story content with markdown preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="producer-story" className="block text-sm font-medium text-foreground">
                  Story Content
                </label>
                <div
                  className="flex rounded-md border border-input overflow-hidden text-xs"
                  role="group"
                  aria-label="Story content view mode"
                >
                  <button
                    type="button"
                    onClick={() => setStoryPreviewMode('edit')}
                    className={cn(
                      'px-3 py-1 transition-colors',
                      storyPreviewMode === 'edit'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:text-foreground'
                    )}
                    aria-pressed={storyPreviewMode === 'edit'}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoryPreviewMode('preview')}
                    className={cn(
                      'px-3 py-1 transition-colors border-l border-input',
                      storyPreviewMode === 'preview'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:text-foreground'
                    )}
                    aria-pressed={storyPreviewMode === 'preview'}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {storyPreviewMode === 'edit' ? (
                <Textarea
                  id="producer-story"
                  name="story_content"
                  value={values.story_content}
                  onChange={(e) => handleField('story_content', e.target.value)}
                  placeholder="Tell the producer's story in Markdown. Use **bold**, *italic*, and paragraph breaks."
                  rows={8}
                  aria-label="Story content in Markdown format"
                />
              ) : (
                <div
                  className="min-h-[12rem] rounded-md border border-input bg-muted/30 px-3 py-2 text-sm prose prose-sm dark:prose-invert max-w-none"
                  aria-label="Story content preview"
                  aria-live="polite"
                >
                  {values.story_content ? (
                    // Simple whitespace-preserving preview — a full Markdown renderer
                    // (e.g. react-markdown) should be swapped in for production.
                    <div className="whitespace-pre-wrap">{values.story_content}</div>
                  ) : (
                    <p className="text-muted-foreground italic">Nothing to preview yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <Separator />

        {/* ── Section: Viticulture ── */}
        <section aria-labelledby="section-viticulture">
          <h2 id="section-viticulture" className="text-base font-semibold mb-4">
            Viticulture
          </h2>
          <div className="space-y-5">
            {/* Farming practices */}
            <fieldset>
              <legend className="text-sm font-medium text-foreground mb-2">
                Farming Practices
              </legend>
              <div className="flex flex-wrap gap-3">
                {FARMING_PRACTICE_OPTIONS.map((option) => {
                  const checked = values.farming_practices.includes(option.value)
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        'flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors select-none',
                        checked
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-border bg-background text-muted-foreground hover:border-input hover:text-foreground'
                      )}
                    >
                      <Checkbox
                        id={`practice-${option.value}`}
                        checked={checked}
                        onCheckedChange={() => togglePractice(option.value)}
                        aria-label={option.label}
                      />
                      {option.label}
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field label="Vineyard Size" htmlFor="producer-vineyard-size" hint="e.g. 25 acres">
                <Input
                  id="producer-vineyard-size"
                  name="vineyard_size"
                  value={values.vineyard_size}
                  onChange={(e) => handleField('vineyard_size', e.target.value)}
                  placeholder="25 acres"
                />
              </Field>

              <Field label="Year Established" htmlFor="producer-year-established">
                <Input
                  id="producer-year-established"
                  name="year_established"
                  type="number"
                  value={values.year_established}
                  onChange={(e) => handleField('year_established', e.target.value)}
                  placeholder="1960"
                  min={1700}
                  max={new Date().getFullYear()}
                />
              </Field>

              <Field label="Annual Production" htmlFor="producer-annual-production" hint="e.g. 10,000 cases">
                <Input
                  id="producer-annual-production"
                  name="annual_production"
                  value={values.annual_production}
                  onChange={(e) => handleField('annual_production', e.target.value)}
                  placeholder="10,000 cases"
                />
              </Field>
            </div>
          </div>
        </section>

        <Separator />

        {/* ── Section: Media ── */}
        <section aria-labelledby="section-media">
          <h2 id="section-media" className="text-base font-semibold mb-4">
            Media
          </h2>
          <Field
            label="Hero Image URL"
            htmlFor="producer-hero-image"
            hint="Paste a full URL to the hero image. File upload coming in V2."
          >
            <Input
              id="producer-hero-image"
              name="hero_image_url"
              type="url"
              value={values.hero_image_url}
              onChange={(e) => handleField('hero_image_url', e.target.value)}
              placeholder="https://example.com/producer-hero.jpg"
            />
          </Field>
        </section>

        <Separator />

        {/* ── Section: Settings ── */}
        <section aria-labelledby="section-settings">
          <h2 id="section-settings" className="text-base font-semibold mb-4">
            Settings
          </h2>
          <label
            htmlFor="producer-is-active"
            className="flex items-center gap-3 cursor-pointer w-fit"
          >
            <Checkbox
              id="producer-is-active"
              checked={values.is_active}
              onCheckedChange={(checked) => handleField('is_active', Boolean(checked))}
              aria-label="Set producer as active"
            />
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">
                Active producers are visible to users on the platform.
              </p>
            </div>
          </label>
        </section>

        {/* ── Save bar ── */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div aria-live="polite" aria-atomic="true">
            {saveError && (
              <p className="text-sm text-destructive">{saveError}</p>
            )}
            {saveSuccess && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Producer saved successfully.
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
              : 'Create Producer'}
          </Button>
        </div>
      </div>
    </form>
  )
}
