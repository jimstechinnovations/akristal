import { Card, CardContent } from '@/components/ui/card'
import { Building2, Briefcase, Home, TrendingUp } from 'lucide-react'

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all bg-white dark:bg-[#1e293b]">
          <div className="relative h-[120px] w-full bg-gradient-to-br from-[#0d233e] to-[#1e6b52]">
            <Building2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-white opacity-50" />
          </div>
          <CardContent className="p-4">
            <h2 className="font-semibold text-[#0d233e] dark:text-white mb-2 text-base sm:text-lg">
              Real Estate Development &amp; Construction
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              End-to-end development and construction for residential and commercial projects,
              from planning and design to delivery.
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all bg-white dark:bg-[#1e293b]">
          <div className="relative h-[120px] w-full bg-gradient-to-br from-[#1e6b52] to-[#0d233e]">
            <Briefcase className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-white opacity-50" />
          </div>
          <CardContent className="p-4">
            <h2 className="font-semibold text-[#0d233e] dark:text-white mb-2 text-base sm:text-lg">
              Properties, Lease &amp; Rentals
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Local &amp; international commercial and residential properties with flexible lease,
              rental and in-house financing options tailored to your needs.
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all bg-white dark:bg-[#1e293b]">
          <div className="relative h-[120px] w-full bg-gradient-to-br from-[#c89b3c] to-[#0d233e]">
            <Home className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-white opacity-50" />
          </div>
          <CardContent className="p-4">
            <h2 className="font-semibold text-[#0d233e] dark:text-white mb-2 text-base sm:text-lg">
              Home Automation &amp; Lifestyle
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Smart home automation and lifestyle solutions powered by F.Y.L. (Fund Your Lifestyle),
              helping you upgrade how you live every day.
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all bg-white dark:bg-[#1e293b]">
          <div className="relative h-[120px] w-full bg-gradient-to-br from-[#0d233e] to-[#c89b3c]">
            <TrendingUp className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-white opacity-50" />
          </div>
          <CardContent className="p-4">
            <h2 className="font-semibold text-[#0d233e] dark:text-white mb-2 text-base sm:text-lg">
              Design, Events &amp; Support Services
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Interior &amp; exterior decorations, architectural design, event planning, outsourcing,
              micro pawn/loan, transport &amp; car hire, and consulting for manufacturing companies.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

