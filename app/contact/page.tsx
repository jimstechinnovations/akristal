'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, Youtube, Instagram, Facebook, Twitter, Image, Music } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // In production, this would send to an API route
      // For now, we'll just show a success message
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Thank you for your message! We will get back to you soon.')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Contact Us</h1>
        <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          REDEFINING REAL ESTATE
        </p>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Get in touch with TheAkristalGroup
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Email</h3>
                    <a
                      href="mailto:theakristalgroup@gmail.com"
                      className="mt-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      theakristalgroup@gmail.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Phone</h3>
                    <a
                      href="tel:0791900316"
                      className="mt-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      0791900316
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Address</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      KK 15 Rd, Kigali, Rwanda
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Follow Us</h3>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Connect with us on social media
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <a
                    href="http://www.youtube.com/@TheAkristalGroup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-3 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5 text-red-600" />
                    <span className="mt-1 text-xs text-gray-600 dark:text-gray-400">YouTube</span>
                  </a>
                  <a
                    href="http://instagram.com/theakristalgroup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-3 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5 text-pink-600" />
                    <span className="mt-1 text-xs text-gray-600 dark:text-gray-400">Instagram</span>
                  </a>
                  <a
                    href="http://tiktok.com/@akrystalgroupholdings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-3 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    aria-label="TikTok"
                  >
                    <Music className="h-5 w-5 text-black dark:text-white" />
                    <span className="mt-1 text-xs text-gray-600 dark:text-gray-400">TikTok</span>
                  </a>
                  <a
                    href="http://twitter.com/TheAkristalGrup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-3 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5 text-blue-400" />
                    <span className="mt-1 text-xs text-gray-600 dark:text-gray-400">Twitter</span>
                  </a>
                  <a
                    href="http://pinterest.com/theakristalgroup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-3 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Pinterest"
                  >
                    <Image className="h-5 w-5 text-red-600" />
                    <span className="mt-1 text-xs text-gray-600 dark:text-gray-400">Pinterest</span>
                  </a>
                  <a
                    href="http://facebook.com/theakristalgroup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-3 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <span className="mt-1 text-xs text-gray-600 dark:text-gray-400">Facebook</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0791900316"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="What is this regarding?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
                    placeholder="Your message..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

