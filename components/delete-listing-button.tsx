'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteProperty } from '@/app/actions/properties'
import { getErrorMessage } from '@/lib/utils'

export function DeleteListingButton({ propertyId }: { propertyId: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const result = await deleteProperty(propertyId)
      if (result.success) {
        toast.success('Listing deleted')
      } else {
        toast.error(result.error || 'Failed to delete listing')
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || 'Failed to delete listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
    >
      <Trash2 className="h-4 w-4 mr-1" />
      {loading ? 'Deleting...' : 'Delete'}
    </Button>
  )
}


