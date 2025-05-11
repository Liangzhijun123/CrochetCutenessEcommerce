import { Skeleton } from "@/components/ui/skeleton"

export default function PatternTestingLoading() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="h-12 w-64 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[600px] w-full" />
    </div>
  )
}
