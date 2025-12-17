import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { DeleteCategoryButton } from '@/components/delete-category-button'
import type { Database } from '@/types/database'

type CategoryRow = Database['public']['Tables']['categories']['Row']

export default async function AdminCategoriesPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0d233e] dark:text-white">Category Management</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage property categories
            </p>
          </div>
          <Link href="/admin/categories/new">
            <Button className="bg-[#0d233e] hover:bg-[#0a1a2e] text-white w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </Link>
        </div>

        {error ? (
          <Card className="bg-white dark:bg-[#1e293b]">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400">Error loading categories: {error.message}</p>
            </CardContent>
          </Card>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(categories as CategoryRow[]).map((category) => (
              <Card key={category.id} className="bg-white dark:bg-[#1e293b]">
                <CardHeader>
                  <CardTitle className="text-[#0d233e] dark:text-white text-base sm:text-lg">
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{category.description}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Slug: {category.slug}</span>
                    {!category.is_active && (
                      <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/categories/${category.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <DeleteCategoryButton categoryId={category.id} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white dark:bg-[#1e293b]">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">No categories found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

