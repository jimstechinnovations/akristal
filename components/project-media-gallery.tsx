'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImagePreviewModal } from '@/components/image-preview-modal'

interface ProjectMediaGalleryProps {
  mediaUrls: string[] | null
  title?: string
}

export function ProjectMediaGallery({ mediaUrls, title = 'Project media' }: ProjectMediaGalleryProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)

  if (!mediaUrls || mediaUrls.length === 0) {
    return null
  }

  // Filter to only images for preview
  const imageUrls = mediaUrls.filter((url) => {
    if (!url || typeof url !== 'string') return false
    return url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  })

  const handleImageClick = (index: number) => {
    // Find which image in the imageUrls array corresponds to this index
    let imageCount = 0
    for (let i = 0; i <= index; i++) {
      if (i < mediaUrls.length) {
        const url = mediaUrls[i]
        if (url && typeof url === 'string' && url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          if (i === index) {
            setPreviewIndex(imageCount)
            setIsPreviewOpen(true)
            return
          }
          imageCount++
        }
      }
    }
  }

  const handleNext = () => {
    setPreviewIndex((prev) => (prev + 1) % imageUrls.length)
  }

  const handlePrevious = () => {
    setPreviewIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length)
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mediaUrls.map((url, idx) => {
          if (!url || typeof url !== 'string') return null
          const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
          return (
            <div
              key={idx}
              className={`relative h-64 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 ${
                isImage ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
              }`}
              onClick={() => isImage && handleImageClick(idx)}
            >
              {isImage ? (
                <Image
                  src={url}
                  alt={`${title} ${idx + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <video src={url} controls className="h-full w-full object-cover" />
              )}
            </div>
          )
        })}
      </div>
      {imageUrls.length > 0 && (
        <ImagePreviewModal
          images={imageUrls}
          currentIndex={previewIndex}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </>
  )
}

