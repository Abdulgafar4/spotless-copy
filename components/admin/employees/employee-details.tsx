"use client"

import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Award,
  ClipboardCheck,
  Star,
  Clock,
  CalendarCheck,
  CalendarX,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase
} from "lucide-react"

interface EmployeeDetailsDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  employee: any
  onUpdateStatus: (employee: any, status: string) => void
  onAssignRole: (employee: any) => void
  onMessageEmployee: (employee: any) => void
}

export function EmployeeDetailsDialog({
  isOpen,
  setIsOpen,
  employee,
  onUpdateStatus,
  onAssignRole,
  onMessageEmployee
}: EmployeeDetailsDialogProps) {
  if (!employee) return null

  // Helper to format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy")
  }

  // Helper for status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case "probation":
        return <Badge className="bg-yellow-100 text-yellow-800">Probation</Badge>
      case "terminated":
        return <Badge className="bg-red-100 text-red-800">Terminated</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Employee Profile</span>
            {getStatusBadge(employee.status)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex items-start gap-4 my-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback>
              {employee.firstName[0]}{employee.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">
              {employee.firstName} {employee.lastName}
            </h2>
            <div className="flex flex-col space-y-1 mt-1">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Award className="h-4 w-4" /> 
                <span>{employee.role}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Building className="h-4 w-4" /> 
                <span>{employee.branch}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Calendar className="h-4 w-4" /> 
                <span>Hired: {formatDate(employee.hireDate)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="info" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Contact Info</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="schedule">Schedule & Skills</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                <p className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${employee.email}`} className="text-blue-600 hover:underline">
                    {employee.email}
                  </a>
                </p>
              </div>
              
              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                <p className="text-base flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${employee.phone}`} className="text-blue-600 hover:underline">
                    {employee.phone}
                  </a>
                </p>
              </div>
            </div>
            
            <div className="space-y-2 p-4 border rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <p className="text-base flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <span>
                  {employee.address}<br />
                  Postal Code: {employee.postalCode}
                </span>
              </p>
            </div>
            
            <div className="space-y-2 p-4 border rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Notes</h3>
              <div className="mt-2 p-3 bg-gray-50 rounded-md min-h-[80px]">
                {employee.notes ? (
                  <p className="text-gray-700 whitespace-pre-line">{employee.notes}</p>
                ) : (
                  <p className="text-gray-500 italic">No notes available</p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button 
                variant="outline"
                onClick={() => onMessageEmployee(employee)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              
              {employee.status !== "active" && (
                <Button 
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => onUpdateStatus(employee, "active")}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Activate Employee
                </Button>
              )}
              
              {employee.status === "active" && (
                <Button 
                  variant="outline"
                  onClick={() => onUpdateStatus(employee, "inactive")}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Set as Inactive
                </Button>
              )}
              
              {employee.status !== "terminated" && (
                <Button 
                  variant="destructive"
                  onClick={() => onUpdateStatus(employee, "terminated")}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Terminate Employee
                </Button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Completed Jobs</h3>
                <p className="text-base flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-gray-400" />
                  {employee.completedJobs} job{employee.completedJobs !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="space-y-2 p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Customer Rating</h3>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {employee.rating ? employee.rating.toFixed(1) : 'N/A'}
                    </span>
                    {employee.rating ? (
                      <Progress value={employee.rating * 20} className="h-2 w-24" />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 p-4 border rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Job History</h3>
              <div className="mt-2 py-6 px-4 bg-gray-50 rounded-md text-center">
                <Briefcase className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Detailed job history would be displayed here</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                View Full Job History
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => onAssignRole(employee)}
              >
                <Award className="mr-2 h-4 w-4" />
                Change Role/Branch
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="mt-6 space-y-4">
            <div className="space-y-2 p-4 border rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Availability</h3>
              <div className="grid grid-cols-7 gap-2 mt-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div 
                    key={day} 
                    className={`text-center p-2 rounded-md ${
                      employee.availability && employee.availability.includes(day)
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}
                  >
                    <div className="text-xs">{day.substring(0, 3)}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2 p-4 border rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Skills & Specialties</h3>
              {employee.skills && employee.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {employee.skills.map((skill: string) => (
                    <Badge key={skill} className="bg-blue-100 text-blue-800">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mt-2 italic">No specialized skills listed</p>
              )}
            </div>
            
            <div className="space-y-2 p-4 border rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Upcoming Schedule</h3>
              <div className="mt-2 py-6 px-4 bg-gray-50 rounded-md text-center">
                <Clock className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Upcoming scheduled jobs would be displayed here</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}