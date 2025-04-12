"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useClientAppointments, Appointment } from "@/hooks/use-client-appointments";
import { supabase } from "@/lib/supabaseClient";
import { CancellationRequestForm } from "@/components/dashboard/cancellation/cancellation-form";
import { CancellationHistory } from "@/components/dashboard/cancellation/cancellation-history";
import { AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

interface CancellationRequest {
  id: string;
  appointment_id: string;
  reason: string;
  status: string;
  created_at: string;
  appointment?: Appointment;
}

export default function CancellationPage() {
  const { user } = useAuth();
  const { appointments, requestCancellation } = useClientAppointments();
  const [cancellationRequests, setCancellationRequests] = useState<CancellationRequest[]>([]);
  const [activeTab, setActiveTab] = useState("request");
  const [loading, setLoading] = useState(true);
  
  // Filter appointments that can be cancelled (confirmed status)
  const cancellableAppointments = appointments.filter(
    apt => apt.status === "confirmed" && new Date(apt.date) > new Date()
  );

  // Fetch cancellation requests
  const fetchCancellationRequests = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("cancellation_requests")
        .select(`
          *,
          appointment:appointment_id (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setCancellationRequests(data || []);
    } catch (err) {
      console.error("Error fetching cancellation requests:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCancellationRequests();
    }
  }, [user, fetchCancellationRequests]);

  // Handle cancellation request submission
  const handleCancellationRequest = async (appointmentId: string, reason: string) => {
    const success = await requestCancellation(appointmentId, reason);
    
    if (success) {
      // Switch to history tab to show the new request
      setActiveTab("history");
      // Refresh the cancellation requests
      await fetchCancellationRequests();
    }
    
    return success;
  };

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Cancellation Requests</h2>
        <p className="text-muted-foreground">
          Request cancellation for upcoming appointments or view your request history
        </p>
      </div>

      <Tabs defaultValue="request" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="request">New Request</TabsTrigger>
          <TabsTrigger value="history">Request History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="request" className="space-y-4 mt-6">
          {cancellableAppointments.length > 0 ? (
            <CancellationRequestForm 
              appointments={cancellableAppointments} 
              onSubmit={handleCancellationRequest}
            />
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium">No Eligible Appointments</h3>
              <p className="text-gray-500 mt-2 mb-4">
                You don't have any upcoming appointments that can be cancelled.
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
            <CancellationHistory requests={cancellationRequests} />
          )}
        </TabsContent>
      </Tabs>
    </div>
    </DashboardLayout>
  );
}