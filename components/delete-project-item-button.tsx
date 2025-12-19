'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteProjectUpdate, deleteProjectOffer, deleteProjectEvent } from '@/app/actions/projects'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/utils'
import { useRouter } from 'next/navigation'

type ItemType = 'update' | 'offer' | 'event'

interface DeleteProjectItemButtonProps {
  itemId: string
  itemType: ItemType
}

export function DeleteProjectItemButton({ itemId, itemType }: DeleteProjectItemButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    const itemName = itemType.charAt(0).toUpperCase() + itemType.slice(1)
    if (!confirm(`Are you sure you want to delete this ${itemType}? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      let result
      if (itemType === 'update') {
        result = await deleteProjectUpdate(itemId)
      } else if (itemType === 'offer') {
        result = await deleteProjectOffer(itemId)
      } else {
        result = await deleteProjectEvent(itemId)
      }

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${itemName} deleted successfully`)
        router.refresh()
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || `Failed to delete ${itemType}`)
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
