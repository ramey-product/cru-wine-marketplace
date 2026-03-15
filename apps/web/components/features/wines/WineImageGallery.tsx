'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface GalleryImage {
  url: string | null
  alt: string
}

interface WineImageGalleryProps {
  images: GalleryImage[]
  wineName: string
}

/**
 * Wine image gallery with main display and thumbnail strip.
 * Clicking a thumbnail switches the main image.
 * Falls back to a placeholder icon when no image URL is provided.
 */
export function WineImageGallery({ images, wineName }: WineImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Ensure at least one entry so the gallery always renders
  const gallery = images.length > 0 ? images : [{ url: null, alt: wineName }]
  const activeImage = gallery[activeIndex] ?? gallery[0] ?? { url: null, alt: wineName }

  return (
    <div className="space-y-3 max-w-md mx-auto lg:mx-0">
      {/* Main image */}
      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
        {activeImage.url ? (
          <Image
            src={activeImage.url}
            alt={activeImage.alt}
            width={600}
            height={800}
            className="w-full h-full object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M8 22h8" />
              <path d="M7 10h10" />
              <path d="M12 15v7" />
              <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Thumbnail strip — only show when more than one image */}
      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Wine image thumbnails">
          {gallery.map((img, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`View image ${index + 1} of ${gallery.length}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'flex-shrink-0 w-16 h-20 rounded-md overflow-hidden bg-muted border-2 transition-all duration-fast',
                index === activeIndex
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-transparent hover:border-border'
              )}
            >
              {img.url ? (
                <Image
                  src={img.url}
                  alt={`${wineName} thumbnail ${index + 1}`}
                  width={64}
                  height={80}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M8 22h8" />
                    <path d="M7 10h10" />
                    <path d="M12 15v7" />
                    <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
