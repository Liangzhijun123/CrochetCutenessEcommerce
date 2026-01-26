import PatternTestingApplicationForm from "@/components/pattern-testing-application-form"

export const metadata = {
  title: "Apply for Pattern Testing Program | Crochet Creations",
  description:
    "Join our pattern testing community and help designers perfect their crochet patterns while earning rewards.",
}

export default function PatternTestingApplicationPage() {
  return (
    <div className="container mx-auto py-10">
      <PatternTestingApplicationForm />
    </div>
  )
}
