import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Terms of Service | Crochet Cuteness",
  description: "Terms of Service for Crochet Cuteness marketplace.",
}

export default function TermsOfServicePage() {
  const lastUpdated = "April 21, 2026"

  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
      </div>

      <Separator className="mb-8" />

      <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed">

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p>
            Welcome to <strong>Crochet Cuteness</strong>, a handmade marketplace connecting crochet creators and
            enthusiasts. By creating an account, browsing, purchasing, or selling on our platform, you agree to be
            bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use
            our services.
          </p>
          <p>
            These Terms apply to all users of the platform, including buyers, sellers, and visitors.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Description of Service</h2>
          <p>
            Crochet Cuteness is an online marketplace where independent crochet creators (&quot;Sellers&quot;) can list
            and sell their handmade products, including:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li><strong>Plushies &amp; Physical Items</strong> — handmade crocheted stuffed animals and physical goods shipped to buyers.</li>
            <li><strong>PDF Patterns</strong> — downloadable digital crochet patterns delivered to your Digital Library upon purchase.</li>
          </ul>
          <p>
            We provide the platform infrastructure, payment processing facilitation, seller tools, digital delivery,
            and community features. We are not the seller or manufacturer of any listed item.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Account Registration</h2>
          <p>
            To buy or sell on Crochet Cuteness, you must register for an account. You agree to:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Provide accurate, current, and complete information during registration.</li>
            <li>Maintain the security of your password and accept responsibility for all activity under your account.</li>
            <li>Notify us immediately of any unauthorized use of your account.</li>
            <li>Be at least 13 years old to create an account. Users under 18 require parental consent.</li>
          </ul>
          <p>
            Accounts are non-transferable. We reserve the right to suspend or terminate accounts that violate these Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Buyer Terms</h2>
          <h3 className="text-base font-semibold mt-4">4.1 Purchases</h3>
          <p>
            When you place an order, you are entering into a direct transaction with the Seller. Crochet Cuteness
            facilitates the transaction but is not a party to the sale.
          </p>
          <h3 className="text-base font-semibold mt-4">4.2 Digital Products (PDF Patterns)</h3>
          <p>
            PDF patterns are delivered immediately to your <strong>Digital Library</strong> in your profile upon
            completed payment (or upon confirmation for free patterns). Patterns are protected with a seller-provided
            password. You may not redistribute, resell, or share the pattern files. Each purchase grants a
            non-exclusive, personal-use license only.
          </p>
          <h3 className="text-base font-semibold mt-4">4.3 Physical Products (Plushies)</h3>
          <p>
            Physical items require a valid shipping address at checkout. Shipping times and costs are set by the
            individual Seller. Crochet Cuteness is not responsible for shipping delays or lost packages after
            handoff to the carrier.
          </p>
          <h3 className="text-base font-semibold mt-4">4.4 Refunds &amp; Disputes</h3>
          <p>
            Due to the handmade nature of physical products, all sales are subject to the individual Seller&apos;s
            refund policy. Digital PDF patterns are non-refundable once accessed. If you believe an item was
            misrepresented, contact our support team within 14 days of purchase.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Seller Terms</h2>
          <h3 className="text-base font-semibold mt-4">5.1 Seller Eligibility</h3>
          <p>
            To become a Seller, you must apply through our seller onboarding process and be approved. You agree that
            all products you list are your own original creations or you hold the rights to sell them.
          </p>
          <h3 className="text-base font-semibold mt-4">5.2 Prohibited Listings</h3>
          <p>You may not list items that:</p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Infringe on any third-party copyright, trademark, or intellectual property (e.g., unlicensed Disney, Pokemon, or other branded characters).</li>
            <li>Are not handmade or crochet-related.</li>
            <li>Contain offensive, hateful, or illegal content.</li>
            <li>Misrepresent the nature, quality, or condition of the item.</li>
          </ul>
          <h3 className="text-base font-semibold mt-4">5.3 Fees &amp; Payments</h3>
          <p>
            Sellers receive payouts for completed orders minus any applicable platform fees and payment processing
            fees. Fee structures are communicated in the Seller Dashboard. Crochet Cuteness reserves the right to
            update fee structures with 30 days notice.
          </p>
          <h3 className="text-base font-semibold mt-4">5.4 PDF Pattern Passwords</h3>
          <p>
            Sellers who list PDF patterns are responsible for providing a valid PDF password. Buyers will receive
            access to the PDF along with the password in their Digital Library. Sellers are responsible for ensuring
            the password correctly unlocks their pattern.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Community Features</h2>
          <p>
            Crochet Cuteness includes community features such as reviews, a messaging system, competitions, and
            pattern testing programs. When participating, you agree to:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Post only honest, relevant, and respectful content.</li>
            <li>Not harass, threaten, or abuse other users.</li>
            <li>Not post spam, advertisements, or irrelevant links.</li>
            <li>Respect intellectual property in all content you share.</li>
          </ul>
          <p>
            We reserve the right to remove content or suspend users who violate community guidelines.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Gamification &amp; Loyalty Program</h2>
          <p>
            Crochet Cuteness offers a loyalty points and gamification system. Points, badges, and rewards have no
            cash value and cannot be transferred or redeemed for cash. We reserve the right to modify, suspend, or
            terminate the loyalty program at any time without notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Intellectual Property</h2>
          <p>
            The Crochet Cuteness platform, logo, and all site content (excluding Seller listings) are owned by
            Crochet Cuteness and protected by copyright law. You may not copy, reproduce, or distribute any part of
            the platform without our express written permission.
          </p>
          <p>
            Sellers retain ownership of their original designs and patterns. By listing on our platform, Sellers
            grant Crochet Cuteness a non-exclusive license to display and promote their products on the platform
            and in marketing materials.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Crochet Cuteness shall not be liable for any indirect,
            incidental, special, or consequential damages arising from your use of the platform, including but not
            limited to loss of data, loss of profits, or disputes between buyers and sellers.
          </p>
          <p>
            Our total liability to you for any claim shall not exceed the amount you paid to Crochet Cuteness in
            the 12 months preceding the claim.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">10. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account at any time, with or without notice, for
            violations of these Terms or for any conduct we deem harmful to the platform or its users. You may
            delete your account at any time through your Profile settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">11. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify users of material changes via email or a
            prominent notice on the site. Continued use of the platform after changes constitutes your acceptance
            of the updated Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">12. Governing Law</h2>
          <p>
            These Terms are governed by and construed in accordance with applicable law. Any disputes arising from
            these Terms shall be resolved through binding arbitration or in a court of competent jurisdiction.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">13. Contact Us</h2>
          <p>
            If you have questions about these Terms, please contact us through our{" "}
            <Link href="/contact" className="text-rose-600 hover:underline">
              Contact page
            </Link>
            .
          </p>
        </section>

      </div>

      <Separator className="my-8" />

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <Link href="/privacy" className="text-rose-600 hover:underline">Privacy Policy</Link>
        <Link href="/" className="hover:underline">Back to Home</Link>
      </div>
    </div>
  )
}
