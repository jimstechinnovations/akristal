import { createClient } from '@/lib/supabase/server'
import { MemberCard } from '@/components/member-card'

export const metadata = {
  title: 'Members - TheAkristalGroup',
  description: 'Meet distinguished members and partners of TheAkristalGroup.',
}

type MemberRow = {
  id: string
  name: string
  role: string
  image_url: string | null
  details: string
  display_order: number
  is_active: boolean
}

export default async function MembersPage() {
  const supabase = await createClient()

  // Fetch active members, ordered by display_order
  const { data: members, error } = await supabase
    .from('members')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  const typedMembers = (members as MemberRow[] | null) ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Our Members
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Meet the visionary leaders and strategic partners whose expertise, integrity, and innovation
          help shape the future of TheAkristalGroup and the wider real estate ecosystem.
        </p>
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">Error loading members: {error.message}</p>
        </div>
      ) : typedMembers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {typedMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={{
                name: member.name,
                role: member.role,
                imageUrl: member.image_url || '',
                details: member.details,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No members available at this time.</p>
        </div>
      )}
    </div>
  )
}
