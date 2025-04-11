import { useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  CalendarClock, 
  FileText, 
  AlertTriangle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  address: string;
  service_type: string;
  branch: string;
}

interface RescheduleRequest {
  id: string;
  appointment_id: string;
  requested_date: string;
  requested_time: string;
  reason: string;
  status: string;
  created_at: string;
  appointment?: Appointment;
}

interface RescheduleHistoryProps {
  requests: RescheduleRequest[];
}

export function RescheduleHistory({ requests }: RescheduleHistoryProps) {
  const [selectedRequest, setSelectedRequest] = useState<RescheduleRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const statusConfig = {
    approved: {
      className: "bg-green-100 text-green-800 border-green-200",
      label: "Approved",
      icon: CheckCircle,
    },
    denied: {
      className: "bg-red-100 text-red-800 border-red-200",
      label: "Denied",
      icon: XCircle,
    },
    pending: {
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Pending",
      icon: Clock,
    },
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatDateTime = (dateTimeString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleDateString('en-US', options);
  };

  const formatTimeForDisplay = (timeString: string) => {
    // Convert 24-hour format to 12-hour format if needed
    if (timeString.includes(":")) {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }
    return timeString; // Already in display format
  };

  const handleViewDetails = (request: RescheduleRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {requests.map((request) => {
          const status = request.status.toLowerCase();
          const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
          const StatusIcon = config.icon;
          const appointment = request.appointment;

          return (
            <Accordion 
              type="single" 
              collapsible 
              className="bg-white border rounded-md" 
              key={request.id}
            >
              <AccordionItem value="item-1" className="border-b-0">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Badge className={config.className}>
                      <StatusIcon className="h-3.5 w-3.5 mr-1" />
                      {config.label}
                    </Badge>
                    <span className="text-sm font-medium text-gray-500">
                      Request #{request.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatDateTime(request.created_at)}
                    </span>
                    <AccordionTrigger className="h-4 w-4 p-0" />
                  </div>
                </div>
                
                <AccordionContent className="px-4 pb-4 pt-0">
                  {appointment ? (
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Service</h4>
                        <p>{appointment.service_type}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Original Date</h4>
                          <p>{formatDate(appointment.date)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Original Time</h4>
                          <p>{appointment.time}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Requested Date</h4>
                          <p>{formatDate(request.requested_date)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Requested Time</h4>
                          <p>{formatTimeForDisplay(request.requested_time)}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Reason</h4>
                        <p className="text-sm">{request.reason}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => handleViewDetails(request)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View Full Details
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-md text-center">
                      <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Appointment details not available</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
      </div>

      {selectedRequest && selectedRequest.appointment && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5" />
                Reschedule Request Details
              </DialogTitle>
              <DialogDescription>
                Request #{selectedRequest.id} - {statusConfig[selectedRequest.status.toLowerCase() as keyof typeof statusConfig]?.label || selectedRequest.status}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Appointment Information</h4>
                <div className="mt-2 p-3 bg-gray-50 rounded-md space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(selectedRequest.appointment.date)} at {selectedRequest.appointment.time}</span>
                  </div>
                  <div>
                    <span className="block font-medium">{selectedRequest.appointment.service_type}</span>
                    <span className="text-sm text-gray-600">{selectedRequest.appointment.branch}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedRequest.appointment.address}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Requested New Schedule</h4>
                <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{formatDate(selectedRequest.requested_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>{formatTimeForDisplay(selectedRequest.requested_time)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Reason for Rescheduling</h4>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedRequest.reason}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Request Date</h4>
                  <p>{formatDateTime(selectedRequest.created_at)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <Badge 
                    className={
                      statusConfig[selectedRequest.status.toLowerCase() as keyof typeof statusConfig]?.className || 
                      "bg-gray-100 text-gray-800"
                    }
                  >
                    {statusConfig[selectedRequest.status.toLowerCase() as keyof typeof statusConfig]?.label || 
                    selectedRequest.status}
                  </Badge>
                </div>
              </div>
              
              {selectedRequest.status.toLowerCase() === "pending" && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Request Pending</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your reschedule request is currently being reviewed. We'll notify you when the status changes.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDetailsOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )};