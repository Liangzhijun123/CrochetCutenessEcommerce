import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function OrdersLoading() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>

      <Separator className="my-6" />

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center space-x-2">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="mt-1 h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
