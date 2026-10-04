import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { LegalHeader, Prose } from '@/components/ui/prose'

export const metadata: Metadata = pageMetadata({
  title: 'Terms and conditions',
  description: 'The terms that apply when you use the Akristal website and services.',
  path: '/terms',
})

// Update this date whenever the text below changes. Have the final text reviewed by Akristal's lawyer.
const UPDATED = '2026-10-04'

export default function Page() {
  return (
    <div className="page-x py-12 sm:py-16">
      <LegalHeader title="Terms and conditions" updated={UPDATED} />
      <Prose className="mt-10">

            <section>
              <h2>
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using the Akristal Group Limited real estate marketplace platform
                (“”), you accept and agree to be bound by these Terms and Conditions.
                If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2>
                2. Description of Service
              </h2>
              <p>
                The Akristal Group provides an online marketplace platform that connects buyers,
                sellers, and agents for real estate transactions. We facilitate connections but are
                not a party to any transactions between users.
              </p>
            </section>

            <section>
              <h2>
                3. User Accounts
              </h2>
              <h3>
                3.1 Registration
              </h3>
              <p>
                To use certain features, you must register for an account. You agree to:
              </p>
              <ul>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information as necessary</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3>
                3.2 User Roles
              </h3>
              <p>
                Users may register as Buyers, Sellers, Agents, or Admins. Each role has specific
                permissions and responsibilities as defined in our platform.
              </p>
            </section>

            <section>
              <h2>
                4. Property Listings
              </h2>
              <h3>
                4.1 Listing Requirements
              </h3>
              <p>
                Sellers and agents agree to:
              </p>
              <ul>
                <li>Provide accurate and complete property information</li>
                <li>Use genuine, high-quality images</li>
                <li>Disclose any material defects or issues</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>

              <h3>
                4.2 Approval Process
              </h3>
              <p>
                All property listings are subject to review and approval by our admin team. We
                reserve the right to reject, suspend, or remove listings that violate our policies
                or applicable laws.
              </p>
            </section>

            <section>
              <h2>
                5. Prohibited Activities
              </h2>
              <p>You agree not to:</p>
              <ul>
                <li>Post false, misleading, or fraudulent information</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use automated systems to access the platform</li>
                <li>Interfere with platform security or functionality</li>
                <li>Engage in any form of spam or unsolicited communications</li>
              </ul>
            </section>

            <section>
              <h2>
                6. Payments and Transactions
              </h2>
              <p>
                All transactions between users are their sole responsibility. The Akristal Group
                Limited facilitates connections but is not responsible for:
              </p>
              <ul>
                <li>Payment disputes between users</li>
                <li>Property condition or accuracy of listings</li>
                <li>Legal compliance of transactions</li>
                <li>Completion of sales or rental agreements</li>
              </ul>
              <p>
                Users are encouraged to conduct due diligence and use appropriate legal and
                financial advisors.
              </p>
            </section>

            <section>
              <h2>
                7. Intellectual Property
              </h2>
              <p>
                The Platform and its content are owned by The Akristal Group and protected by
                copyright and other intellectual property laws. You may not reproduce, distribute,
                or create derivative works without our written permission.
              </p>
            </section>

            <section>
              <h2>
                8. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, The Akristal Group shall not be liable
                for any indirect, incidental, special, consequential, or punitive damages arising
                from your use of the Platform.
              </p>
            </section>

            <section>
              <h2>
                9. Indemnification
              </h2>
              <p>
                You agree to indemnify and hold harmless The Akristal Group from any claims,
                damages, losses, or expenses arising from your use of the Platform or violation of
                these Terms.
              </p>
            </section>

            <section>
              <h2>
                10. Termination
              </h2>
              <p>
                We reserve the right to suspend or terminate your account at any time for violation
                of these Terms or any other reason we deem necessary. You may also terminate your
                account at any time.
              </p>
            </section>

            <section>
              <h2>
                11. Governing Law
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of
                Rwanda. Any disputes shall be subject to the exclusive jurisdiction of the courts
                of Rwanda.
              </p>
            </section>

            <section>
              <h2>
                12. Changes to Terms
              </h2>
              <p>
                We may modify these Terms at any time. Continued use of the Platform after changes
                constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2>
                13. Contact Information
              </h2>
              <p>
                For questions about these Terms, please contact us:
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
      </Prose>
    </div>
  )
}
