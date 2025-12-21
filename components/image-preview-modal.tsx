'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImagePreviewModalProps {
  images: string[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
}

export function ImagePreviewModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
}: ImagePreviewModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && onPrevious) {
        onPrevious()
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onNext, onPrevious])

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-h-[90vh] max-w-[90vw] w-full h-full flex items-center justify-center p-4">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white border-none"
          aria-label="Close preview"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Previous Button */}
        {images.length > 1 && onPrevious && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onPrevious()
            }}
            className="absolute left-4 z-10 bg-white/10 hover:bg-white/20 text-white border-none"
            aria-label="Previous image"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
        )}

        {/* Next Button */}
        {images.length > 1 && onNext && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="absolute right-4 z-10 bg-white/10 hover:bg-white/20 text-white border-none"
            aria-label="Next image"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        )}

        {/* Image */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={currentImage}
            alt={`Preview ${currentIndex + 1}`}
            fill
            className="object-contain"
            unoptimized
            priority
          />
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  )
}

