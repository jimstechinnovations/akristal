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
  price: string
  size_sqm: string
  bedrooms: string
  bathrooms: string
  parking_spaces: string
  year_built: string
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
    price: property ? String(property.price) : '',
    size_sqm: property?.size_sqm != null ? String(property.size_sqm) : '',
    bedrooms: property?.bedrooms != null ? String(property.bedrooms) : '',
    bathrooms: property?.bathrooms != null ? String(property.bathrooms) : '',
    parking_spaces: property?.parking_spaces != null ? String(property.parking_spaces) : '',
    year_built: property?.year_built != null ? String(property.year_built) : '',
  })
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    property?.image_urls || []
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

      const allImageUrls = [...imagePreviews.filter((url) => !url.startsWith('data:')), ...imageUrls]

      if (property) {
        const updateData: PropertyUpdate = {
          seller_id: user.id,
          title: formData.title,
          description: formData.description,
          property_type: formData.property_type,
          address: formData.address,
          city: formData.city,
          district: formData.district || null,
          province: formData.province || null,
          price: parseFloat(formData.price),
          size_sqm: formData.size_sqm ? parseFloat(formData.size_sqm) : null,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : null,
          year_built: formData.year_built ? parseInt(formData.year_built) : null,
          cover_image_url: allImageUrls[0] || null,
          image_urls: allImageUrls,
          listing_status: 'pending_approval',
          status: 'available',
        }
        const { error } = await (supabase as any)
          .from('properties')
          .update(updateData)
          .eq('id', property.id)

        if (error) throw error
        toast.success('Property updated successfully!')
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
          price: parseFloat(formData.price),
          size_sqm: formData.size_sqm ? parseFloat(formData.size_sqm) : null,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : null,
          year_built: formData.year_built ? parseInt(formData.year_built) : null,
          cover_image_url: allImageUrls[0] || null,
          image_urls: allImageUrls,
          listing_status: 'pending_approval',
          status: 'available',
        }

        const { error } = await (supabase as any).from('properties').insert(insertData)

        if (error) throw error
        toast.success('Property created successfully! Awaiting admin approval.')
      }

      router.push('/seller/dashboard')
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Price (RWF) *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Province</label>
              <Input
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
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
                      className="h-24 w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white"
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
    </form>
  )
}


