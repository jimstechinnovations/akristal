import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpCircle, MessageSquare, FileText, Mail } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Support & Help Center - TheAkristalGroup',
  description: 'Get help and support for using TheAkristalGroup real estate marketplace',
}

const faqs = [
  {
    question: 'How do I create a property listing?',
    answer:
      'Sign up as a seller or agent, then navigate to your dashboard and click "Create New Listing". Fill in all the required details, upload images, and submit for approval.',
  },
  {
    question: 'How long does property approval take?',
    answer:
      'Property listings are typically reviewed within 24-48 hours. You will receive an email notification once your listing is approved or if any changes are needed.',
  },
  {
    question: 'How do I contact a seller?',
    answer:
      'Browse properties and click on any listing to view details. Use the "Contact Seller" button to send a message or inquiry directly to the seller.',
  },
  {
    question: 'What payment methods are accepted?',
    answer:
      'Currently, we support bank transfers. You can attach your bank statement as proof of payment. Additional payment methods (cards, mobile money) are coming soon.',
  },
  {
    question: 'How do I save favorite properties?',
    answer:
      'While browsing properties, click the heart icon on any property card to save it to your favorites. Access your favorites from your buyer dashboard.',
  },
  {
    question: 'Can I edit my property listing after submission?',
    answer:
      'Yes, sellers can edit their own listings from the seller dashboard. Note that significant changes may require re-approval from our admin team.',
  },
  {
    question: 'How do I verify my account?',
    answer:
      'Account verification is handled by our admin team. Complete your profile with accurate information to expedite the verification process.',
  },
  {
    question: 'What should I do if I encounter a problem?',
    answer:
      'Contact our support team via email at info@akristal.com or call us at +250791900316. We aim to respond within 24 hours.',
  },
]

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Find answers to common questions or contact our support team
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Need personalized assistance? Reach out to our support team.
            </p>
            <Link href="/contact">
              <Button>Contact Us</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Email Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Send us an email and we'll respond within 24 hours.
            </p>
            <a href="mailto:info@akristal.com">
              <Button variant="outline">info@akristal.com</Button>
            </a>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HelpCircle className="mr-2 h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-0 dark:border-gray-700">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{faq.question}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Additional Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Getting Started</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                New to TheAkristalGroup? Learn how to create an account, browse properties, and make your
                first inquiry.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                For Sellers & Agents
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Learn how to create compelling listings, manage inquiries, and maximize your
                property visibility.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">For Buyers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover how to search effectively, save favorites, contact sellers, and complete
                transactions securely.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

