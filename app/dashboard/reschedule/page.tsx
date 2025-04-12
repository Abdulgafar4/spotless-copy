"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useClientAppointments, Appointment } from "@/hooks/use-client-appointments";
import { supabase } from "@/lib/supabaseClient";
import { RescheduleRequestForm } from "@/components/dashboard/reschedule/reschedule-form";
import { RescheduleHistory } from "@/components/dashboard/reschedule/reschedule-history";
import { AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

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

export default function ReschedulePage() {
  const { user } = useAuth();
  const { appointments, requestReschedule } = useClientAppointments();
  const [rescheduleRequests, setRescheduleRequests] = useState<RescheduleRequest[]>([]);
  const [activeTab, setActiveTab] = useState("request");
  const [loading, setLoading] = useState(true);
  
  // Available time slots (would typically come from an API)
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];
  
  // Filter appointments that can be rescheduled (confirmed status)
  const reschedulableAppointments = appointments.filter(
    apt => apt.status === "confirmed" && new Date(apt.date) > new Date()
  );

  // Fetch reschedule requests
  const fetchRescheduleRequests = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("reschedule_requests")
        .select(`
          *,
          appointment:appointment_id (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setRescheduleRequests(data || []);
    } catch (err) {
      console.error("Error fetching reschedule requests:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchRescheduleRequests();
    }
  }, [user, fetchRescheduleRequests]);

  // Handle reschedule request submission
  const handleRescheduleRequest = async (
    appointmentId: string, 
    requestedDate: string, 
    requestedTime: string, 
    reason: string
  ) => {
    const success = await requestReschedule(appointmentId, requestedDate, requestedTime, reason);
    
    if (success) {
      // Switch to history tab to show the new request
      setActiveTab("history");
      // Refresh the reschedule requests
      await fetchRescheduleRequests();
    }
    
    return success;
  };

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reschedule Requests</h2>
        <p className="text-muted-foreground">
          Request to reschedule your upcoming appointments or view your request history
        </p>
      </div>

      <Tabs defaultValue="request" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="request">New Request</TabsTrigger>
          <TabsTrigger value="history">Request History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="request" className="space-y-4 mt-6">
          {reschedulableAppointments.length > 0 ? (
            <RescheduleRequestForm 
              appointments={reschedulableAppointments} 
              timeSlots={timeSlots}
              onSubmit={handleRescheduleRequest}
            />
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium">No Eligible Appointments</h3>
              <p className="text-gray-500 mt-2 mb-4">
                You don't have any upcoming appointments that can be rescheduled.
              </p>
              <Button 
                variant="outline"
                onClick={() => window.location.href = "/dashboard/appointments"}
              >
                View All Appointments
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4 mt-6">
          {loading ? (
            <div className="text-center py-8">Loading requests...</div>
          ) : (
            <RescheduleHistory requests={rescheduleRequests} />
          )}
        </TabsContent>
      </Tabs>
    </div>
    </DashboardLayout>
  );
}