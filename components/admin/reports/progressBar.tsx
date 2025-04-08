"use client"

interface ProgressBarProps {
  value: number
  max: number
  className?: string
}

export function ProgressBar({ value, max, className }: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  // Determine color based on percentage
  let progressColor = "bg-green-500"
  if (percentage < 30) progressColor = "bg-red-500"
  else if (percentage < 70) progressColor = "bg-yellow-500"

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className={`h-2 rounded-full ${progressColor}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}