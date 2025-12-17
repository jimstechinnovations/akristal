import { requireAdmin } from '@/lib/auth'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function AdminNewUserPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="bg-white dark:bg-[#1e293b]">
          <CardHeader>
            <CardTitle className="text-[#0d233e] dark:text-white">Add User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              User creation is not implemented in the admin UI yet. The safest way to add users is:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>Let the user sign up via the public Register page</li>
              <li>Or create/invite users from the Supabase dashboard</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Link href="/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#0d233e] hover:bg-[#0a1a2e] text-white">
                  Go to Register
                </Button>
              </Link>
              <Link href="/admin/users" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  Back to Users
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


