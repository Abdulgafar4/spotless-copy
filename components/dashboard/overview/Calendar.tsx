"use client"

import * as React from "react";
import { Calendar } from 'primereact/calendar';
// Import PrimeReact styles
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";

interface CalendarComponentProps {
  onSelectDate: (date: string) => void;
}

export function CalendarComponent({ onSelectDate }: CalendarComponentProps) {
  const [date, setDate] = React.useState<Date | null | undefined>(new Date());

  const handleDateSelect = (e: { value: Date | null | undefined }) => {
    const selectedDate = e.value;
    setDate(selectedDate);
    if (selectedDate) {
      // Format date as YYYY-MM-DD string for the booking system
      const formattedDate = selectedDate.toISOString().split('T')[0];
      onSelectDate(formattedDate);
    }
  };

  React.useEffect(() => {
    // Apply custom styles after component mounts
    const style = document.createElement('style');
    style.innerHTML = `
      .p-highlight {
        background-color: #10b981 !important; /* green-500 */
        color: white !important;
      }
      .p-datepicker-today > span {
        border-color: #10b981 !important;
      }
      .p-datepicker .p-datepicker-header {
        background-color: white;
        color: black;
        border-bottom: 1px solid #e5e7eb;
      }
      .p-datepicker {
        border: none;
        box-shadow: none;
      }
      .p-datepicker table td {
        padding: 0.3rem;
      }
      .p-datepicker table td > span {
        width: 2rem;
        height: 2rem;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full h-full flex items-center justify-center rounded-md border shadow bg-white p-2">
        <Calendar
          value={date}
          onChange={handleDateSelect}
          inline
          showButtonBar
          dateFormat="yy-mm-dd"
          className="w-full h-full"
          panelClassName="h-full"
        />
      </div>
    </div>
  );
}