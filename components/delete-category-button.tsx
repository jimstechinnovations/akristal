'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { deleteCategory } from '@/app/actions/admin'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/utils'

export function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const result = await deleteCategory(categoryId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Category deleted successfully')
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || 'Failed to delete category')
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
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}

