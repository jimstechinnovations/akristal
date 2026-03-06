import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import PropertyTypeForm from '@/components/property-type-form'
import DeletePropertyTypeButton from '@/components/delete-property-type-button'

export default async function PropertyTypesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as { role?: string } | null)?.role !== 'admin') redirect('/unauthorized')

  const { data: propertyTypes } = await supabase
    .from('property_types')
    .select('*')
    .order('display_order', { ascending: true })

  type PropertyType = {
    id: string
    name: string
    slug: string
    description: string | null
    icon: string | null
    display_order: number
    is_active: boolean
    created_by: string | null
    created_at: string
    updated_at: string
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Property Types
            </h1>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add New Property Type</CardTitle>
            </CardHeader>
            <CardContent>
              <PropertyTypeForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Property Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {propertyTypes && propertyTypes.length > 0 ? (
                  (propertyTypes as PropertyType[]).map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {type.name}
                          </h3>
                          {!type.is_active && (
                            <span className="rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400">
                              Inactive
                            </span>
                          )}
                        </div>
                        {type.description && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {type.description}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                          Slug: {type.slug} | Order: {type.display_order}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <PropertyTypeForm propertyType={type} />
                        <DeletePropertyTypeButton id={type.id} name={type.name} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    No property types found. Add one to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
