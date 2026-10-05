import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { LegalHeader, Prose } from '@/components/ui/prose'

export const metadata: Metadata = pageMetadata({
  title: 'Privacy policy',
  description: 'How The Akristal Group collects, uses and protects your personal information.',
  path: '/privacy',
})

// Update this date whenever the text below changes. Have the final text reviewed by Akristal's lawyer.
const UPDATED = '2026-10-04'

export default function Page() {
  return (
    <div className="page-x py-12 sm:py-16">
      <LegalHeader title="Privacy policy" updated={UPDATED} />
      <Prose className="mt-10">

            <section>
              <h2>
                1. Introduction
              </h2>
              <p>
                The Akristal Group (“” “” or “”) is committed to protecting your
                privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
                your information when you use the Akristal real estate platform.
              </p>
            </section>

            <section>
              <h2>
                2. Information We Collect
              </h2>
              <h3>
                2.1 Personal Information
              </h3>
              <p>
                We collect information that you provide directly to us, including:
              </p>
              <ul>
                <li>Name, email address, and phone number</li>
                <li>Account credentials and profile information</li>
                <li>Property listings and associated media</li>
                <li>Payment information and transaction details</li>
                <li>Messages and communications with other users</li>
              </ul>

              <h3>
                2.2 Automatically Collected Information
              </h3>
              <p>
                We automatically collect certain information when you use the Akristal platform:
              </p>
              <ul>
                <li>Device information and IP address</li>
                <li>Browser type and version</li>
                <li>Usage data and interaction patterns</li>
                <li>Location data (with your permission)</li>
              </ul>
            </section>

            <section>
              <h2>
                3. How We Use Your Information
              </h2>
              <p>We use collected information to:</p>
              <ul>
                <li>Provide, maintain, and improve Akristal services</li>
                <li>Process transactions and manage payments</li>
                <li>Facilitate communication between users</li>
                <li>Send administrative information and updates</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2>
                4. Information Sharing and Disclosure
              </h2>
              <p>
                We do not sell your personal information. We may share your information in the
                following circumstances:
              </p>
              <ul>
                <li>
                  <strong>With other users:</strong> Property listings and profile information are
                  visible to other platform users as intended
                </li>
                <li>
                  <strong>Service providers:</strong> We may share data with trusted third-party
                  service providers who assist in operating the Akristal platform
                </li>
                <li>
                  <strong>Legal requirements:</strong> We may disclose information if required by
                  law or to protect the rights and safety of Akristal and its users
                </li>
                <li>
                  <strong>Business transfers:</strong> Information may be transferred in connection
                  with a merger or acquisition
                </li>
              </ul>
            </section>

            <section>
              <h2>
                5. Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational measures to protect your
                personal information against unauthorized access, alteration, disclosure, or
                destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2>
                6. Your Rights
              </h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of certain communications</li>
                <li>Request a copy of your data</li>
                <li>Object to processing of your information</li>
              </ul>
            </section>

            <section>
              <h2>
                7. Cookies and Tracking
              </h2>
              <p>
                We use cookies and similar tracking technologies to enhance your experience, analyze
                usage, and assist with marketing efforts. You can control cookie preferences through
                your browser settings.
              </p>
            </section>

            <section>
              <h2>
                8. Children’s Privacy
              </h2>
              <p>
                The Akristal platform is not intended for users under the age of 18. We do not knowingly
                collect personal information from children.
              </p>
            </section>

            <section>
              <h2>
                9. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any
                changes by posting the new policy on this page and updating the “”
                date.
              </p>
            </section>

            <section>
              <h2>
                10. Contact Us
              </h2>
              <p>
                If you have questions about this Privacy Policy, please contact us:
              </p>
              <div>
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
            <section>
              <h2>Forms, WhatsApp and saved homes</h2>
              <p>
                When you request a viewing, a valuation, a consultation, a Pay Small Small plan or a mortgage call-back, or when you
                message an agent, we store the details you enter so the Akristal team can reply. When you write an agent review, we store your
                name, rating and comments; your phone or email is never shown. When you apply to become an agent, we store your
                application to assess it.
              </p>
              <p>
                Links marked WhatsApp open WhatsApp with a message ready for you to send. Anything you send there is handled under
                WhatsApp&apos;s own terms. Homes you save with the heart are stored only in your browser on this device.
              </p>
              <p>
                To ask what we hold about you, or to have it corrected or deleted, email <a href="mailto:info@akristal.com">info@akristal.com</a>.
              </p>
            </section>

      </Prose>
    </div>
  )
}
