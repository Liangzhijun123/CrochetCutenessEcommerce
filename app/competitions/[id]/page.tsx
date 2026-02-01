import { CompetitionDetail } from "@/components/competitions/competition-detail"

export default function CompetitionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <CompetitionDetail competitionId={params.id} />
    </div>
  )
}
