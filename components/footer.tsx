import Link from 'next/link'
import { Youtube, Instagram, Facebook, Twitter, Image, Music } from 'lucide-react'

export function Footer() {
  const socialLinks = [
    { name: 'YouTube', url: 'http://www.youtube.com/@TheAkristalGroup', icon: Youtube },
    { name: 'Instagram', url: 'http://instagram.com/theakristalgroup', icon: Instagram },
    { name: 'TikTok', url: 'http://tiktok.com/@akrystalgroupholdings', icon: Music },
    { name: 'Twitter', url: 'http://twitter.com/TheAkristalGrup', icon: Twitter },
    { name: 'Pinterest', url: 'http://pinterest.com/theakristalgroup', icon: Image },
    { name: 'Facebook', url: 'http://facebook.com/theakristalgroup', icon: Facebook },
  ]

  return (
    <footer className="border-t border-gray-200 bg-white dark:border-slate-800 dark:bg-[#0f172a]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">
              TheAkristalGroup
            </h3>
            <p className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-400">
              REDEFINING REAL ESTATE
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Your trusted real estate marketplace in Rwanda
            </p>
            <div className="mt-4 flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Company
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Legal
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Contact
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a
                  href="mailto:theakristalgroup@gmail.com"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  theakristalgroup@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:0791900316"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  0791900316
                </a>
              </li>
              <li>KK 15 Rd, Kigali, Rwanda</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-slate-800">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} TheAkristalGroup. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}


