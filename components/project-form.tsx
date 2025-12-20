'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createProject, updateProject } from '@/app/actions/projects'
import { uploadFile, getPublicUrl } from '@/lib/storage'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/utils'
import { X } from 'lucide-react'
import Image from 'next/image'

type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived'
type ProjectType = 'bungalow' | 'duplex' | 'terraces' | 'town_house' | 'apartment' | 'high_rising' | 'condominiums'

type ProjectRow = {
  id: string
  title: string
  description: string | null
  media_urls: string[] | null
  created_by: string
  status: ProjectStatus
  type?: ProjectType | null
  pre_selling_price?: number | null
  pre_selling_currency?: string | null
  main_price?: number | null
  main_currency?: string | null
  created_at: string
  updated_at: string
}

export function ProjectForm({ project }: { project?: ProjectRow }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'draft',
    type: project?.type || '',
    pre_selling_price: project?.pre_selling_price?.toString() || '',
    pre_selling_currency: project?.pre_selling_currency || 'RWF',
    main_price: project?.main_price?.toString() || '',
    main_currency: project?.main_currency || 'RWF',
    created_at: project?.created_at ? new Date(project.created_at).toISOString().slice(0, 16) : '',
  })
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<Array<{ url: string; isFile: boolean }>>(
    project?.media_urls?.map((url) => ({ url, isFile: false })) || []
  )

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setMediaFiles((prev) => [...prev, ...files])

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setMediaPreviews((prev) => [...prev, { url: e.target?.result as string, isFile: true }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeMedia = (index: number) => {
    const preview = mediaPreviews[index]
    if (preview.isFile) {
      // Remove from files array
      const fileIndex = mediaPreviews.slice(0, index).filter((p) => p.isFile).length
      setMediaFiles((prev) => prev.filter((_, i) => i !== fileIndex))
    }
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please sign in to create/update a project')
        setLoading(false)
        return
      }

      // Upload media files
      const mediaUrls: string[] = []
      
      // Keep existing media URLs (non-file previews)
      const existingUrls = mediaPreviews.filter((p) => !p.isFile).map((p) => p.url)
      mediaUrls.push(...existingUrls)

      // Upload new media files
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          try {
            const fileName = `${user.id}/${Date.now()}-${file.name}`
            const { data, error } = await uploadFile('project-media', fileName, file)
            if (error) {
              console.error('Media upload error:', error)
              toast.error(`Failed to upload ${file.name}: ${error.message || 'Unknown error'}`)
              setLoading(false)
              return
            }
            if (data) {
              const url = getPublicUrl('project-media', data.path)
              mediaUrls.push(url)
            } else {
              console.error('No data returned from upload for file:', file.name)
              toast.error(`Failed to upload ${file.name}: No data returned`)
              setLoading(false)
              return
            }
          } catch (uploadError: any) {
            console.error('Media upload exception:', uploadError)
            toast.error(`Failed to upload ${file.name}: ${uploadError.message || 'Unknown error'}`)
            setLoading(false)
            return
          }
        }
      }

      const formDataObj = new FormData()
      formDataObj.append('title', formData.title)
      formDataObj.append('description', formData.description)
      formDataObj.append('status', formData.status)
      formDataObj.append('media_urls', JSON.stringify(mediaUrls))
      if (formData.type) {
        formDataObj.append('type', formData.type)
      }
      if (formData.pre_selling_price) {
        formDataObj.append('pre_selling_price', formData.pre_selling_price)
        formDataObj.append('pre_selling_currency', formData.pre_selling_currency)
      }
      if (formData.main_price) {
        formDataObj.append('main_price', formData.main_price)
        formDataObj.append('main_currency', formData.main_currency)
      }
      if (!project && formData.created_at) {
        // Only allow backdating when creating, not updating
        formDataObj.append('created_at', new Date(formData.created_at).toISOString())
      }

      let result
      if (project) {
        result = await updateProject(project.id, formDataObj)
      } else {
        result = await createProject(formDataObj)
      }

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(project ? 'Project updated successfully!' : 'Project created successfully!')
        // Reset form for new projects
        if (!project) {
          setFormData({
            title: '',
            description: '',
            status: 'draft',
            type: '',
            pre_selling_price: '',
            pre_selling_currency: 'RWF',
            main_price: '',
            main_currency: 'RWF',
            created_at: '',
          })
          setMediaFiles([])
          setMediaPreviews([])
        }
        if (result.project) {
          router.push(`/projects/${result.project.id}`)
        } else if (project) {
          router.push(`/projects/${project.id}`)
        } else {
          router.push('/projects')
        }
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || 'Failed to save project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Description
            </label>
            <textarea
              className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Status *
            </label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'draft' | 'active' | 'completed' | 'archived',
                })
              }
              required
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Type <span className="text-gray-500 dark:text-gray-400">(Optional)</span>
            </label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value,
                })
              }
            >
              <option value="">Select Type</option>
              <option value="bungalow">Bungalow</option>
              <option value="duplex">Duplex</option>
              <option value="terraces">Terraces</option>
              <option value="town_house">Town House</option>
              <option value="apartment">Apartment</option>
              <option value="high_rising">High Rising</option>
              <option value="condominiums">Condominiums</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Pre-selling Price <span className="text-gray-500 dark:text-gray-400">(Optional)</span>
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={formData.pre_selling_price}
                  onChange={(e) => setFormData({ ...formData, pre_selling_price: e.target.value })}
                  placeholder="0.00"
                  className="flex-1"
                />
                <select
                  className="w-24 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  value={formData.pre_selling_currency}
                  onChange={(e) => setFormData({ ...formData, pre_selling_currency: e.target.value })}
                >
                  <option value="RWF">RWF</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Main Price <span className="text-gray-500 dark:text-gray-400">(Optional)</span>
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={formData.main_price}
                  onChange={(e) => setFormData({ ...formData, main_price: e.target.value })}
                  placeholder="0.00"
                  className="flex-1"
                />
                <select
                  className="w-24 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  value={formData.main_currency}
                  onChange={(e) => setFormData({ ...formData, main_currency: e.target.value })}
                >
                  <option value="RWF">RWF</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Media (Images & Videos) <span className="text-gray-500 dark:text-gray-400">(Optional)</span>
            </label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
            />
            {mediaPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {mediaPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                      {preview.url.startsWith('data:image') || preview.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <video src={preview.url} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!project && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Created Date (Optional - for backdating)
              </label>
              <Input
                type="datetime-local"
                value={formData.created_at}
                onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Leave empty to use current date and time. Set a past date to backdate the project creation.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
