import { Loader2 } from "lucide-react"

export default function ContactLoading() {
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        <p className="mt-2 text-muted-foreground">Loading contact page...</p>
      </div>
    </div>
  )
}
