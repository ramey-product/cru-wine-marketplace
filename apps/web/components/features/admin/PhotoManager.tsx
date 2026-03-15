'use client'

/**
 * PhotoManager — Admin client component.
 *
 * Manage the ordered photo gallery for a producer.
 * Supports adding photos by URL, removing photos, and reordering with
 * up/down controls.
 *
 * TODO: Call addProducerPhoto, deleteProducerPhoto, reorderProducerPhotos
 *       server actions instead of local state mutations.
 */

import { useState, useTransition } from 'react'
import { ArrowUp, ArrowDown, X, Plus, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PhotoEntry {
  id: string
  image_url: string
  caption: string | null
  display_order: number
}

// ---------------------------------------------------------------------------
// Mock data — TODO: Replace with photos from getProducerById DAL call
// ---------------------------------------------------------------------------

const MOCK_PHOTOS: PhotoEntry[] = [
  {
    id: 'photo-1',
    image_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400',
    caption: 'Vineyard at sunrise',
    display_order: 0,
  },
  {
    id: 'photo-2',
    image_url: 'https://images.unsplash.com/photo-1559693367-d7aaab31d3b5?w=400',
    caption: 'Harvest season',
    display_order: 1,
  },
  {
    id: 'photo-3',
    image_url: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400',
    caption: null,
    display_order: 2,
  },
]

// ---------------------------------------------------------------------------
// Helper — swap two items in an array
// ---------------------------------------------------------------------------

function swapItems<T>(arr: T[], i: number, j: number): T[] {
  const next = [...arr]
  ;[next[i], next[j]] = [next[j]!, next[i]!]
  return next
}

// ---------------------------------------------------------------------------
// Sub-component: single photo card
// ---------------------------------------------------------------------------

interface PhotoCardProps {
  photo: PhotoEntry
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}

function PhotoCard({ photo, index, total, onMoveUp, onMoveDown, onRemove }: PhotoCardProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="relative rounded-lg border border-border bg-card overflow-hidden group">
      {/* Thumbnail */}
      <div className="relative h-40 bg-muted flex items-center justify-center">
        {imgError ? (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageOff className="h-8 w-8" aria-hidden="true" />
            <span className="text-xs">Image unavailable</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.image_url}
            alt={photo.caption ?? `Photo ${index + 1}`}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        )}

        {/* Position badge */}
        <span className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white tabular-nums">
          {index + 1}
        </span>

        {/* Remove button */}
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
          aria-label={`Remove photo ${index + 1}`}
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* URL */}
      <div className="px-3 py-2 border-t border-border">
        <p
          className="text-xs text-muted-foreground truncate"
          title={photo.image_url}
          aria-label="Photo URL"
        >
          {photo.image_url}
        </p>
        {photo.caption && (
          <p className="text-xs text-foreground mt-0.5 truncate" title={photo.caption}>
            {photo.caption}
          </p>
        )}
      </div>

      {/* Reorder controls */}
      <div className="flex border-t border-border">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="flex-1 flex items-center justify-center py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={`Move photo ${index + 1} up`}
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="w-px bg-border" />
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="flex-1 flex items-center justify-center py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={`Move photo ${index + 1} down`}
        >
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface PhotoManagerProps {
  producerId: string
  /** Optional initial photo data from server. Falls back to mock data. */
  initialPhotos?: PhotoEntry[]
}

export function PhotoManager({ producerId, initialPhotos = MOCK_PHOTOS }: PhotoManagerProps) {
  const [photos, setPhotos] = useState<PhotoEntry[]>(initialPhotos)
  const [newUrl, setNewUrl] = useState('')
  const [newCaption, setNewCaption] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  function handleAdd() {
    const trimmed = newUrl.trim()
    if (!trimmed) {
      setUrlError('Please enter an image URL.')
      return
    }
    try {
      new URL(trimmed)
    } catch {
      setUrlError('Please enter a valid URL (starting with https://).')
      return
    }

    setUrlError(null)

    const newPhoto: PhotoEntry = {
      id: `temp-${Date.now()}`,
      image_url: trimmed,
      caption: newCaption.trim() || null,
      display_order: photos.length,
    }

    startTransition(async () => {
      // TODO: Call addProducerPhoto server action
      // const result = await addProducerPhoto({
      //   producer_id: producerId,
      //   image_url: trimmed,
      //   caption: newCaption.trim() || null,
      //   display_order: photos.length,
      // })
      // if (result.error) { ... }
      setPhotos((prev) => [...prev, newPhoto])
      setNewUrl('')
      setNewCaption('')
    })
  }

  function handleRemove(index: number) {
    const photo = photos[index]

    startTransition(async () => {
      // TODO: Call deleteProducerPhoto server action
      // await deleteProducerPhoto(photo.id, producerId)
      setPhotos((prev) => prev.filter((_, i) => i !== index))
    })
  }

  function handleMove(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= photos.length) return

    const reordered = swapItems(photos, index, targetIndex).map((p, i) => ({
      ...p,
      display_order: i,
    }))

    startTransition(async () => {
      // TODO: Call reorderProducerPhotos server action
      // await reorderProducerPhotos(producerId, reordered.map(p => p.id))
      setPhotos(reordered)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Add photo form */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium mb-3">Add Photo</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="photo-url" className="block text-sm font-medium text-foreground">
              Image URL
              <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>
            </label>
            <input
              id="photo-url"
              type="url"
              value={newUrl}
              onChange={(e) => {
                setNewUrl(e.target.value)
                setUrlError(null)
              }}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com/photo.jpg"
              className={cn(
                'w-full rounded-md border bg-background px-3 py-2 text-sm',
                'placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                urlError ? 'border-destructive' : 'border-input'
              )}
              aria-describedby={urlError ? 'photo-url-error' : undefined}
              disabled={isPending}
            />
            {urlError && (
              <p id="photo-url-error" className="text-xs text-destructive" role="alert">
                {urlError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="photo-caption" className="block text-sm font-medium text-foreground">
              Caption <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              id="photo-caption"
              type="text"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Vineyard at harvest"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={isPending}
            />
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={handleAdd}
            disabled={isPending}
            aria-label="Add photo to gallery"
          >
            <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Add Photo
          </Button>
        </div>
      </div>

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 flex flex-col items-center justify-center text-center">
          <ImageOff className="h-10 w-10 text-muted-foreground/40 mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-muted-foreground">No photos yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add a photo URL above to start building the gallery.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              index={index}
              total={photos.length}
              onMoveUp={() => handleMove(index, 'up')}
              onMoveDown={() => handleMove(index, 'down')}
              onRemove={() => handleRemove(index)}
            />
          ))}
        </div>
      )}

      {photos.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {photos.length} photo{photos.length !== 1 ? 's' : ''} — use the arrows to reorder.
        </p>
      )}
    </div>
  )
}
