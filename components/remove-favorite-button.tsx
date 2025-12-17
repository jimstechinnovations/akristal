'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleFavorite } from '@/app/actions/favorites'
import toast from 'react-hot-toast'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getErrorMessage } from '@/lib/utils'

export function RemoveFavoriteButton({ propertyId }: { propertyId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRemove = async () => {
    setLoading(true)
    try {
      const result = await toggleFavorite(propertyId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Removed from favorites')
        router.refresh()
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || 'Failed to remove favorite')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRemove}
      disabled={loading}
      className="w-full text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
    >
      <Heart className="h-4 w-4 mr-1" />
      {loading ? 'Removing...' : 'Remove from Favorites'}
    </Button>
  )
}

