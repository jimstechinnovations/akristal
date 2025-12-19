import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PropertyForm } from '@/components/property-form'
import { notFound } from 'next/navigation'
import type { Database } from '@/types/database'

type PropertyRow = Database['public']['Tables']['properties']['Row']

export default async function SellerEditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireAuth()
  const { id } = await params
  const supabase = await createClient()

  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !property) {
    notFound()
  }

  const typedProperty = property as PropertyRow

  // Check if user owns the property or is admin
  if (typedProperty.seller_id !== user.id && user.profile?.role !== 'admin') {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href={`/properties/${id}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Property
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
