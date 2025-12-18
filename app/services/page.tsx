import { Card, CardContent } from '@/components/ui/card'
import { services } from '@/lib/services'

export const metadata = {
  title: 'Our Services - TheAkristalGroup',
  description:
    'Explore the full range of services offered by Akristal Group Limited across real estate, lifestyle, and support sectors.',
}

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          Our Services
        </h1>
        <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Akristal Group Limited provides end-to-end real estate, lifestyle and support services
          designed to help you live, work and invest better.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card
            key={service.title}
            className="overflow-hidden shadow-sm hover:shadow-md transition-all bg-white dark:bg-[#1e293b]"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={service.imageUrl}
                alt={service.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <CardContent className="p-4">
              <h2 className="font-semibold text-[#0d233e] dark:text-white mb-2 text-base sm:text-lg">
                {service.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

