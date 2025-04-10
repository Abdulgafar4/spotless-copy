import React from 'react';
import { Clock, Users} from "lucide-react";
import { format } from 'date-fns';

export const CalendarDay = ({ 
    day, 
    isToday, 
    appointments, 
    onDayClick 
  }: { 
    day: Date, 
    isToday: boolean, 
    appointments: Appointment[], 
    onDayClick: (date: Date) => void 
  }) => {
    const dateString = format(day, "yyyy-MM-dd");
    
    return (
      <div>
        <div className="text-center py-2 border-b font-medium">
          <div className="text-sm text-gray-500">{format(day, "EEE")}</div>
          <div 
            className={`
              text-sm rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer
              ${isToday ? "bg-green-500 text-white" : "hover:bg-gray-100"}
            `}
            onClick={() => onDayClick(day)}
          >
            {format(day, "d")}
          </div>
        </div>
        <div className="min-h-[150px] p-1">
          {appointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="bg-green-50 border-l-4 border-green-500 p-2 mb-1 rounded-r cursor-pointer hover:bg-green-100 transition-colors"
            >
              <div className="text-sm font-medium truncate">{appointment.title}</div>
              <div className="text-xs text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {appointment.time}
              </div>
              <div className="text-xs text-gray-500 flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {appointment.staff.length}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
