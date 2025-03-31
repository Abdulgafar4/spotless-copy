"use client"

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";

interface CalendarComponentProps {
  onSelectDate: (date: string) => void; // callback to handle the selected date
}

export function CalendarComponent({ onSelectDate }: CalendarComponentProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const handleDateSelect = (selectedDate: Date) => {
    setDate(selectedDate); // Update local state with the selected date
    onSelectDate(selectedDate.toISOString().split('T')[0]); // Send the selected date in 'YYYY-MM-DD' format
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Select a Date</h3>
      </div>

      <Calendar
        mode="single" // Single date selection mode
        selected={date} // Bind the selected date to the state
        onSelect={handleDateSelect} // Handler to manage date selection
        className="rounded-md border shadow" // Tailwind classes for styling
      />
    </div>
  );
}
