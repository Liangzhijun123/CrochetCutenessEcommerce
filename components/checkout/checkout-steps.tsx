import { CheckCircle2 } from "lucide-react"

interface CheckoutStepsProps {
  currentStep: "shipping" | "payment" | "review" | "confirmation"
}

export default function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const steps = [
    { id: "shipping", label: "Shipping" },
    { id: "payment", label: "Payment" },
    { id: "review", label: "Review" },
  ]

  const getCurrentStepIndex = () => {
    return steps.findIndex((step) => step.id === currentStep)
  }

  return (
    <div className="flex items-center justify-center">
      <ol className="flex w-full max-w-3xl items-center">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = getCurrentStepIndex() > index

          return (
            <li key={step.id} className="flex w-full items-center">
              <div className="flex w-full flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium ${
                    isActive
                      ? "border-rose-500 bg-rose-500 text-white"
                      : isCompleted
                        ? "border-rose-500 bg-rose-500 text-white"
                        : "border-gray-300 bg-white text-gray-500"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                </div>
                <span
                  className={`mt-2 text-xs ${
                    isActive ? "font-medium text-rose-500" : isCompleted ? "font-medium text-rose-500" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className={`h-0.5 w-full ${isCompleted ? "bg-rose-500" : "bg-gray-300"}`}></div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
