'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { deleteMember } from '@/app/actions/members'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/utils'

export function DeleteMemberButton({ memberId }: { memberId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const result = await deleteMember(memberId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Member deleted successfully')
        router.refresh()
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || 'Failed to delete member')
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
