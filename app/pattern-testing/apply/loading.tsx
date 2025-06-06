import { Skeleton } from "@/components/ui/skeleton"

export default function PatternTestingApplicationLoading() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <Skeleton className="h-10 w-96 mx-auto mb-4" />
        <Skeleton className="h-6 w-[600px] mx-auto mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
              <Skeleton className="h-8 w-8 mb-2" />
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-96 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
