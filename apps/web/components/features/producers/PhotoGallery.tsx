'use client'

import Image from 'next/image'

interface Photo {
  id: string
  image_url: string
  caption: string | null
  display_order: number
}

interface PhotoGalleryProps {
  photos: Photo[]
  producerName: string
}

export function PhotoGallery({ photos, producerName }: PhotoGalleryProps) {
  if (photos.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="photo-gallery-heading">
      <h2
        id="photo-gallery-heading"
        className="text-lg font-semibold text-foreground mb-4"
      >
        Gallery
      </h2>
      <div
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide"
        role="region"
        aria-label={`Photo gallery for ${producerName}`}
      >
        {photos
          .sort((a, b) => a.display_order - b.display_order)
          .map((photo) => (
            <div
              key={photo.id}
              className="flex-shrink-0 w-72 sm:w-80 snap-start"
            >
              {/*
               * TODO: Replace this button with a full lightbox/dialog implementation.
               * The lightbox should render an <Image> at full viewport size with zoom
               * support and prev/next navigation. A Radix Dialog + react-medium-image-zoom
               * (or a custom sheet) would be a good fit. Deferred to a later sprint.
               */}
              <button
                type="button"
                className="block w-full text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
                aria-label={`View full size: ${photo.caption ?? `${producerName} photo`}`}
                onClick={() => {
                  // TODO: open lightbox here
                }}
              >
                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={photo.image_url}
                    alt={photo.caption ?? `${producerName} photo`}
                    width={480}
                    height={360}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </button>
              {photo.caption && (
                <p className="mt-2 text-sm text-muted-foreground">{photo.caption}</p>
              )}
            </div>
          ))}
      </div>
    </section>
  )
}
