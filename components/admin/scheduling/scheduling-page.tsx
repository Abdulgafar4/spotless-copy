"use client"

import { useState } from "react"
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  RefreshCcw,
  Users,
  Clock,
  CalendarIcon
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import AdminLayout from "@/components/admin/admin-layout"
import { AddAppointmentDialog } from "@/components/admin/scheduling/addAppointment"

// Mock data for appointments
const mockAppointments = [
  {
    id: 1,
    title: "Move-Out Cleaning",
    customer: "John Smith",
    address: "123 Main St, Toronto",
    date: "2025-04-07",
    time: "09:00",
    duration: "3 hours",
    branch: "Toronto Downtown",
    status: "confirmed",
    staff: ["Emma Wilson", "David Lee"],
    phone: "416-555-9876"
  },
  {
    id: 2,
    title: "Deep Cleaning",
    customer: "Sarah Johnson",
    address: "456 Queen St, Toronto",
    date: "2025-04-07",
    time: "13:00",
    duration: "4 hours",
    branch: "Toronto Downtown",
    status: "confirmed",
    staff: ["Michael Brown", "Jessica Clark"],
    phone: "416-555-1234"
  },
  {
    id: 3,
    title: "Appliance Cleaning",
    customer: "Robert Davis",
    address: "789 King St, Mississauga",
    date: "2025-04-08",
    time: "10:00",
    duration: "2 hours",
    branch: "Mississauga",
    status: "pending",
    staff: ["Kevin Wilson"],
    phone: "905-555-8765"
  },
  {
    id: 4,
    title: "Move-In Cleaning",
    customer: "Jennifer Miller",
    address: "321 Elm St, Toronto",
    date: "2025-04-09",
    time: "14:00",
    duration: "3 hours",
    branch: "North York",
    status: "confirmed",
    staff: ["Laura Taylor", "Mark Anderson"],
    phone: "416-555-4321"
  },
  {
    id: 5,
    title: "Carpet Cleaning",
    customer: "Daniel Wilson",
    address: "654 Oak St, Mississauga",
    date: "2025-04-10",
    time: "11:00",
    duration: "2 hours",
    branch: "Mississauga",
    status: "cancelled",
    staff: ["Susan White"],
    phone: "905-555-2345"
  },
  {
    id: 6,
    title: "Window Cleaning",
    customer: "Linda Thomas",
    address: "987 Pine St, Toronto",
    date: "2025-04-11",
    time: "09:30",
    duration: "2 hours",
    branch: "Toronto Downtown",
    status: "confirmed",
    staff: ["James Martin", "Nicole Brown"],
    phone: "416-555-7654"
  },
  {
    id: 7,
    title: "Post-Construction Cleaning",
    customer: "Michael Johnson",
    address: "147 Maple St, Ottawa",
    date: "2025-04-11",
    time: "13:30",
    duration: "5 hours",
    branch: "Ottawa Central",
    status: "confirmed",
    staff: ["Christopher White", "Elizabeth Davis", "Jason Miller"],
    phone: "613-555-9876"
  },
]

export default function SchedulingPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [selectedView, setSelectedView] = useState("week")
  const [appointments, setAppointments] = useState(mockAppointments)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Get the dates for the current week
  const startDate = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Start on Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))

  // Filter appointments based on selected branch
  const filteredAppointments = selectedBranch === "all"
    ? appointments
    : appointments.filter(appointment => appointment.branch.toLowerCase().includes(selectedBranch.toLowerCase()))

  // Group appointments by date
  const appointmentsByDate = filteredAppointments.reduce((acc: Record<string, any[]>, appointment) => {
    if (!acc[appointment.date]) {
      acc[appointment.date] = []
    }
    acc[appointment.date].push(appointment)
    return acc
  }, {})

  const handlePrevWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1))
  }

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1))
  }

  const handleAddAppointment = (newAppointment: any) => {
    const id = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1
    setAppointments([...appointments, { ...newAppointment, id }])
    setIsAddDialogOpen(false)
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setIsAddDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Service Scheduling</h1>
          <Button onClick={() => {
            setSelectedDate(new Date())
            setIsAddDialogOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Appointment
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
                  <RefreshCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="week" className="mb-6" onValueChange={setSelectedView}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-medium ml-2">
                  {format(startDate, "MMMM d, yyyy")} - {format(addDays(startDate, 6), "MMMM d, yyyy")}
                </h3>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentWeek(new Date())}
              >
                Today
              </Button>
            </div>

            {selectedView === "week" && (
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => (
                  <div key={day.toString()}>
                    <div className="text-center py-2 border-b font-medium">
                      <div className="text-sm text-gray-500">{format(day, "EEE")}</div>
                      <div 
                        className={`
                          text-sm rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer
                          ${format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") 
                            ? "bg-green-500 text-white" 
                            : "hover:bg-gray-100"}
                        `}
                        onClick={() => handleDayClick(day)}
                      >
                        {format(day, "d")}
                      </div>
                    </div>
                    <div className="min-h-[150px] p-1">
                      {appointmentsByDate[format(day, "yyyy-MM-dd")]?.map((appointment) => (
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
                ))}
              </div>
            )}

            {selectedView === "list" && (
              <div className="space-y-4">
                {Object.entries(appointmentsByDate)
                  .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                  .map(([date, dayAppointments]) => (
                    <div key={date} className="space-y-2">
                      <h3 className="font-medium flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {format(new Date(date), "EEEE, MMMM d, yyyy")}
                      </h3>
                      <div className="grid gap-3">
                        {dayAppointments.map((appointment) => (
                          <Card key={appointment.id} className="p-0 overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                              <div className="space-y-1">
                                <div className="font-medium">{appointment.title}</div>
                                <div className="text-sm text-gray-500">{appointment.time} ({appointment.duration})</div>
                                {getStatusBadge(appointment.status)}
                              </div>
                              <div className="space-y-1">
                                <div className="font-medium">{appointment.customer}</div>
                                <div className="text-sm text-gray-500">{appointment.phone}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="font-medium">{appointment.branch}</div>
                                <div className="text-sm text-gray-500 truncate">{appointment.address}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="font-medium">Staff ({appointment.staff.length})</div>
                                <div className="text-sm text-gray-500 truncate">{appointment.staff.join(", ")}</div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddAppointmentDialog
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        onAdd={handleAddAppointment}
        selectedDate={selectedDate}
      />
    </AdminLayout>
  )}