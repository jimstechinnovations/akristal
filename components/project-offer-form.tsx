'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createProjectOffer } from '@/app/actions/projects'
import { uploadFile, getPublicUrl } from '@/lib/storage'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/utils'
import { X } from 'lucide-react'

export function ProjectOfferForm({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    schedule_visibility: 'immediate' as 'immediate' | 'scheduled' | 'hidden',
    scheduled_at: '',
  })
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
  const supabase = createClient()

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setMediaFiles((prev) => [...prev, ...files])

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setMediaPreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index))
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
        toast.error('Please sign in to create an offer')
        return
      }

      // Validate dates
      if (new Date(formData.end_datetime) <= new Date(formData.start_datetime)) {
        toast.error('End datetime must be after start datetime')
        setLoading(false)
        return
      }

      // Upload media files
      const mediaUrls: string[] = []
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
      formDataObj.append('start_datetime', new Date(formData.start_datetime).toISOString())
      formDataObj.append('end_datetime', new Date(formData.end_datetime).toISOString())
      formDataObj.append('media_urls', JSON.stringify(mediaUrls))
      formDataObj.append('schedule_visibility', formData.schedule_visibility)
      if (formData.schedule_visibility === 'scheduled' && formData.scheduled_at) {
        formDataObj.append('scheduled_at', new Date(formData.scheduled_at).toISOString())
      }

      console.log('Submitting offer with media URLs:', mediaUrls)

      const result = await createProjectOffer(projectId, formDataObj)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Offer created successfully!')
        router.refresh()
        // Reset form
        setFormData({
          title: '',
          description: '',
          start_datetime: '',
          end_datetime: '',
          schedule_visibility: 'immediate',
          scheduled_at: '',
        })
        setMediaFiles([])
        setMediaPreviews([])
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || 'Failed to create offer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Project Offer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              Description *
            </label>
            <textarea
              className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Start Datetime *
              </label>
              <Input
                type="datetime-local"
                value={formData.start_datetime}
                onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                End Datetime *
              </label>
              <Input
                type="datetime-local"
                value={formData.end_datetime}
                onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                required
              />
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
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                      {preview.startsWith('data:image') ? (
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <video 
                          src={preview} 
                          controls
                          className="h-full w-full object-contain"
                          preload="metadata"
                        >
                          Your browser does not support the video tag.
                        </video>
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

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Schedule Visibility *
            </label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              value={formData.schedule_visibility}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  schedule_visibility: e.target.value as 'immediate' | 'scheduled' | 'hidden',
                })
              }
              required
            >
              <option value="immediate">Immediate (Visible Now)</option>
              <option value="scheduled">Scheduled (Visible at specific time)</option>
              <option value="hidden">Hidden (Not visible to public)</option>
            </select>
          </div>

          {formData.schedule_visibility === 'scheduled' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Scheduled At *
              </label>
              <Input
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                required
              />
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Offer'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
