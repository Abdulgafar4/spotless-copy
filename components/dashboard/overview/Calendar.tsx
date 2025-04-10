"use client"

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";

interface CalendarComponentProps {
  onSelectDate: (date: string) => void;
}

export function CalendarComponent({ onSelectDate }: CalendarComponentProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      onSelectDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full h-full flex items-center justify-center rounded-md border shadow bg-white p-2">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          className="w-full h-full"
          required={false}
          classNames={{
            month: "w-full space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex w-full justify-between",
            head_cell: "text-slate-500 w-10 text-center text-xs font-normal",
            row: "flex w-full justify-between mt-2",
            cell: "text-center p-0 relative w-10 h-10",
            day: "h-10 w-10 p-0 flex items-center justify-center font-normal rounded-md",
            day_selected: "!bg-green-500 !text-white hover:!bg-green-600",
            day_today: "bg-slate-100 text-slate-900",
            day_outside: "text-slate-500 opacity-50",
            day_disabled: "text-slate-500 opacity-50",
            day_hidden: "invisible",
          }}
        />
      </div>
    </div>
  );
}