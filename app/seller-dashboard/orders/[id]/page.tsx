import { Suspense } from "react"
import { SellerOrderDetail } from "@/components/seller/order-detail"
import { OrderDetailSkeleton } from "@/components/seller/order-detail-skeleton"

export default function SellerOrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<OrderDetailSkeleton />}>
        <SellerOrderDetail orderId={params.id} />
      </Suspense>
    </div>
  )
}
