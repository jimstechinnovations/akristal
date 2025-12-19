import { requireAdmin } from '@/lib/auth'
import { MemberForm } from '@/components/member-form'

export default async function NewMemberPage() {
  await requireAdmin()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Member</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Add a new team member to be displayed on the members page
        </p>
      </div>
      <MemberForm />
    </div>
  )
}
