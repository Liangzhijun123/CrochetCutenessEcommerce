import { Skeleton } from "@/components/ui/skeleton"

export default function OrderConfirmationLoading() {
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <Skeleton className="h-18 w-18 rounded-full" />
        </div>
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-5 w-96 mx-auto mt-2" />
      </div>

      <Skeleton className="h-64 w-full mb-8" />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>

      <Skeleton className="h-24 w-full mt-8" />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  )
}
