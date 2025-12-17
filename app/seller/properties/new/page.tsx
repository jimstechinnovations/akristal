import { requireRole } from '@/lib/auth'
import { PropertyForm } from '@/components/property-form'

export default async function NewPropertyPage() {
  await requireRole(['seller', 'agent', 'admin'])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Listing
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Add a new property to your listings
        </p>
      </div>
      <PropertyForm />
    </div>
  )
}


