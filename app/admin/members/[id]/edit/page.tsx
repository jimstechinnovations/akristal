import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { MemberForm } from '@/components/member-form'

type MemberRow = {
  id: string
  name: string
  role: string
  image_url: string | null
  details: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const supabase = await createClient()

  const { data: member, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !member) {
    notFound()
  }

  const typedMember = member as MemberRow

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Member</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update the details for this member
        </p>
      </div>
      <MemberForm member={typedMember} />
    </div>
  )
}
