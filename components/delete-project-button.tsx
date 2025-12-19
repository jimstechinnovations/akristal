'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { deleteProject } from '@/app/actions/projects'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/utils'

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this project? This will permanently delete the project and all its updates, offers, and events. This action cannot be undone.'
      )
    ) {
      return
    }

    setLoading(true)
    try {
      const result = await deleteProject(projectId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Project deleted successfully')
        router.push('/projects')
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || 'Failed to delete project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {loading ? 'Deleting...' : 'Delete Project'}
    </Button>
  )
}
