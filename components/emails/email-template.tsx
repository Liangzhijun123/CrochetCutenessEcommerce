import { formatCurrency, formatDate } from "@/lib/utils"
import type { EmailTemplate } from "@/lib/email-service"

interface EmailTemplateProps {
  template: EmailTemplate
  data: Record<string, any>
}

export default function EmailTemplatePreview({ template, data }: EmailTemplateProps) {
  const { order, user, items, shippingAddress, trackingNumber, estimatedDelivery } = data
  const orderId = data.orderId || order?.id || "Unknown"
  const shortOrderId = typeof orderId === "string" ? orderId.slice(0, 8) : orderId
  const orderDate = data.orderDate || order?.createdAt || new Date().toISOString()

  // Common header for all email templates
  const renderHeader = () => (
    <div className="bg-primary text-primary-foreground p-6 text-center">
      <h1 className="text-2xl font-bold">Crochet Crafts</h1>
    </div>
  )

  // Common footer for all email templates
  const renderFooter = () => (
    <div className="bg-muted p-6 text-center text-sm text-muted-foreground">
      <p>© {new Date().getFullYear()} Crochet Crafts. All rights reserved.</p>
      <p className="mt-2">123 Yarn Street, Crochet City, CC 12345</p>
      <div className="mt-4 flex justify-center space-x-4">
        <a href="#" className="text-primary hover:underline">
          Privacy Policy
        </a>
        <a href="#" className="text-primary hover:underline">
          Terms of Service
        </a>
        <a href="#" className="text-primary hover:underline">
          Contact Us
        </a>
      </div>
    </div>
  )

  // Order summary section
  const renderOrderSummary = () => {
    const orderItems = items || order?.items || []

    return (
      <div className="mt-6 border rounded-md overflow-hidden">
        <div className="bg-muted px-4 py-2 font-medium">Order Summary</div>
        <div className="p-4">
          <table className="w-full">
            <thead className="text-left text-sm text-muted-foreground">
              <tr>
                <th className="pb-2">Item</th>
                <th className="pb-2">Qty</th>
                <th className="pb-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item: any) => (
                <tr key={item.productId} className="border-t">
                  <td className="py-2">{item.name}</td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="text-sm">
              <tr className="border-t">
                <td colSpan={2} className="pt-2 text-muted-foreground">
                  Subtotal
                </td>
                <td className="pt-2 text-right">{formatCurrency(order?.subtotal || 0)}</td>
              </tr>
              <tr>
                <td colSpan={2} className="pt-1 text-muted-foreground">
                  Shipping
                </td>
                <td className="pt-1 text-right">{formatCurrency(order?.shipping || 0)}</td>
              </tr>
              <tr>
                <td colSpan={2} className="pt-1 text-muted-foreground">
                  Tax
                </td>
                <td className="pt-1 text-right">{formatCurrency(order?.tax || 0)}</td>
              </tr>
              <tr className="font-medium">
                <td colSpan={2} className="pt-2 text-muted-foreground">
                  Total
                </td>
                <td className="pt-2 text-right">{formatCurrency(order?.total || 0)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )
  }

  // Shipping address section
  const renderShippingAddress = () => {
    const address = shippingAddress || order?.shippingAddress || {}

    return (
      <div className="mt-6 border rounded-md overflow-hidden">
        <div className="bg-muted px-4 py-2 font-medium">Shipping Address</div>
        <div className="p-4">
          <p>{address.fullName}</p>
          <p>{address.addressLine1}</p>
          {address.addressLine2 && <p>{address.addressLine2}</p>}
          <p>
            {address.city}, {address.state} {address.postalCode}
          </p>
          <p>{address.country}</p>
          <p>{address.phone}</p>
        </div>
      </div>
    )
  }

  // Tracking information section
  const renderTrackingInfo = () => {
    if (!trackingNumber) return null

    return (
      <div className="mt-6 border rounded-md overflow-hidden">
        <div className="bg-muted px-4 py-2 font-medium">Tracking Information</div>
        <div className="p-4">
          <p>
            <span className="text-muted-foreground">Tracking Number: </span>
            <span className="font-medium">{trackingNumber}</span>
          </p>
          {estimatedDelivery && (
            <p className="mt-2">
              <span className="text-muted-foreground">Estimated Delivery: </span>
              <span className="font-medium">{formatDate(estimatedDelivery)}</span>
            </p>
          )}
          <div className="mt-4">
            <a href={`/orders/track/${orderId}`} className="text-primary hover:underline">
              Track Your Order
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Render different content based on the template type
  const renderContent = () => {
    switch (template) {
      case "order-confirmation":
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold">Thank You for Your Order!</h2>
            <p className="mt-2">Hi {user?.name || "there"},</p>
            <p className="mt-4">
              Thank you for shopping with Crochet Crafts! We've received your order and are getting it ready to ship.
              We'll notify you when your order has been shipped.
            </p>

            <div className="mt-6 bg-muted p-4 rounded-md">
              <p className="font-medium">Order #{shortOrderId}</p>
              <p className="text-sm text-muted-foreground">Placed on {formatDate(orderDate)}</p>
            </div>

            {renderOrderSummary()}
            {renderShippingAddress()}

            <div className="mt-6">
              <p>
                If you have any questions about your order, please contact our customer service team at{" "}
                <a href="mailto:support@crochetcrafts.com" className="text-primary hover:underline">
                  support@crochetcrafts.com
                </a>
              </p>
            </div>
          </div>
        )

      case "order-processing":
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold">Your Order is Being Processed</h2>
            <p className="mt-2">Hi {user?.name || "there"},</p>
            <p className="mt-4">
              We're excited to let you know that we've started processing your order! Our team is carefully preparing
              your items for shipment.
            </p>

            <div className="mt-6 bg-muted p-4 rounded-md">
              <p className="font-medium">Order #{shortOrderId}</p>
              <p className="text-sm text-muted-foreground">Placed on {formatDate(orderDate)}</p>
            </div>

            {renderOrderSummary()}

            <div className="mt-6">
              <p>
                You'll receive another email with tracking information once your order ships. If you have any questions,
                please contact our customer service team.
              </p>
            </div>
          </div>
        )

      case "order-shipped":
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold">Your Order Has Shipped!</h2>
            <p className="mt-2">Hi {user?.name || "there"},</p>
            <p className="mt-4">
              Great news! Your order is on its way to you. You can track your package using the information below.
            </p>

            <div className="mt-6 bg-muted p-4 rounded-md">
              <p className="font-medium">Order #{shortOrderId}</p>
              <p className="text-sm text-muted-foreground">Placed on {formatDate(orderDate)}</p>
            </div>

            {renderTrackingInfo()}
            {renderOrderSummary()}
            {renderShippingAddress()}

            <div className="mt-6">
              <p>
                We hope you enjoy your handcrafted crochet items! If you have any questions about your shipment, please
                don't hesitate to contact us.
              </p>
            </div>
          </div>
        )

      case "order-delivered":
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold">Your Order Has Been Delivered</h2>
            <p className="mt-2">Hi {user?.name || "there"},</p>
            <p className="mt-4">Your order has been delivered! We hope you love your handcrafted crochet items.</p>

            <div className="mt-6 bg-muted p-4 rounded-md">
              <p className="font-medium">Order #{shortOrderId}</p>
              <p className="text-sm text-muted-foreground">Placed on {formatDate(orderDate)}</p>
              <p className="text-sm text-muted-foreground">Delivered on {formatDate(new Date())}</p>
            </div>

            {renderOrderSummary()}

            <div className="mt-6">
              <p>We'd love to hear what you think! Please take a moment to leave a review for your items.</p>
              <div className="mt-4">
                <a
                  href={`/profile/orders/${orderId}`}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md inline-block"
                >
                  Review Your Purchase
                </a>
              </div>
            </div>
          </div>
        )

      case "order-cancelled":
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold">Your Order Has Been Cancelled</h2>
            <p className="mt-2">Hi {user?.name || "there"},</p>
            <p className="mt-4">
              We're confirming that your order has been cancelled as requested. If you were charged for this order, you
              will receive a refund within 3-5 business days.
            </p>

            <div className="mt-6 bg-muted p-4 rounded-md">
              <p className="font-medium">Order #{shortOrderId}</p>
              <p className="text-sm text-muted-foreground">Placed on {formatDate(orderDate)}</p>
              <p className="text-sm text-muted-foreground">Cancelled on {formatDate(new Date())}</p>
            </div>

            {renderOrderSummary()}

            <div className="mt-6">
              <p>
                We're sorry to see you cancel your order. If you have any feedback or questions, please don't hesitate
                to contact our customer service team.
              </p>
            </div>
          </div>
        )

      default:
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold">Order Update</h2>
            <p className="mt-2">Hi {user?.name || "there"},</p>
            <p className="mt-4">This is an update regarding your recent order with Crochet Crafts.</p>

            <div className="mt-6 bg-muted p-4 rounded-md">
              <p className="font-medium">Order #{shortOrderId}</p>
              <p className="text-sm text-muted-foreground">Placed on {formatDate(orderDate)}</p>
            </div>

            {renderOrderSummary()}

            <div className="mt-6">
              <p>If you have any questions about your order, please contact our customer service team.</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden max-w-3xl mx-auto bg-white">
      {renderHeader()}
      {renderContent()}
      {renderFooter()}
    </div>
  )
}
