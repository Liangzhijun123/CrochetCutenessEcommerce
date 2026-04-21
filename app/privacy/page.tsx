import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Privacy Policy | Crochet Cuteness",
  description: "Privacy Policy for Crochet Cuteness marketplace.",
}

export default function PrivacyPolicyPage() {
  const lastUpdated = "April 21, 2026"

  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
      </div>

      <Separator className="mb-8" />

      <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed">

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p>
            At <strong>Crochet Cuteness</strong>, we take your privacy seriously. This Privacy Policy explains how we
            collect, use, store, and protect your personal information when you use our marketplace platform — whether
            you are a buyer, seller, or visitor.
          </p>
          <p>
            By using Crochet Cuteness, you agree to the practices described in this Privacy Policy. Please read it
            carefully alongside our{" "}
            <Link href="/terms" className="text-rose-600 hover:underline">Terms of Service</Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Information We Collect</h2>

          <h3 className="text-base font-semibold mt-4">2.1 Account Information</h3>
          <p>When you create an account, we collect:</p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Full name and email address</li>
            <li>Password (stored securely — never in plain text)</li>
            <li>Account role (buyer or seller)</li>
            <li>Profile information you choose to add (avatar, bio)</li>
          </ul>

          <h3 className="text-base font-semibold mt-4">2.2 Purchase &amp; Transaction Data</h3>
          <p>When you make a purchase, we collect:</p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Order details (items purchased, quantities, prices)</li>
            <li>Shipping address for physical products (plushies)</li>
            <li>Payment information — processed securely by our payment provider; we do not store full card numbers</li>
            <li>Digital library access records (which PDF patterns you have purchased)</li>
          </ul>

          <h3 className="text-base font-semibold mt-4">2.3 Seller Data</h3>
          <p>If you register as a seller, we additionally collect:</p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Product listings (titles, descriptions, images, prices)</li>
            <li>Payout information (for processing seller earnings)</li>
            <li>Sales history and analytics</li>
          </ul>

          <h3 className="text-base font-semibold mt-4">2.4 Usage Data</h3>
          <p>We automatically collect certain data when you use our platform:</p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Browser type, device type, and operating system</li>
            <li>Pages visited, links clicked, and time spent on the platform</li>
            <li>IP address (used for security and fraud prevention)</li>
            <li>Referral source (how you found us)</li>
          </ul>

          <h3 className="text-base font-semibold mt-4">2.5 Communications</h3>
          <p>
            If you use our messaging system, competition features, pattern testing program, or contact support, we
            store the content of those communications to facilitate our services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Create and manage your account</li>
            <li>Process orders and deliver digital products to your Digital Library</li>
            <li>Facilitate shipping for physical products</li>
            <li>Send order confirmations, receipts, and transactional emails</li>
            <li>Enable seller-buyer communications through our messaging system</li>
            <li>Operate loyalty rewards, gamification, and competition features</li>
            <li>Detect and prevent fraud, abuse, and security threats</li>
            <li>Improve our platform based on usage patterns</li>
            <li>Send promotional emails and newsletters (only with your consent — you can opt out at any time)</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Data Storage &amp; Security</h2>
          <p>
            Your data is stored securely using <strong>Supabase</strong>, a trusted database and authentication
            platform. Supabase provides industry-standard encryption at rest and in transit (TLS/SSL).
          </p>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against
            unauthorized access, alteration, disclosure, or destruction. However, no system is 100% secure, and
            we cannot guarantee absolute security.
          </p>
          <p>
            Passwords are hashed using secure, industry-standard algorithms and are never stored or transmitted
            in plain text.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Sharing Your Information</h2>
          <p>We do not sell your personal information. We may share your data with:</p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>
              <strong>Sellers</strong> — when you purchase a physical item, your shipping address and name are shared
              with the Seller to fulfill the order. For digital purchases, only the transaction record is shared.
            </li>
            <li>
              <strong>Payment Processors</strong> — payment data is handled by our third-party payment provider.
              We share only what is required to process transactions.
            </li>
            <li>
              <strong>Service Providers</strong> — infrastructure, email delivery, and analytics providers who
              process data on our behalf and are bound by confidentiality agreements.
            </li>
            <li>
              <strong>Legal Authorities</strong> — when required by law, court order, or to protect the rights and
              safety of our users or the public.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Cookies &amp; Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to maintain your session (keeping you logged in),
            remember preferences, and understand how users interact with the platform.
          </p>
          <p>
            You can control cookie settings through your browser. Disabling certain cookies may affect platform
            functionality (e.g., staying logged in, shopping cart).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Digital Library &amp; Purchased Patterns</h2>
          <p>
            PDF patterns you purchase are associated with your account and stored in your Digital Library. This
            record is tied to your user ID and email. If you delete your account, access to previously purchased
            patterns may be lost — please download your patterns before deleting your account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Your Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
            <li><strong>Correction</strong> — ask us to correct inaccurate or incomplete data.</li>
            <li><strong>Deletion</strong> — request deletion of your account and personal data.</li>
            <li><strong>Opt-out</strong> — unsubscribe from marketing emails at any time via the unsubscribe link in any email.</li>
            <li><strong>Data Portability</strong> — request your data in a machine-readable format.</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us through our{" "}
            <Link href="/contact" className="text-rose-600 hover:underline">Contact page</Link>.
            We will respond within 30 days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">9. Children&apos;s Privacy</h2>
          <p>
            Crochet Cuteness is not directed to children under 13. We do not knowingly collect personal information
            from children under 13. If you believe a child has provided us personal data, please contact us and we
            will delete it promptly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">10. Third-Party Links</h2>
          <p>
            Our platform may contain links to third-party websites (e.g., social media, external resources). We are
            not responsible for the privacy practices of those sites. We encourage you to review their privacy
            policies before providing any personal data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes by email
            or a prominent notice on the platform. The &quot;Last updated&quot; date at the top of this page reflects
            the most recent revision.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">12. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy or how we handle your data, please reach
            out through our{" "}
            <Link href="/contact" className="text-rose-600 hover:underline">
              Contact page
            </Link>
            .
          </p>
        </section>

      </div>

      <Separator className="my-8" />

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <Link href="/terms" className="text-rose-600 hover:underline">Terms of Service</Link>
        <Link href="/" className="hover:underline">Back to Home</Link>
      </div>
    </div>
  )
}
