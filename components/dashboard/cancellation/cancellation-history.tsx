import React, { useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  AlertTriangle,
  InfoIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import { toast } from "sonner";
import { formatLongDate, formatShortDate, formatTime } from "@/lib/utils";

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
  fee_percentage?: number;
  appointment?: Appointment;
}

interface CancellationHistoryProps {
  requests: CancellationRequest[];
}

export function CancellationHistory({ requests }: CancellationHistoryProps) {
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
          const hasFee = request.fee_percentage && request.fee_percentage > 0;

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
                      Submitted {formatLongDate(request.created_at)}
                    </span>
                  </div>
                  <span className="text-sm font-medium">Request #{request.id}</span>
                </div>
              </CardHeader>
              
              <CardContent className="pb-3">
                {appointment ? (
                  <div className="space-y-3">
                    <h3 className="font-medium">{appointment.service_type}</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{formatShortDate(appointment.date)}</span>
                      </div>
                      
                    <div className="text-sm text-gray-700 line-clamp-2">
                      <span className="font-medium">Reason:</span> {request.reason}
                    </div>
                    
                    {/* Display fee information if applicable */}
                    {hasFee && (
                      <div className="flex items-center gap-2 mt-1 py-2 px-3 bg-amber-50 rounded-md border border-amber-200">
                        <InfoIcon className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-amber-800">
                          <span className="font-medium">Cancellation Fee:</span> {request.fee_percentage}% of service cost
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-4 bg-gray-50 rounded-md">
                    <AlertTriangle className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Appointment details not available</span>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="border-t bg-gray-50 px-6 py-3">
                {status === "pending" ? (
                  <Button
                    variant="outline"
                    className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                    onClick={() => {
                      toast.info("This feature will be available soon");
                    }}
                  >
                    Cancel Request
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="text-gray-600 hover:bg-gray-100 border-gray-200"
                    onClick={() => {
                      toast.info("Feature not implemented: View details");
                    }}
                  >
                    View Details
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
}