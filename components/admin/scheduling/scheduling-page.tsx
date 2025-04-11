"use client"

import { useState } from "react"
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  CalendarIcon
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import AdminLayout from "@/components/admin/admin-layout"
import { AddAppointmentDialog } from "@/components/admin/scheduling/addAppointment"
import { mockAppointments } from '../adminDummyData';
import { AppointmentCard } from "./appointmentCard"
import { CalendarDay } from "./calendarDay"
import { WeekNavigator } from "./weekNavigator"
import { StatusBadge } from "./statusBadge"

function getTimeSlotsForDay(start: number = 8, end: number = 18): string[] {
  const slots = [];
  for (let hour = start; hour < end; hour++) {
    slots.push(`${hour}:00`);
    slots.push(`${hour}:30`);
  }
  return slots;
}

function getDaysInMonth(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Get first day of calendar (might be previous month)
  const firstDayOfCalendar = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
  
  // Get last day of calendar (might be next month)
  const lastDayOfCalendar = addDays(startOfWeek(lastDayOfMonth, { weekStartsOn: 1 }), 34); // 5 weeks (35 days)
  
  const days = [];
  let current = firstDayOfCalendar;
  
  while (current <= lastDayOfCalendar) {
    days.push(new Date(current));
    current = addDays(current, 1);
  }
  
  return days;
}

