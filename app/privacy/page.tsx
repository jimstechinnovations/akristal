import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Privacy Policy - TheAkristalGroup',
  description: 'Privacy policy for TheAkristalGroup real estate marketplace',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-gray max-w-none dark:prose-invert">
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                1. Introduction
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                TheAkristalGroup ("we," "our," or "us") is committed to protecting your
                privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
                your information when you use our real estate marketplace platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                2. Information We Collect
              </h2>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                2.1 Personal Information
              </h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600 dark:text-gray-400">
                <li>Name, email address, and phone number</li>
                <li>Account credentials and profile information</li>
                <li>Property listings and associated media</li>
                <li>Payment information and transaction details</li>
                <li>Messages and communications with other users</li>
              </ul>

              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                2.2 Automatically Collected Information
              </h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                We automatically collect certain information when you use our platform:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600 dark:text-gray-400">
                <li>Device information and IP address</li>
                <li>Browser type and version</li>
                <li>Usage data and interaction patterns</li>
                <li>Location data (with your permission)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                3. How We Use Your Information
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">We use collected information to:</p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600 dark:text-gray-400">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and manage payments</li>
                <li>Facilitate communication between users</li>
                <li>Send administrative information and updates</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                4. Information Sharing and Disclosure
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                We do not sell your personal information. We may share your information in the
                following circumstances:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600 dark:text-gray-400">
                <li>
                  <strong>With other users:</strong> Property listings and profile information are
                  visible to other platform users as intended
                </li>
                <li>
                  <strong>Service providers:</strong> We may share data with trusted third-party
                  service providers who assist in operating our platform
                </li>
                <li>
                  <strong>Legal requirements:</strong> We may disclose information if required by
                  law or to protect our rights and safety
                </li>
                <li>
                  <strong>Business transfers:</strong> Information may be transferred in connection
                  with a merger or acquisition
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                5. Data Security
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                We implement appropriate technical and organizational measures to protect your
                personal information against unauthorized access, alteration, disclosure, or
                destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                6. Your Rights
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">You have the right to:</p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600 dark:text-gray-400">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of certain communications</li>
                <li>Request a copy of your data</li>
                <li>Object to processing of your information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                7. Cookies and Tracking
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                We use cookies and similar tracking technologies to enhance your experience, analyze
                usage, and assist with marketing efforts. You can control cookie preferences through
                your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                8. Children's Privacy
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Our platform is not intended for users under the age of 18. We do not knowingly
                collect personal information from children.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                9. Changes to This Policy
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                We may update this Privacy Policy from time to time. We will notify you of any
                changes by posting the new policy on this page and updating the "Last updated"
                date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                10. Contact Us
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                If you have questions about this Privacy Policy, please contact us:
              </p>
              <div className="text-gray-600 dark:text-gray-400">
                <p>
                  <strong>Email:</strong> info@akristal.com, theakristalgroup@gmail.com
                </p>
                <p>
                  <strong>Phone:</strong> +250791900316
                </p>
                <p>
                  <strong>Address:</strong> KK 15 Rd, Kigali, Rwanda
                </p>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

