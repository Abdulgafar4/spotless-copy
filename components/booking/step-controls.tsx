// components/booking/step-controls.tsx
"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

interface StepControlsProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => Promise<boolean> | boolean
  isSubmitting?: boolean
  isLastStep?: boolean
}

export function StepControls({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  isSubmitting = false,
  isLastStep = false
}: StepControlsProps) {
  const handleNext = async () => {
    const canContinue = await onNext()
    return canContinue
  }

  return (
    <div className="flex justify-between mt-8">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0 || isSubmitting}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <Button
        type="button"
        onClick={handleNext}
        disabled={isSubmitting}
        className={`flex items-center gap-1 ${isLastStep ? 'bg-[#10b981] hover:bg-[#0d9668]' : ''}`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : isLastStep ? (
          "Complete Booking"
        ) : (
          <>
            Continue
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  )
}