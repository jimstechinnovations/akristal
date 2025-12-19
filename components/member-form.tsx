'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createMember, updateMember } from '@/app/actions/members'
import { uploadFile, getPublicUrl } from '@/lib/storage'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/utils'
import { X, Upload } from 'lucide-react'

type MemberRow = {
  id: string
  name: string
  role: string
  image_url: string | null
  details: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export function MemberForm({ member }: { member?: MemberRow }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: member?.name || '',
    role: member?.role || '',
    details: member?.details || '',
    display_order: member?.display_order?.toString() || '0',
    is_active: member?.is_active !== undefined ? member.is_active.toString() : 'true',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(member?.image_url || null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = member?.image_url || ''

      // Upload new image if a file was selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `members/${fileName}`

        const { data: uploadData, error: uploadError } = await uploadFile('team', filePath, imageFile)

        if (uploadError) {
          toast.error(`Failed to upload image: ${getErrorMessage(uploadError)}`)
          setLoading(false)
          return
        }

        if (uploadData?.path) {
          imageUrl = getPublicUrl('team', uploadData.path)
        }
      } else if (!imagePreview) {
        // If no image file and no preview, clear the image URL
        imageUrl = ''
      }

      const formDataObj = new FormData()
      formDataObj.append('name', formData.name)
      formDataObj.append('role', formData.role)
      formDataObj.append('image_url', imageUrl || '')
      formDataObj.append('details', formData.details)
      formDataObj.append('display_order', formData.display_order)
      formDataObj.append('is_active', formData.is_active)

      let result
      if (member) {
        result = await updateMember(member.id, formDataObj)
      } else {
        result = await createMember(formDataObj)
      }

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(member ? 'Member updated successfully!' : 'Member created successfully!')
        router.push('/admin/members')
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || 'Failed to save member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Member Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Role *
            </label>
            <Input
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Member Image
            </label>
            {imagePreview ? (
              <div className="relative mb-2">
                <div className="relative h-48 w-full overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
                  <Image
                    src={imagePreview}
                    alt="Member preview"
                    fill
                    className="object-contain object-top"
                    unoptimized
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-white dark:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="mb-2">
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Details *
            </label>
            <textarea
              className="flex min-h-[200px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Display Order
              </label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Status *
              </label>
              <select
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                value={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value })}
                required
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : member ? 'Update Member' : 'Create Member'}
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
