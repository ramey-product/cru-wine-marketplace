'use client'

interface OnboardingProgressProps {
  currentStep: number
  totalSteps: number
  onStepClick: (step: number) => void
}

export function OnboardingProgress({
  currentStep,
  totalSteps,
  onStepClick,
}: OnboardingProgressProps) {
  return (
    <div className="flex items-center gap-2" role="navigation" aria-label="Onboarding progress">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1
        const isCurrent = step === currentStep
        const isCompleted = step < currentStep

        return (
          <button
            key={step}
            type="button"
            onClick={() => {
              if (isCompleted) onStepClick(step)
            }}
            disabled={!isCompleted}
            aria-label={`Step ${step}${isCurrent ? ' (current)' : isCompleted ? ' (completed)' : ''}`}
            aria-current={isCurrent ? 'step' : undefined}
            className={`flex items-center justify-center h-6 w-6 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              isCompleted ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <span
              className={`block h-2 w-2 rounded-full transition-colors ${
                isCurrent
                  ? 'bg-primary'
                  : isCompleted
                    ? 'bg-primary/50 group-hover:bg-primary/70'
                    : 'bg-muted'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
