import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatLongDate = (dateString: string) => {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  } as const;


  const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
  const date = new Date(Date.UTC(year, month - 1, day + 1));

  return date.toLocaleDateString('en-CA', options);
};
export const formatShortDate = (dateString: string) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  } as const;
  const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
  const date = new Date(Date.UTC(year, month - 1, day + 1));

  return date.toLocaleDateString('en-CA', options);
};

export const formatTime = (dateString: string) => {
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  } as const;
  return new Date(dateString).toLocaleTimeString('en-CA', options);
};

/**
 * Calculates cancellation fee percentage based on days until appointment
 * @param appointmentDate The date of the appointment (string in ISO format)
 * @returns Object containing fee percentage and notification message
 */
export function calculateCancellationFee(appointmentDate: string) {
  const appointment = new Date(appointmentDate);
  const today = new Date();
  
  // Reset hours to get accurate day calculation
  appointment.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = appointment.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24) + 1);
  
  // Determine fee based on days until appointment
  if (diffDays <= 1) {
    // Same day or next day
    return {
      feePercentage: 30,
      message: "Same-day or next-day cancellations incur a 30% fee of the service cost."
    };
  } else if (diffDays <= 2) {
    // 2 days notice
    return {
      feePercentage: 25,
      message: "Cancellations with 2 days notice incur a 25% fee of the service cost."
    };
  } else if (diffDays <= 3) {
    // 3 days notice
    return {
      feePercentage: 20,
      message: "Cancellations with 3 days notice incur a 20% fee of the service cost."
    };
  } else {
    // More than 3 days notice
    return {
      feePercentage: 0,
      message: "No cancellation fee applies when canceling with more than 3 days notice."
    };
  }
}

