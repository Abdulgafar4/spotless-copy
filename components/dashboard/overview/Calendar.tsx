"use client"

import * as React from "react";
import { Calendar } from 'primereact/calendar';
import { useUnavailableDates } from '@/hooks/use-unavailable-dates';
// Import PrimeReact styles
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";

interface CalendarComponentProps {
  onSelectDate: (date: string) => void;
  selectedBranch?: string; // Optional branch filter
}

export function CalendarComponent({ onSelectDate, selectedBranch }: CalendarComponentProps) {
  const [date, setDate] = React.useState<Date | null | undefined>(new Date());
  const { getUnavailableDatesForBranch, loading } = useUnavailableDates();
  
  // Get today's date with time set to 00:00:00 to ensure proper comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get unavailable dates for the selected branch - only if branch is selected
  const unavailableDates = React.useMemo(() => {
    // Don't load unavailable dates if no branch is selected
    if (loading || !selectedBranch) return [];
    
    const unavailableDateStrings = getUnavailableDatesForBranch(selectedBranch);

    
    return unavailableDateStrings.map(dateString => {
      // Safe parsing - split the string and create date in local timezone
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed
      date.setHours(0, 0, 0, 0);
      
      return date;
    });
  }, [getUnavailableDatesForBranch, selectedBranch, loading]);

  const handleDateSelect = (e: { value: Date | null | undefined }) => {
    const selectedDate = e.value;
    
    // Check if the selected date is unavailable
    if (selectedDate && unavailableDates.length > 0) {
      const dateString = selectedDate.toISOString().split('T')[0];
      const isUnavailable = unavailableDates.some(unavailableDate => 
        unavailableDate.toISOString().split('T')[0] === dateString
      );
      
      if (isUnavailable) {
        // Don't allow selection of unavailable dates
        return;
      }
    }
    
    setDate(selectedDate);
    if (selectedDate) {
      // Format date as YYYY-MM-DD string for the booking system
      const formattedDate = selectedDate.toISOString().split('T')[0];
      onSelectDate(formattedDate);
    }
  };

  // Custom date template to style unavailable dates
  const dateTemplate = (date: any) => {
    // Only apply unavailable styling if branch is selected
    if (!selectedBranch || unavailableDates.length === 0) {
      return date.day;
    }

    const currentDate = new Date(date.year, date.month, date.day);
    const isUnavailable = unavailableDates.some(unavailableDate => {
      const unavailableDateStr = unavailableDate.toISOString().split('T')[0];
      const currentDateStr = currentDate.toISOString().split('T')[0];
      return unavailableDateStr === currentDateStr;
    });

    const isPast = currentDate < today;

    if (isUnavailable && !isPast) {
      return (
        <span 
          className="unavailable-date" 
          title="This date is not available for booking"
        >
          {date.day}
        </span>
      );
    }

    return date.day;
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
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }
      /* Style for disabled past dates */
      .p-disabled {
        opacity: 0.4 !important;
        cursor: not-allowed !important;
      }
      /* Style for unavailable dates */
      .p-datepicker table td > span.unavailable-date {
        background-color: #fee2e2 !important;
        color: #dc2626 !important;
        cursor: not-allowed !important;
        text-decoration: line-through;
        font-weight: bold;
      }
      .p-datepicker table td > span.unavailable-date:hover {
        background-color: #fecaca !important;
      }
      /* Prevent clicking on unavailable dates */
      .p-datepicker table td:has(> span.unavailable-date) {
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Show different states based on loading and branch selection
  if (loading) {
    return (
      <div className="w-full h-[400px] flex flex-col">
        <div className="w-full h-full flex items-center justify-center rounded-md border shadow bg-white p-2">
          <div className="text-center text-gray-500">
            Loading calendar...
          </div>
        </div>
      </div>
    );
  }

  if (!selectedBranch) {
    return (
      <div className="w-full h-[400px] flex flex-col">
        <div className="w-full h-full flex items-center justify-center rounded-md border shadow bg-white p-2">
          <div className="text-center text-gray-500">
            <div className="mb-2">📍</div>
            <div className="font-medium">Select a branch first</div>
            <div className="text-sm">Choose a branch to see available dates</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] flex flex-col">
      <div className="w-full h-full flex items-center justify-center rounded-md border shadow bg-white p-2">
        <Calendar
          value={date}
          onChange={handleDateSelect}
          inline
          showButtonBar
          dateFormat="yy-mm-dd"
          className="w-full h-full"
          panelClassName="h-full"
          minDate={today}
          disabledDates={unavailableDates}
          dateTemplate={dateTemplate}
          disabledDays={[]}
        />
      </div>
    </div>
  );
}