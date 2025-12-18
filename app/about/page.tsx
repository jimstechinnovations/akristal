import { Card, CardContent } from '@/components/ui/card'
import { Building2, Users, MapPin, Award, Youtube, Instagram, Facebook, Twitter, Image, Music } from 'lucide-react'

export const metadata = {
  title: 'About Us - TheAkristalGroup',
  description:
    'Learn about Akristal Group Limited, a multifaceted leader in real estate, construction, home automation, financing, design, events, transport and consulting services.',
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          About Akristal Group Limited
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          A multifaceted leader in real estate and lifestyle services
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
              Who We Are
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              The Akristal Group Limited is a multifaceted leader in the real estate and lifestyle
              sectors. We specialize in comprehensive services including Real Estate Development,
              Construction, and cutting-edge Home Automation solutions that elevate modern living.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Our offerings extend to Local &amp; International Commercial and Residential
              Properties, flexible Lease/Rentals and in-house Financing. Beyond real estate, we
              provide Outsourcing Management, Interior &amp; Exterior Decorations, Architectural
              Design, Event Planning, Micro Pawn/Loan activities, Transport/Car Hire services, and
              Consulting Services for Manufacturing Companies, and we are proud owners of F.Y.L.
              Company (Fund Your Lifestyle).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
              Our Services
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              We offer a comprehensive portfolio of services across real estate, lifestyle, and
              support sectors:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
                <span>Real Estate Development</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
                <span>Construction</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
                <span>Home Automation</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
                <span>Local &amp; International Commercial Properties</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
                <span>Local &amp; International Residential Properties</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
                <span>Lease &amp; Rental Services</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
                <span>In-house Financing</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
                <span>Outsourcing Management</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
                <span>Interior &amp; Exterior Decorations</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
                <span>Architectural Design</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
                <span>Event Planning</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
                <span>Micro Pawn/Loan Activities</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
                <span>Transport &amp; Car Hire Services</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
                <span>Consulting Services for Manufacturing Companies</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
                <span>F.Y.L. Company (Fund Your Lifestyle)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Wide Property Selection
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Browse thousands of verified properties including homes, commercial spaces, land,
                and rental units across major cities and regions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Trusted Network
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with verified sellers, professional agents, and reliable buyers in a secure
                marketplace environment.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Prime Locations
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Properties in the best neighborhoods and prime locations across Africa and beyond.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Verified Listings
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                All properties go through our verification process to ensure accuracy, quality, and
                authenticity.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
              Our Values
            </h2>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">✓</span>
                <span>
                  <strong>Transparency:</strong> Clear, honest communication in all transactions
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">✓</span>
                <span>
                  <strong>Security:</strong> Protected data and secure payment processing
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">✓</span>
                <span>
                  <strong>Excellence:</strong> High-quality service and verified listings
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 dark:text-blue-400">✓</span>
                <span>
                  <strong>Customer Focus:</strong> Putting our users' needs first
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
              Contact Information
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:info@akristal.com"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  info@akristal.com
                </a>
              </p>
              <p>
                <strong>Phone:</strong>{' '}
                <a
                  href="tel:+250791900316"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  +250791900316
                </a>
              </p>
              <p>
                <strong>Address:</strong> KK 15 Rd, Kigali, Rwanda
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
              Follow Us
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Stay connected with us on social media for the latest property listings, real estate tips, and updates.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="http://www.youtube.com/@TheAkristalGroup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <Youtube className="h-5 w-5 text-red-600" />
                <span>YouTube</span>
              </a>
              <a
                href="http://instagram.com/theakristalgroup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <Instagram className="h-5 w-5 text-pink-600" />
                <span>Instagram</span>
              </a>
              <a
                href="http://tiktok.com/@akrystalgroupholdings"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <Music className="h-5 w-5 text-black dark:text-white" />
                <span>TikTok</span>
              </a>
              <a
                href="http://twitter.com/TheAkristalGrup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <Twitter className="h-5 w-5 text-blue-400" />
                <span>Twitter</span>
              </a>
              <a
                href="http://pinterest.com/theakristalgroup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <Image className="h-5 w-5 text-red-600" />
                <span>Pinterest</span>
              </a>
              <a
                href="http://facebook.com/theakristalgroup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                <span>Facebook</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

