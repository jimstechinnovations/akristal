import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { EditCategoryForm } from '@/components/edit-category-form'
import type { Database } from '@/types/database'

type Category = Database['public']['Tables']['categories']['Row']

export default async function AdminEditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const supabase = await createClient()

  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !category) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f172a]">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <Card className="bg-white dark:bg-[#1e293b]">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400">
                {error?.message || 'Category not found'}
              </p>
              <Link href="/admin/categories" className="mt-4 inline-block">
                <Button variant="outline">Back to Categories</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const categoryData = category as Category

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/admin/categories"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0d233e] dark:text-white">
            Edit Category
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Update category information
          </p>
        </div>

        <EditCategoryForm category={categoryData} />
      </div>
    </div>
  )
}
