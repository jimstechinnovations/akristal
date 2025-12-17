import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldX } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <ShieldX className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Unauthorized Access
          </h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            You don't have permission to access this page. Please contact an administrator if you
            believe this is an error.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/">
              <Button className="w-full">Go to Home</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

