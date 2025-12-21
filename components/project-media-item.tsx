'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImagePreviewModal } from '@/components/image-preview-modal'

interface ProjectMediaItemProps {
  mediaUrl: string
  alt: string
  className?: string
}

export function ProjectMediaItem({ mediaUrl, alt, className = 'h-32' }: ProjectMediaItemProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  if (!mediaUrl || typeof mediaUrl !== 'string') {
    return null
  }

  const isImage = mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)

  const handleImageClick = () => {
    if (isImage) {
      setIsPreviewOpen(true)
    }
  }

  return (
    <>
      <div
        className={`relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 ${
          isImage ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
        } ${className}`}
        onClick={handleImageClick}
      >
        {isImage ? (
          <Image
            src={mediaUrl}
            alt={alt}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <video src={mediaUrl} controls className="h-full w-full object-cover" />
        )}
      </div>
      {isImage && (
        <ImagePreviewModal
          images={[mediaUrl]}
          currentIndex={0}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </>
  )
}


