import { CompetitionList } from "@/components/competitions/competition-list"

export default function CompetitionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Competitions</h1>
          <p className="text-muted-foreground mt-2">
            Participate in community competitions and showcase your crochet skills
          </p>
        </div>

        <CompetitionList />
      </div>
    </div>
  )
}
