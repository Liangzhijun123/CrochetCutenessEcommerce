import { Truck, RotateCcw, ShieldCheck, Monitor, MapPin, Package, Lock, FileText } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface ShippingInfoProps {
  productType?: string
  sellerCountry?: string | null
  sellerState?: string | null
}

export default function ShippingInfo({ productType, sellerCountry, sellerState }: ShippingInfoProps) {
  const isPdf = productType === "pdf_pattern"
  const isPlushie = productType === "plushie"
  const isBoth = productType === "both"

  const sellerLocation = [sellerState, sellerCountry].filter(Boolean).join(", ")

  return (
    <div>
      <h2 className="text-2xl font-semibold">Delivery & Returns</h2>
      <Separator className="my-4" />

      {/* PDF Pattern digital delivery info */}
      {(isPdf || isBoth) && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-4">
          <div className="flex items-start gap-3">
            <Monitor className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-800">
                {isBoth ? "PDF Pattern — Digital Delivery" : "Digital Delivery"}
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                After purchase, the PDF pattern will be available in your <strong>Profile → Digital Library</strong>. You can view it directly on this website at any time.
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <Lock className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-blue-600">
                  Password-protected by the seller. The access password will be provided in your digital library.
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-blue-600">
                  PDFs can only be viewed on this website and cannot be downloaded to prevent unauthorized sharing.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plushie physical shipping info */}
      {(isPlushie || isBoth) && (
        <div className="rounded-lg border border-pink-200 bg-pink-50 p-4 mb-4">
          <div className="flex items-start gap-3">
            <Package className="h-6 w-6 text-pink-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-pink-800">
                {isBoth ? "Plushie — Physical Shipping" : "Physical Shipping"}
              </h3>
              {sellerLocation && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <MapPin className="h-4 w-4 text-pink-500" />
                  <span className="text-sm text-pink-700">Ships from: <strong>{sellerLocation}</strong></span>
                </div>
              )}
              <p className="text-sm text-pink-700 mt-1.5">
                Estimated delivery: <strong>5-14 business days</strong> depending on your location.
              </p>
              <p className="text-xs text-pink-600 mt-2">
                Each plushie is handcrafted, so please allow 3-5 business days for creation before shipping.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(isPlushie || isBoth || !productType) && (
          <div className="flex flex-col items-center rounded-lg border p-4 text-center">
            <Truck className="mb-2 h-8 w-8 text-rose-500" />
            <h3 className="font-medium">Free Shipping</h3>
            <p className="text-sm text-muted-foreground">On plushie orders over $50</p>
          </div>
        )}
        {(isPdf || isBoth) && (
          <div className="flex flex-col items-center rounded-lg border p-4 text-center">
            <Lock className="mb-2 h-8 w-8 text-rose-500" />
            <h3 className="font-medium">Secure PDF Access</h3>
            <p className="text-sm text-muted-foreground">Password-protected digital patterns</p>
          </div>
        )}
        <div className="flex flex-col items-center rounded-lg border p-4 text-center">
          <RotateCcw className="mb-2 h-8 w-8 text-rose-500" />
          <h3 className="font-medium">{isPdf ? "Digital Returns" : isPlushie ? "Condition-Based Returns" : "Returns Available"}</h3>
          <p className="text-sm text-muted-foreground">
            {isPdf ? "Refund available for digital products" : isPlushie ? "Accepted if plushie is in good condition" : "See return policy below"}
          </p>
        </div>
        <div className="flex flex-col items-center rounded-lg border p-4 text-center">
          <ShieldCheck className="mb-2 h-8 w-8 text-rose-500" />
          <h3 className="font-medium">Secure Payments</h3>
          <p className="text-sm text-muted-foreground">SSL encrypted checkout</p>
        </div>
      </div>

      <Accordion type="single" collapsible className="mt-6">
        {/* Only show shipping accordion for physical products */}
        {(isPlushie || isBoth || !productType) && (
          <AccordionItem value="shipping">
            <AccordionTrigger>Shipping Information</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Processing Time:</strong> Each item is made to order and requires 3-5 business days to create
                  before shipping.
                </p>
                <p>
                  <strong>Shipping Methods:</strong>
                </p>
                <ul className="list-inside list-disc pl-4 space-y-1">
                  <li>Standard Shipping (5-7 business days): $4.99</li>
                  <li>Express Shipping (2-3 business days): $9.99</li>
                  <li>Free Standard Shipping on orders over $50</li>
                </ul>
                <p>
                  <strong>International Shipping:</strong> We ship worldwide. International orders may take 2-4 weeks to
                  arrive depending on customs processing in your country.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Digital delivery info accordion */}
        {(isPdf || isBoth) && (
          <AccordionItem value="digital-delivery">
            <AccordionTrigger>Digital Delivery Information</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>How to access your PDF pattern:</strong>
                </p>
                <ul className="list-inside list-disc pl-4 space-y-1">
                  <li>After purchase, go to <strong>Profile → Digital Library</strong></li>
                  <li>Your purchased PDF patterns will appear there with the access password</li>
                  <li>Click &quot;View Pattern&quot; and enter the password provided by the seller</li>
                  <li>PDFs are viewable only on this website for security — no downloads</li>
                </ul>
                <p className="mt-2">
                  <strong>Password Protection:</strong> Each PDF pattern is protected with a unique password set by the seller.
                  This prevents unauthorized sharing and protects the seller&apos;s intellectual property.
                </p>
                <p>
                  <strong>Important:</strong> Do not share your access password with others. If the seller detects misuse,
                  they may change the password, which will lock your access until a new password is provided.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="returns">
          <AccordionTrigger>Returns & Exchanges</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 text-sm">
              {/* Digital product returns */}
              {(isPdf || isBoth) && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                  <p className="font-semibold text-blue-800 mb-1">Digital Products (PDF Patterns)</p>
                  <p className="text-sm text-blue-700 mb-2">
                    After purchase, the PDF pattern will be available in your <strong>Profile → Digital Library</strong>. You can view it directly on this website at any time. PDFs are password-protected by the seller and can only be viewed on this website — no downloads allowed.
                  </p>
                  <ul className="list-inside list-disc pl-4 space-y-1 text-blue-700">
                    <li>Refunds are available within 7 days of purchase if you have not accessed the pattern</li>
                    <li>If the PDF is defective or incorrect, a full refund or replacement will be provided</li>
                    <li>Once the pattern has been viewed, refunds are handled on a case-by-case basis</li>
                    <li>Contact support@crochetcuteness.com with your order number for assistance</li>
                  </ul>
                </div>
              )}

              {/* Physical product returns */}
              {(isPlushie || isBoth) && (
                <div className="rounded-md border border-pink-200 bg-pink-50 p-3">
                  <p className="font-semibold text-pink-800 mb-1">Physical Products (Plushies)</p>
                  <ul className="list-inside list-disc pl-4 space-y-1 text-pink-700">
                    <li>Returns accepted within 14 days of delivery</li>
                    <li><strong>Plushie must be in good condition</strong> — unused, unwashed, and with original packaging</li>
                    <li>Damaged or defective items will be replaced or refunded at no extra cost</li>
                    <li>Custom or personalized plushies cannot be returned unless damaged</li>
                    <li>Buyer is responsible for return shipping costs</li>
                    <li>Refunds will be issued to the original payment method within 5-7 business days</li>
                  </ul>
                </div>
              )}

              {/* Fallback for unknown product type */}
              {!isPdf && !isPlushie && !isBoth && (
                <div>
                  <p>
                    We want you to be completely satisfied with your purchase. If for any reason you&apos;re not happy with your
                    order, we accept returns within 14 days of delivery.
                  </p>
                  <ul className="list-inside list-disc pl-4 space-y-1 mt-2">
                    <li>Items must be in original condition, unused and unwashed</li>
                    <li>Buyer is responsible for return shipping costs</li>
                    <li>Refunds will be issued to the original payment method</li>
                  </ul>
                </div>
              )}

              <p className="mt-2">
                To initiate a return or exchange, please contact us at support@crochetcuteness.com with your order
                number and reason for return.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
