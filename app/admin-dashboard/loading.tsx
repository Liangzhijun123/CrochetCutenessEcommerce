import { Loader2 } from "lucide-react"

export default function AdminDashboardLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
    </div>
  )
}
