import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Liquor Inventory Manager',
  description: 'Our terms of service outline the rules and guidelines for using our platform.',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-8">Terms of Service</h1>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-6">
              <strong>Last updated:</strong> December 19, 2024
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-600 mb-4">
                By accessing and using Liquor Inventory Manager (&ldquo;Service&rdquo;), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">2. Description of Service</h2>
              <p className="text-slate-600 mb-4">
                Liquor Inventory Manager provides inventory management software for bars, restaurants, and hospitality businesses. 
                Our service includes:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Real-time inventory tracking and management</li>
                <li>Barcode scanning capabilities</li>
                <li>Automated order reporting</li>
                <li>Multi-location support</li>
                <li>Analytics and reporting tools</li>
                <li>Integration with accounting software</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">3. User Accounts</h2>
              <p className="text-slate-600 mb-4">
                To access certain features of the Service, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">4. Subscription and Billing</h2>
              <p className="text-slate-600 mb-4">
                Our Service operates on a subscription basis with the following terms:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Billing Cycle:</strong> Monthly or annual billing as selected</li>
                <li><strong>Payment:</strong> All payments are processed through Stripe</li>
                <li><strong>Automatic Renewal:</strong> Subscriptions automatically renew unless cancelled</li>
                <li><strong>Cancellation:</strong> You may cancel at any time through your account settings</li>
                <li><strong>Refunds:</strong> No refunds for partial months or unused periods</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">5. Acceptable Use</h2>
              <p className="text-slate-600 mb-4">You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the Service&apos;s operation</li>
                <li>Use the Service for illegal activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">6. Data and Privacy</h2>
              <p className="text-slate-600 mb-4">
                Your data privacy is important to us. Please review our Privacy Policy for details on how we collect, 
                use, and protect your information. By using our Service, you consent to our data practices as described in our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">7. Intellectual Property</h2>
              <p className="text-slate-600 mb-4">
                The Service and its original content, features, and functionality are owned by Liquor Inventory Manager 
                and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">8. Limitation of Liability</h2>
              <p className="text-slate-600 mb-4">
                In no event shall Liquor Inventory Manager be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
                resulting from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">9. Disclaimers</h2>
              <p className="text-slate-600 mb-4">
                The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind. We do not guarantee that:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>The Service will be uninterrupted or error-free</li>
                <li>Defects will be corrected</li>
                <li>The Service is free of viruses or other harmful components</li>
                <li>The results obtained from using the Service will be accurate or reliable</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">10. Termination</h2>
              <p className="text-slate-600 mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                for any reason, including breach of these Terms of Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">11. Changes to Terms</h2>
              <p className="text-slate-600 mb-4">
                We reserve the right to modify these terms at any time. We will notify users of any changes by:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Posting the new terms on this page</li>
                <li>Sending email notifications to registered users</li>
                <li>Displaying a notice in the application</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">12. Governing Law</h2>
              <p className="text-slate-600 mb-4">
                These Terms shall be interpreted and governed by the laws of [Your Jurisdiction], 
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">13. Contact Information</h2>
              <p className="text-slate-600 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-slate-700">
                  <strong>Email:</strong> legal@liquorinventory.com<br/>
                  <strong>Address:</strong> [Your Business Address]<br/>
                  <strong>Phone:</strong> [Your Phone Number]
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 