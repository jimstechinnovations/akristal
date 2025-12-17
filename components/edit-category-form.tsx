'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateCategory } from '@/app/actions/admin'
import toast from 'react-hot-toast'
import type { Database } from '@/types/database'

type Category = Database['public']['Tables']['categories']['Row']

export function EditCategoryForm({ category }: { category: Category }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: category.name || '',
    slug: category.slug || '',
    description: category.description || '',
    icon: category.icon || '',
    color: category.color || '',
    display_order: category.display_order || 0,
    is_active: category.is_active !== false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append('name', formData.name)
      formDataObj.append('slug', formData.slug)
      formDataObj.append('description', formData.description)
      formDataObj.append('icon', formData.icon)
      formDataObj.append('color', formData.color)
      formDataObj.append('display_order', formData.display_order.toString())
      formDataObj.append('is_active', formData.is_active.toString())

      const result = await updateCategory(category.id, formDataObj)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Category updated successfully!')
        router.push('/admin/categories')
        router.refresh()
      }
    } catch (error: unknown) {
      console.error('Update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-white dark:bg-[#1e293b]">
      <CardHeader>
        <CardTitle className="text-[#0d233e] dark:text-white">Category Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Name *
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Category name"
              required
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Slug *
            </label>
            <Input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              placeholder="category-slug"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              URL-friendly identifier (auto-generated from name)
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Category description..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="icon" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Icon
              </label>
              <Input
                id="icon"
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="Icon name or emoji"
              />
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Color
              </label>
              <Input
                id="color"
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="display_order" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Display Order
            </label>
            <Input
              id="display_order"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              min="0"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Lower numbers appear first
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
              Active
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="bg-[#0d233e] hover:bg-[#0a1a2e] text-white">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/categories')}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
