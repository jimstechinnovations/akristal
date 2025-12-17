'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { Check, X } from 'lucide-react'
import type { Database } from '@/types/database'
import { getErrorMessage } from '@/lib/utils'

interface PropertyApprovalActionsProps {
  property: Database['public']['Tables']['properties']['Row']
}

export function PropertyApprovalActions({ property }: PropertyApprovalActionsProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleApproval = async (approved: boolean, reason?: string) => {
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const updateData: Database['public']['Tables']['properties']['Update'] = {
        listing_status: approved ? 'approved' : 'rejected',
        approved_by: user?.id ?? null,
        approved_at: approved ? new Date().toISOString() : null,
        rejection_reason: reason || null,
      }

      const { error } = await (supabase as any)
        .from('properties')
        .update(updateData)
        .eq('id', property.id)

      if (error) throw error

      toast.success(`Property ${approved ? 'approved' : 'rejected'} successfully!`)
      window.location.reload()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || 'Failed to update property')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      {property.listing_status === 'pending_approval' && (
        <>
          <Button
            size="sm"
            onClick={() => handleApproval(true)}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="mr-1 h-4 w-4" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              const reason = prompt('Rejection reason (optional):')
              handleApproval(false, reason || undefined)
            }}
            disabled={loading}
          >
            <X className="mr-1 h-4 w-4" />
            Reject
          </Button>
        </>
      )}
      {property.listing_status === 'approved' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleApproval(false)}
          disabled={loading}
        >
          Suspend
        </Button>
      )}
    </div>
  )
}

