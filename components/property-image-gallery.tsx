'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Building2 } from 'lucide-react'
import { ImagePreviewModal } from '@/components/image-preview-modal'

interface PropertyImageGalleryProps {
  coverImageUrl?: string | null
  imageUrls?: string[] | null
  title: string
}

export function PropertyImageGallery({ coverImageUrl, imageUrls, title }: PropertyImageGalleryProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)

  // Combine all images: cover image first, then other images (avoid duplicates)
  const allImages: string[] = []
  if (coverImageUrl) {
    allImages.push(coverImageUrl)
  }
  if (imageUrls && imageUrls.length > 0) {
    imageUrls.forEach((url) => {
      if (url && url !== coverImageUrl) {
        allImages.push(url)
      }
    })
  }

  const handleImageClick = (index: number) => {
    setPreviewIndex(index)
    setIsPreviewOpen(true)
  }

  const handleNext = () => {
    setPreviewIndex((prev) => (prev + 1) % allImages.length)
  }

  const handlePrevious = () => {
    setPreviewIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  if (allImages.length === 0) {
    return (
      <div className="mb-8 flex h-96 w-full items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700">
        <Building2 className="h-24 w-24 text-gray-400" />
      </div>
    )
  }

  return (
    <>
      {allImages.length > 1 ? (
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allImages.slice(0, 6).map((url, index) => (
            <div
              key={index}
              className="relative h-64 w-full overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleImageClick(index)}
            >
              <Image
                src={url}
                alt={`${title} - Image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="relative mb-8 h-96 w-full overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => handleImageClick(0)}
        >
          <Image
            src={allImages[0]}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}
      {allImages.length > 0 && (
        <ImagePreviewModal
          images={allImages}
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


