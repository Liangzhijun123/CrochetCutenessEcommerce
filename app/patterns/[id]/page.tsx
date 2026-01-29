import PatternDetail from "@/components/patterns/pattern-detail"

interface PatternPageProps {
  params: {
    id: string
  }
}

export default function PatternPage({ params }: PatternPageProps) {
  return <PatternDetail patternId={params.id} />
}