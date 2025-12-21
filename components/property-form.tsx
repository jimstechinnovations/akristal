'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { uploadFile, getPublicUrl } from '@/lib/storage'
import type { Database, PropertyType } from '@/types/database'
import { getErrorMessage } from '@/lib/utils'
import { ImagePreviewModal } from '@/components/image-preview-modal'

type PropertyRow = Database['public']['Tables']['properties']['Row']
type PropertyInsert = Database['public']['Tables']['properties']['Insert']
type PropertyUpdate = Database['public']['Tables']['properties']['Update']

type PropertyFormState = {
  title: string
  description: string
  property_type: PropertyType
  address: string
  city: string
  district: string
  province: string
  country: string
  latitude: string
  longitude: string
  price: string
  currency: string
  size_sqm: string
  bedrooms: string
  bathrooms: string
  parking_spaces: string
  year_built: string
  amenities: string
  features: string
  document_urls: string
  video_urls: string
}

function parseList(value: string): string[] {
  if (!value.trim()) return []
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function PropertyForm({ property }: { property?: PropertyRow }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<PropertyFormState>({
    title: property?.title || '',
    description: property?.description || '',
    property_type: property?.property_type || 'residential',
    address: property?.address || '',
    city: property?.city || '',
    district: property?.district || '',
    province: property?.province || '',
    country: property?.country || '',
    latitude: property?.latitude != null ? String(property.latitude) : '',
    longitude: property?.longitude != null ? String(property.longitude) : '',
    price: property ? String(property.price) : '',
    currency: property?.currency || 'RWF',
    size_sqm: property?.size_sqm != null ? String(property.size_sqm) : '',
    bedrooms: property?.bedrooms != null ? String(property.bedrooms) : '',
    bathrooms: property?.bathrooms != null ? String(property.bathrooms) : '',
    parking_spaces: property?.parking_spaces != null ? String(property.parking_spaces) : '',
    year_built: property?.year_built != null ? String(property.year_built) : '',
    amenities: Array.isArray(property?.amenities)
      ? (property!.amenities as string[]).join(', ')
      : '',
    features: Array.isArray(property?.features)
      ? (property!.features as string[]).join(', ')
      : '',
    document_urls: property?.document_urls?.join('\n') || '',
    video_urls: property?.video_urls?.join('\n') || '',
  })
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>(property?.image_urls || [])
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [documents, setDocuments] = useState<File[]>([])
  const [documentPreviews, setDocumentPreviews] = useState<
    Array<{ name: string; url: string; isFile: boolean }>
  >(
    property?.document_urls?.map((url) => ({
      name: url.split('/').pop() || 'Document',
      url,
      isFile: false,
    })) || []
  )
  const [videos, setVideos] = useState<File[]>([])
  const [videoPreviews, setVideoPreviews] = useState<Array<{ name: string; url: string; isFile: boolean }>>(
    property?.video_urls?.map((url) => ({
      name: url.split('/').pop() || 'Video',
      url,
      isFile: false,
    })) || []
  )
  const supabase = createClient()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages((prev) => [...prev, ...files])

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setDocuments((prev) => [...prev, ...files])
    files.forEach((file) => {
      setDocumentPreviews((prev) => [...prev, { name: file.name, url: '', isFile: true }])
    })
  }

  const removeDocument = (index: number) => {
    const preview = documentPreviews[index]
    if (preview.isFile) {
      // Find the corresponding file index (count only file previews before this index)
      const fileIndex = documentPreviews
        .slice(0, index)
        .filter((p) => p.isFile).length
      setDocuments((prev) => prev.filter((_, i) => i !== fileIndex))
    }
    setDocumentPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setVideos((prev) => [...prev, ...files])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setVideoPreviews((prev) => [...prev, { name: file.name, url: e.target?.result as string, isFile: true }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeVideo = (index: number) => {
    const preview = videoPreviews[index]
    if (preview.isFile) {
      // Find the corresponding file index (count only file previews before this index)
      const fileIndex = videoPreviews
        .slice(0, index)
        .filter((p) => p.isFile).length
      setVideos((prev) => prev.filter((_, i) => i !== fileIndex))
    }
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please sign in to create a listing')
        return
      }

      // Fetch profile to determine role (seller / agent / admin)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const profileRole =
        (profile as Pick<Database['public']['Tables']['profiles']['Row'], 'role'> | null)?.role ||
        'buyer'
      const isAdmin = profileRole === 'admin'

      // Upload images
      const imageUrls: string[] = []
      for (const image of images) {
        const fileName = `${user.id}/${Date.now()}-${image.name}`
        const { data, error } = await uploadFile('property-images', fileName, image)
        if (error) throw error
        if (data) {
          const url = getPublicUrl('property-images', data.path)
          imageUrls.push(url)
        }
      }

      const allImageUrls = [
        ...imagePreviews.filter((url) => !url.startsWith('data:')),
        ...imageUrls,
      ]

      // Upload documents
      const documentUrls: string[] = []
      for (const document of documents) {
        const fileName = `${user.id}/${Date.now()}-${document.name}`
        const { data, error } = await uploadFile('property-documents', fileName, document)
        if (error) throw error
        if (data) {
          const url = getPublicUrl('property-documents', data.path)
          documentUrls.push(url)
        }
      }
      // Combine uploaded documents with existing document URLs
      const existingDocumentUrls = documentPreviews
        .filter((preview) => !preview.isFile && preview.url)
        .map((preview) => preview.url)
      const allDocumentUrls = [...existingDocumentUrls, ...documentUrls]

      // Upload videos
      const videoUrls: string[] = []
      for (const video of videos) {
        const fileName = `${user.id}/${Date.now()}-${video.name}`
        const { data, error } = await uploadFile('property-videos', fileName, video)
        if (error) throw error
        if (data) {
          const url = getPublicUrl('property-videos', data.path)
          videoUrls.push(url)
        }
      }
      // Combine uploaded videos with existing video URLs
      const existingVideoUrls = videoPreviews
        .filter((preview) => !preview.isFile && preview.url)
        .map((preview) => preview.url)
      const allVideoUrls = [...existingVideoUrls, ...videoUrls]

      // Shared parsed fields
      const latitude = formData.latitude ? parseFloat(formData.latitude) : null
      const longitude = formData.longitude ? parseFloat(formData.longitude) : null
      const amenities = parseList(formData.amenities)
      const features = parseList(formData.features)

      if (property) {
        // For updates, don't change listing status here.
        // Admin approval/rejection is managed via dedicated admin actions.
        const updateData: PropertyUpdate = {
          seller_id: user.id,
          title: formData.title,
          description: formData.description,
          property_type: formData.property_type,
          address: formData.address,
          city: formData.city,
          district: formData.district || null,
          province: formData.province || null,
          country: formData.country || undefined,
          latitude,
          longitude,
          price: parseFloat(formData.price),
          currency: formData.currency || 'RWF',
          size_sqm: formData.size_sqm ? parseFloat(formData.size_sqm) : null,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : null,
          year_built: formData.year_built ? parseInt(formData.year_built) : null,
          cover_image_url: allImageUrls[0] || null,
          image_urls: allImageUrls,
          amenities,
          features,
          document_urls: allDocumentUrls,
          video_urls: allVideoUrls,
        }
        const { error } = await (supabase as any)
          .from('properties')
          .update(updateData)
          .eq('id', property.id)

        if (error) throw error
        toast.success('Property updated successfully!')
        
        // Redirect to the property detail page after update
        router.push(`/properties/${property.id}`)
        return
      } else {
        const insertData: PropertyInsert = {
          seller_id: user.id,
          title: formData.title,
          description: formData.description,
          property_type: formData.property_type,
          address: formData.address,
          city: formData.city,
          district: formData.district || null,
          province: formData.province || null,
          country: formData.country || undefined,
          latitude,
          longitude,
          price: parseFloat(formData.price),
          currency: formData.currency || 'RWF',
          size_sqm: formData.size_sqm ? parseFloat(formData.size_sqm) : null,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : null,
          year_built: formData.year_built ? parseInt(formData.year_built) : null,
          cover_image_url: allImageUrls[0] || null,
          image_urls: allImageUrls,
          amenities,
          features,
          document_urls: allDocumentUrls,
          video_urls: allVideoUrls,
          status: 'available',
          // Admin listings are auto-approved, others go to pending_approval
          listing_status: isAdmin ? 'approved' : 'pending_approval',
          approved_at: isAdmin ? new Date().toISOString() : null,
          approved_by: isAdmin ? user.id : null,
        }

        const { data: newProperty, error } = await (supabase as any)
          .from('properties')
          .insert(insertData)
          .select()
          .single()

        if (error) throw error
        toast.success(
          isAdmin
            ? 'Property created and automatically approved as an admin listing.'
            : 'Property created successfully! Awaiting admin approval.'
        )

        // Redirect to the property detail page
        if (newProperty?.id) {
          router.push(`/properties/${newProperty.id}`)
          return
        }
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || 'Failed to save property')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Description</label>
            <textarea
              className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Property Type *</label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              value={formData.property_type}
              onChange={(e) => setFormData({ ...formData, property_type: e.target.value as PropertyType })}
              required
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
              <option value="rental">Rental</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Price *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Currency *</label>
              <select
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                required
              >
                <option value="RWF">RWF - Rwandan Franc</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="NGN">NGN - Nigerian Naira</option>
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="ZAR">ZAR - South African Rand</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Size (m²)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.size_sqm}
                onChange={(e) => setFormData({ ...formData, size_sqm: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Address *</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">City *</label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">District</label>
              <Input
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Province / State</label>
              <Input
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Country</label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Latitude</label>
              <Input
                type="number"
                step="0.00000001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Longitude</label>
              <Input
                type="number"
                step="0.00000001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Bedrooms</label>
              <Input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Bathrooms</label>
              <Input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Parking Spaces</label>
              <Input
                type="number"
                value={formData.parking_spaces}
                onChange={(e) => setFormData({ ...formData, parking_spaces: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Year Built</label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              value={formData.year_built}
              onChange={(e) => setFormData({ ...formData, year_built: e.target.value })}
            >
              <option value="">Select Year</option>
              {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => {
                const year = new Date().getFullYear() - i
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Amenities (comma or line separated)
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              placeholder="Pool, Gym, Security, Parking"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Features (comma or line separated)
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder="Furnished, Gated Community, Sea View"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Documents (optional)
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
              onChange={handleDocumentChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
            />
            {documentPreviews.length > 0 && (
              <div className="mt-4 space-y-2">
                {documentPreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
                  >
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {preview.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="rounded-full bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Videos (optional)
            </label>
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={handleVideoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
            />
            {videoPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {videoPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                      <video
                        src={preview.url}
                        controls
                        className="h-full w-full object-contain"
                        preload="metadata"
                  >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-full rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        setPreviewIndex(index)
                        setIsPreviewOpen(true)
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 z-10"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : property ? 'Update Property' : 'Create Property'}
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
      {imagePreviews.length > 0 && (
        <ImagePreviewModal
          images={imagePreviews}
          currentIndex={previewIndex}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onNext={() => setPreviewIndex((prev) => (prev + 1) % imagePreviews.length)}
          onPrevious={() => setPreviewIndex((prev) => (prev - 1 + imagePreviews.length) % imagePreviews.length)}
        />
      )}
    </form>
  )
}
