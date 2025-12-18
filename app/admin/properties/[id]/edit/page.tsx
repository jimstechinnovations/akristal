import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PropertyForm } from '@/components/property-form'
import type { Database } from '@/types/database'

type PropertyRow = Database['public']['Tables']['properties']['Row']

export default async function AdminEditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const supabase = await createClient()

  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !property) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f172a]">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <Card className="bg-white dark:bg-[#1e293b]">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400">
                {error?.message || 'Property not found'}
              </p>
              <Link href="/admin/properties" className="mt-4 inline-block">
                <Button variant="outline">Back to Properties</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const typedProperty = property as PropertyRow

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin/properties"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Property
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Update the details for this listing
          </p>
        </div>

        <PropertyForm property={typedProperty} />
      </div>
    </div>
  )
}
