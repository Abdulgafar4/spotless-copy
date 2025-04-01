"use client"

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";

interface CalendarComponentProps {
  onSelectDate: (date: string) => void;
}

export function CalendarComponent({ onSelectDate }: CalendarComponentProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const handleDateSelect = (selectedDate: Date) => {
    setDate(selectedDate); 
    onSelectDate(selectedDate.toISOString().split('T')[0]); 
  };

  return (
    <div>
      <Calendar
        mode="single"
        selected={date} 
        onSelect={handleDateSelect} 
        className="rounded-md border shadow" 
      />
    </div>
  );
}
