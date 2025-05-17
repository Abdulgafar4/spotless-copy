"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"

export interface Step {
  id: string
  title: string
  description?: string
}

interface FormStepIndicatorProps {
  steps: Step[]
  currentStep: number
  completedSteps: number[]
}

export function FormStepIndicator({ 
  steps, 
  currentStep, 
  completedSteps 
}: FormStepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index)
          const isActive = currentStep === index
          
          return (
            <div key={step.id} className="flex flex-col items-center relative flex-1">
              {/* Line between steps */}
              {index > 0 && (
                <div 
                  className={cn(
                    "absolute h-[3px] top-5 -left-1/2 w-full",
                    isCompleted || isActive ? "bg-green-500" : "bg-gray-200"
                  )}
                />
              )}
              
              {/* Step indicator */}
              <div 
                className={cn(
                  "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2",
                  isCompleted ? "bg-green-500 border-green-500" : 
                  isActive ? "bg-white border-green-500" : 
                  "bg-white border-gray-200"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                ) : (
                  <span className={cn(
                    "text-sm font-medium",
                    isActive ? "text-green-500" : "text-gray-400"
                  )}>
                    {index + 1}
                  </span>
                )}
              </div>
              
              {/* Step label */}
              <div className="mt-2 text-center">
                <p className={cn(
                  "text-xs font-medium",
                  isActive ? "text-green-700" :
                  isCompleted ? "text-green-600" : "text-gray-500"
                )}>
                  {step.title}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}