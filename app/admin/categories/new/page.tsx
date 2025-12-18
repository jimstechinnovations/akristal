import { requireAdmin } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CreateCategoryForm } from '@/components/create-category-form'

export default async function AdminNewCategoryPage() {
  await requireAdmin()

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
            Add Category
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create a new property category
          </p>
        </div>

        <CreateCategoryForm />
      </div>
    </div>
  )
}
