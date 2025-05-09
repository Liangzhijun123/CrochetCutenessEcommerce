import { Truck, RotateCcw, ShieldCheck } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ShippingInfo() {
  return (
    <div>
      <h2 className="text-2xl font-semibold">Shipping & Returns</h2>
      <Separator className="my-4" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col items-center rounded-lg border p-4 text-center">
          <Truck className="mb-2 h-8 w-8 text-rose-500" />
          <h3 className="font-medium">Free Shipping</h3>
          <p className="text-sm text-muted-foreground">On orders over $50</p>
        </div>
        <div className="flex flex-col items-center rounded-lg border p-4 text-center">
          <RotateCcw className="mb-2 h-8 w-8 text-rose-500" />
          <h3 className="font-medium">Easy Returns</h3>
          <p className="text-sm text-muted-foreground">14-day return policy</p>
        </div>
        <div className="flex flex-col items-center rounded-lg border p-4 text-center">
          <ShieldCheck className="mb-2 h-8 w-8 text-rose-500" />
          <h3 className="font-medium">Secure Payments</h3>
          <p className="text-sm text-muted-foreground">SSL encrypted checkout</p>
        </div>
      </div>

      <Accordion type="single" collapsible className="mt-6">
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
        <AccordionItem value="returns">
          <AccordionTrigger>Returns & Exchanges</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 text-sm">
              <p>
                We want you to be completely satisfied with your purchase. If for any reason you're not happy with your
                order, we accept returns within 14 days of delivery.
              </p>
              <p>
                <strong>Return Policy:</strong>
              </p>
              <ul className="list-inside list-disc pl-4 space-y-1">
                <li>Items must be in original condition, unused and unwashed</li>
                <li>Custom or personalized items cannot be returned unless damaged</li>
                <li>Buyer is responsible for return shipping costs</li>
                <li>Refunds will be issued to the original payment method</li>
              </ul>
              <p>
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