const TimeSlotAppointment = ({ appointment }: { appointment: Appointment }) => (
  <div className="bg-green-50 border-l-4 border-green-500 p-2 mb-1 rounded-r text-sm hover:bg-green-100 transition-colors">
    <div className="font-medium truncate">{appointment.title}</div>
    <div className="text-xs text-gray-500">{appointment.customer}</div>
    <StatusBadge status={appointment.status} />
  </div>
);
const DayView = ({ 
  date, 
  appointments, 
  onTimeSlotClick 
}: { 
  date: Date, 
  appointments: Appointment[], 
  onTimeSlotClick: (date: Date, time: string) => void 
}) => {
  const timeSlots = getTimeSlotsForDay();
  const appointmentsByTime: Record<string, Appointment[]> = {};
  
  // Group appointments by time
  appointments.forEach(appointment => {
    const timeKey = appointment.time.split(':').slice(0, 2).join(':');
    if (!appointmentsByTime[timeKey]) {
      appointmentsByTime[timeKey] = [];
    }
    appointmentsByTime[timeKey].push(appointment);
  });
  
  return (
    <div className="border rounded-md">
      <div className="text-center p-4 border-b bg-gray-50">
        <h3 className="font-medium">{format(date, "EEEE, MMMM d, yyyy")}</h3>
      </div>
      <div className="divide-y">
        {timeSlots.map(time => {
          const [hour, minute] = time.split(':');
          const slotTime = new Date(date);
          slotTime.setHours(parseInt(hour), parseInt(minute), 0);
          
          return (
            <div 
              key={time} 
              className="flex py-2 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onTimeSlotClick(date, time)}
            >
              <div className="w-20 px-4 text-right text-sm text-gray-500">{time}</div>
              <div className="flex-1 px-4 min-h-12">
                {appointmentsByTime[time]?.map(appointment => (
                  <TimeSlotAppointment key={appointment.id} appointment={appointment} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MonthCalendarDay = ({ 
  day, 
  isCurrentMonth, 
  isToday, 
  appointments, 
  onDayClick 
}: { 
  day: Date, 
  isCurrentMonth: boolean,
  isToday: boolean, 
  appointments: Appointment[], 
  onDayClick: (date: Date) => void 
}) => {
  return (
    <div 
      className={`min-h-24 p-1 border ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}`}
      onClick={() => onDayClick(day)}
    >
      <div className={`
        text-right p-1 
        ${!isCurrentMonth ? 'text-gray-400' : ''}
        ${isToday ? 'font-bold' : ''}
      `}>
        {format(day, "d")}
      </div>
      <div className="overflow-y-auto max-h-20">
        {appointments.slice(0, 3).map((appointment) => (
          <div 
            key={appointment.id} 
            className="bg-green-50 border-l-4 border-green-500 p-1 mb-1 text-xs rounded-r truncate"
          >
            {appointment.time} {appointment.title}
          </div>
        ))}
        {appointments.length > 3 && (
          <div className="text-xs text-gray-500 pl-1">+{appointments.length - 3} more</div>
        )}
      </div>
    </div>
  );
};


const ListViewGroup = ({ date, appointments }: { date: string, appointments: Appointment[] }) => (
  <div className="space-y-2">
    <h3 className="font-medium flex items-center">
      <CalendarIcon className="h-4 w-4 mr-2" />
      {format(new Date(date), "EEEE, MMMM d, yyyy")}
    </h3>
    <div className="grid gap-3">
      {appointments.map(appointment => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  </div>
);


// Main Component
export default function SchedulingPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [selectedView, setSelectedView] = useState("week")
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  // Computed values
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }) // Start on Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))
  const monthDays = getDaysInMonth(currentDate)
  const today = format(new Date(), "yyyy-MM-dd")

  // Filter appointments based on selected branch
  const filteredAppointments = selectedBranch === "all"
    ? appointments
    : appointments.filter(appointment => appointment.branch.toLowerCase().includes(selectedBranch.toLowerCase()))

  // Group appointments by date
  const appointmentsByDate = filteredAppointments.reduce((acc: Record<string, Appointment[]>, appointment) => {
    if (!acc[appointment.date]) {
      acc[appointment.date] = []
    }
    acc[appointment.date].push(appointment)
    return acc
  }, {})

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date): Appointment[] => {
    const dateString = format(date, "yyyy-MM-dd");
    return appointmentsByDate[dateString] || [];
  }

  // Handlers for navigation
  const handleDateChange = (amount: number, unit: 'day' | 'week' | 'month') => {
    if (unit === 'day') {
      setCurrentDate(addDays(currentDate, amount));
    } else if (unit === 'week') {
      setCurrentDate(amount > 0 ? addWeeks(currentDate, amount) : subWeeks(currentDate, Math.abs(amount)));
    } else if (unit === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + amount, 1));
    }
  }

  const handleAddAppointment = (newAppointment: Omit<Appointment, 'id'>) => {
    const id = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1
    setAppointments([...appointments, { ...newAppointment, id }])
    setIsAddDialogOpen(false)
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
    setIsAddDialogOpen(true)
  }

  const handleTimeSlotClick = (date: Date, time: string) => {
    setSelectedDate(date)
    setSelectedTime(time)
    setIsAddDialogOpen(true)  
  }

  const openAddDialog = () => {
    setSelectedDate(new Date())
    setSelectedTime(null)
    setIsAddDialogOpen(true)
  }

  const renderCalendarView = () => {
    if (selectedView === "day") {
      return (
        <DayView 
          date={currentDate}
          appointments={getAppointmentsForDate(currentDate)}
          onTimeSlotClick={handleTimeSlotClick}
        />
      );
    }
    
    if (selectedView === "week") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const dateString = format(day, "yyyy-MM-dd");
            const isToday = dateString === today;
            const dayAppointments = appointmentsByDate[dateString] || [];
            
            return (
              <CalendarDay 
                key={dateString} 
                day={day} 
                isToday={isToday} 
                appointments={dayAppointments}
                onDayClick={handleDayClick}
              />
            );
          })}
        </div>
      );
    }
    
    if (selectedView === "month") {
      return (
        <div>
          <div className="text-center mb-2 font-medium">
            {format(currentDate, "MMMM yyyy")}
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="bg-gray-100 text-center py-2 text-sm font-medium">
                {day}
              </div>
            ))}
            
            {monthDays.map((day) => {
              const dateString = format(day, "yyyy-MM-dd");
              const isToday = dateString === today;
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const dayAppointments = appointmentsByDate[dateString] || [];
              
              return (
                <MonthCalendarDay
                  key={dateString}
                  day={day}
                  isCurrentMonth={isCurrentMonth}
                  isToday={isToday}
                  appointments={dayAppointments}
                  onDayClick={handleDayClick}
                />
              );
            })}
          </div>
        </div>
      );
    }
    
    if (selectedView === "list") {
      // Make sure we show dates with appointments ordered by date
      const sortedDates = Object.keys(appointmentsByDate).sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      );
      
      return (
        <div className="space-y-4">
          {sortedDates.length > 0 ? (
            sortedDates.map(date => (
              <ListViewGroup 
                key={date} 
                date={date} 
                appointments={appointmentsByDate[date]} 
              />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No appointments found for the selected filter.
            </div>
          )}
        </div>
      );
    }
    
    return <div className="p-4 text-center">This view is not implemented yet</div>;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Service Scheduling</h1>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Appointment</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Schedule Calendar</CardTitle>
                <CardDescription>
                  View and manage all scheduled appointments
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    <SelectItem value="toronto downtown">Toronto Downtown</SelectItem>
                    <SelectItem value="mississauga">Mississauga</SelectItem>
                    <SelectItem value="north york">North York</SelectItem>
                    <SelectItem value="ottawa central">Ottawa Central</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="week" className="mb-6" onValueChange={setSelectedView}>
              <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Dynamic navigation based on current view */}
            {selectedView === "day" && (
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleDateChange(-1, 'day')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDateChange(1, 'day')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <h3 className="text-lg font-medium ml-2">
                    {format(currentDate, "MMMM d, yyyy")}
                  </h3>
                </div>
                <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
              </div>
            )}

            {selectedView === "week" && (
              <WeekNavigator 
                startDate={startDate}
                onPrevWeek={() => handleDateChange(-1, 'week')}
                onNextWeek={() => handleDateChange(1, 'week')}
                onToday={() => setCurrentDate(new Date())}
              />
            )}

            {selectedView === "month" && (
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleDateChange(-1, 'month')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDateChange(1, 'month')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <h3 className="text-lg font-medium ml-2">
                    {format(currentDate, "MMMM yyyy")}
                  </h3>
                </div>
                <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
              </div>
            )}

            {renderCalendarView()}
          </CardContent>
        </Card>
      </div>

      <AddAppointmentDialog
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        onAdd={handleAddAppointment}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />
    </AdminLayout>
  )
}