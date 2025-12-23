import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit } from 'lucide-react'
import { DeleteMemberButton } from '@/components/delete-member-button'

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

export default async function AdminMembersPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: members, error } = await supabase
    .from('members')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0d233e] dark:text-white">Members</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage team members displayed on the members page
            </p>
          </div>
          <Link href="/admin/members/new">
            <Button className="bg-[#0d233e] hover:bg-[#0a1a2e] text-white w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </Link>
        </div>

        {error ? (
          <Card className="bg-white dark:bg-[#1e293b]">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400">Error loading members: {error.message}</p>
            </CardContent>
          </Card>
        ) : members && members.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(members as MemberRow[]).map((member) => (
              <Card key={member.id} className="bg-white dark:bg-[#1e293b] overflow-hidden">
                {member.image_url && (
                  <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-900">
                    <Image
                      src={member.image_url}
                      alt={member.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-[#0d233e] dark:text-white text-base sm:text-lg">
                        {member.name}
                      </CardTitle>
                      <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">{member.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/members/${member.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteMemberButton memberId={member.id} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                    {member.details}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Order: {member.display_order}</span>
                    <span
                      className={`px-2 py-1 rounded-full ${
                        member.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white dark:bg-[#1e293b]">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No members found.</p>
              <Link href="/admin/members/new">
                <Button className="bg-[#0d233e] hover:bg-[#0a1a2e] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Member
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
