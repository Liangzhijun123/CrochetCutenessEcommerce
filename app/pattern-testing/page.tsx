import { Suspense } from "react"
import PatternTestingDashboard from "@/components/testing/pattern-testing-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Pattern Testing Community | Crochet Creations",
  description:
    "Join our pattern testing community. Test patterns, earn rewards, and help creators perfect their designs.",
}

export default function PatternTestingPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-rose-700">Pattern Testing Community</h1>
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <PatternTestingDashboard />
      </Suspense>
    </div>
  )
}
