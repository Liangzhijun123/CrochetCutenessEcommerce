import { Suspense } from "react"
import { SellerOrdersDashboard } from "@/components/seller/orders-dashboard"
import { OrdersTableSkeleton } from "@/components/seller/orders-table-skeleton"

export default function SellerOrdersPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Order Management</h1>

      <Suspense fallback={<OrdersTableSkeleton />}>
        <SellerOrdersDashboard />
      </Suspense>
    </div>
  )
}
