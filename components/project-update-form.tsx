'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createProjectUpdate } from '@/app/actions/projects'
import { uploadFile, getPublicUrl } from '@/lib/storage'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/utils'
import { X } from 'lucide-react'
import Image from 'next/image'

export function ProjectUpdateForm({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState('')
  const [scheduleVisibility, setScheduleVisibility] = useState<'immediate' | 'scheduled' | 'hidden'>('immediate')
  const [scheduledAt, setScheduledAt] = useState('')
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
        toast.error('Please sign in to create an update')
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
      formDataObj.append('description', description)
      formDataObj.append('media_urls', JSON.stringify(mediaUrls))
      formDataObj.append('schedule_visibility', scheduleVisibility)
      if (scheduleVisibility === 'scheduled' && scheduledAt) {
        formDataObj.append('scheduled_at', scheduledAt)
      }

      console.log('Submitting update with media URLs:', mediaUrls)

      const result = await createProjectUpdate(projectId, formDataObj)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Update created successfully!')
        router.refresh()
        // Reset form
        setDescription('')
        setScheduleVisibility('immediate')
        setScheduledAt('')
        setMediaFiles([])
        setMediaPreviews([])
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || 'Failed to create update')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Project Update</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Description *
            </label>
            <textarea
              className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Share an update about this project..."
            />
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
              <div className="mt-4 grid grid-cols-4 gap-4">
                {mediaPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    {preview.startsWith('data:image') ? (
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-full rounded-lg object-cover"
                      />
                    ) : (
                      <video src={preview} className="h-24 w-full rounded-lg object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white"
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
              value={scheduleVisibility}
              onChange={(e) =>
                setScheduleVisibility(e.target.value as 'immediate' | 'scheduled' | 'hidden')
              }
              required
            >
              <option value="immediate">Immediate (Visible Now)</option>
              <option value="scheduled">Scheduled (Visible at specific time)</option>
              <option value="hidden">Hidden (Not visible to public)</option>
            </select>
          </div>

          {scheduleVisibility === 'scheduled' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Scheduled At *
              </label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Update'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
