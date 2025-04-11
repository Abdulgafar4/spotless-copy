import React, { useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  FileText, 
  AlertTriangle,
  MapPin,
  Building 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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

interface CancellationRequest {
  id: string;
  appointment_id: string;
  reason: string;
  status: string;
  created_at: string;
  appointment?: Appointment;
}

interface CancellationHistoryProps {
  requests: CancellationRequest[];
}

export function CancellationHistory({ requests }: CancellationHistoryProps) {
  const [selectedRequest, setSelectedRequest] = useState<CancellationRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const statusConfig = {
    approved: {
      className: "bg-green-100 text-green-800 border-green-200",
      label: "Approved",
      icon: CheckCircle,
      description: "Your cancellation request has been approved."
    },
    denied: {
      className: "bg-red-100 text-red-800 border-red-200",
      label: "Denied",
      icon: XCircle,
      description: "Your cancellation request has been denied. Please contact support for more information."
    },
    pending: {
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Pending",
      icon: Clock,
      description: "Your cancellation request is being reviewed. We'll notify you when the status changes."
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

  const handleViewDetails = (request: CancellationRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  // Sort requests by date (newest first)
  const sortedRequests = [...requests].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (sortedRequests.length === 0) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No cancellation requests</h3>
        <p className="mt-2 text-sm text-gray-500">
          You haven't submitted any cancellation requests yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {sortedRequests.map((request) => {
          const status = request.status.toLowerCase();
          const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
          const StatusIcon = config.icon;
          const appointment = request.appointment;

          return (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge className={config.className}>
                      <StatusIcon className="h-3.5 w-3.5 mr-1" />
                      {config.label}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Submitted {formatDateTime(request.created_at)}
                    </span>
                  </div>
                  <span className="text-sm font-medium">Request #{request.id}</span>
                </div>
              </CardHeader>
              
              <CardContent className="pb-3">
                {appointment ? (
                  <div className="space-y-3">
                    <h3 className="font-medium">{appointment.service_type}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 line-clamp-2">
                      <span className="font-medium">Reason:</span> {request.reason}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-4 bg-gray-50 rounded-md">
                    <AlertTriangle className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Appointment details not available</span>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="border-t bg-gray-50 px-6 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => handleViewDetails(request)}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {selectedRequest && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Cancellation Request Details
              </DialogTitle>
              <DialogDescription>
                Request #{selectedRequest.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Status:</h3>
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
                <span className="text-sm text-gray-500">
                  Submitted on {formatDateTime(selectedRequest.created_at)}
                </span>
              </div>
              
              {selectedRequest.appointment && (
                <Card className="border-blue-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Appointment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <h3 className="font-medium">{selectedRequest.appointment.service_type}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>{formatDate(selectedRequest.appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>{selectedRequest.appointment.time}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm sm:col-span-2">
                        <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span>{selectedRequest.appointment.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-blue-500" />
                        <span>{selectedRequest.appointment.branch}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Appointment ID:</span>
                        <span>{selectedRequest.appointment.id}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Cancellation Reason</h4>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <p>{selectedRequest.reason}</p>
                </div>
              </div>
              
              <div className={`p-3 rounded-md border ${
                selectedRequest.status.toLowerCase() === "approved" ? "bg-green-50 border-green-200" : 
                selectedRequest.status.toLowerCase() === "denied" ? "bg-red-50 border-red-200" : 
                "bg-yellow-50 border-yellow-200"
              }`}>
                <div className="flex items-start gap-2">
                  {React.createElement(
                    statusConfig[selectedRequest.status.toLowerCase() as keyof typeof statusConfig]?.icon || AlertTriangle, 
                    { className: `h-5 w-5 ${
                      selectedRequest.status.toLowerCase() === "approved" ? "text-green-500" : 
                      selectedRequest.status.toLowerCase() === "denied" ? "text-red-500" : 
                      "text-yellow-500"
                    } mt-0.5` }
                  )}
                  <div>
                    <h4 className={`font-medium ${
                      selectedRequest.status.toLowerCase() === "approved" ? "text-green-800" : 
                      selectedRequest.status.toLowerCase() === "denied" ? "text-red-800" : 
                      "text-yellow-800"
                    }`}>
                      {statusConfig[selectedRequest.status.toLowerCase() as keyof typeof statusConfig]?.label || 
                      selectedRequest.status}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      selectedRequest.status.toLowerCase() === "approved" ? "text-green-700" : 
                      selectedRequest.status.toLowerCase() === "denied" ? "text-red-700" : 
                      "text-yellow-700"
                    }`}>
                      {statusConfig[selectedRequest.status.toLowerCase() as keyof typeof statusConfig]?.description || 
                      "Status information not available."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDetailsOpen(false)}
              >
                Close
              </Button>
              {selectedRequest.status.toLowerCase() === "pending" && (
                <Button
                  variant="outline"
                  className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                  onClick={() => {
                    // In a real implementation, this would call a function to cancel the request
                    toast.info("Feature not implemented: Cancel request");
                    setIsDetailsOpen(false);
                  }}
                >
                  Cancel Request
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}