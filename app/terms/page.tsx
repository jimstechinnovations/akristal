import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Terms & Conditions - TheAkristalGroup',
  description: 'Terms and conditions for using TheAkristalGroup real estate marketplace',
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Terms & Conditions
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-gray max-w-none dark:prose-invert">
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                1. Acceptance of Terms
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                By accessing and using the Akristal Group Limited real estate marketplace platform
                ("the Platform"), you accept and agree to be bound by these Terms and Conditions.
                If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                2. Description of Service
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                TheAkristalGroup provides an online marketplace platform that connects buyers,
                sellers, and agents for real estate transactions. We facilitate connections but are
                not a party to any transactions between users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                3. User Accounts
              </h2>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                3.1 Registration
              </h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                To use certain features, you must register for an account. You agree to:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600 dark:text-gray-400">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information as necessary</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                3.2 User Roles
              </h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Users may register as Buyers, Sellers, Agents, or Admins. Each role has specific
                permissions and responsibilities as defined in our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                4. Property Listings
              </h2>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                4.1 Listing Requirements
              </h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Sellers and agents agree to:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600 dark:text-gray-400">
                <li>Provide accurate and complete property information</li>
                <li>Use genuine, high-quality images</li>
                <li>Disclose any material defects or issues</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>

              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                4.2 Approval Process
              </h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                All property listings are subject to review and approval by our admin team. We
                reserve the right to reject, suspend, or remove listings that violate our policies
                or applicable laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                5. Prohibited Activities
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">You agree not to:</p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600 dark:text-gray-400">
                <li>Post false, misleading, or fraudulent information</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use automated systems to access the platform</li>
                <li>Interfere with platform security or functionality</li>
                <li>Engage in any form of spam or unsolicited communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                6. Payments and Transactions
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                All transactions between users are their sole responsibility. TheAkristalGroup
                Limited facilitates connections but is not responsible for:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600 dark:text-gray-400">
                <li>Payment disputes between users</li>
                <li>Property condition or accuracy of listings</li>
                <li>Legal compliance of transactions</li>
                <li>Completion of sales or rental agreements</li>
              </ul>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Users are encouraged to conduct due diligence and use appropriate legal and
                financial advisors.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                7. Intellectual Property
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                The Platform and its content are owned by TheAkristalGroup and protected by
                copyright and other intellectual property laws. You may not reproduce, distribute,
                or create derivative works without our written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                8. Limitation of Liability
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                To the maximum extent permitted by law, TheAkristalGroup shall not be liable
                for any indirect, incidental, special, consequential, or punitive damages arising
                from your use of the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                9. Indemnification
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                You agree to indemnify and hold harmless TheAkristalGroup from any claims,
                damages, losses, or expenses arising from your use of the Platform or violation of
                these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                10. Termination
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                We reserve the right to suspend or terminate your account at any time for violation
                of these Terms or any other reason we deem necessary. You may also terminate your
                account at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                11. Governing Law
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                These Terms shall be governed by and construed in accordance with the laws of
                Rwanda. Any disputes shall be subject to the exclusive jurisdiction of the courts
                of Rwanda.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                12. Changes to Terms
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                We may modify these Terms at any time. Continued use of the Platform after changes
                constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                13. Contact Information
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                For questions about these Terms, please contact us:
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

