"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { RescheduleRequestForm } from "@/components/dashboard/reschedule/reschedule-form";
import { RescheduleHistory } from "@/components/dashboard/reschedule/reschedule-history";
import { Loader2, Calendar, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { TIME_SLOTS } from "@/constants/appointment-constants";

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

export default function Reschedule() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [rescheduleRequests, setRescheduleRequests] = useState<RescheduleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUpcomingAppointments(),
        fetchRescheduleRequests()
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch data"));
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "confirmed")
        .gte("date", new Date().toISOString().split('T')[0]) // Only future appointments
        .order("date");

      if (fetchError) {
        throw fetchError;
      }

      setUpcomingAppointments(data || []);
    } catch (err) {
      console.error("Error fetching upcoming appointments:", err);
      toast.error("Failed to load upcoming appointments");
    }
  };

  const fetchRescheduleRequests = async () => {
    try {
      const { data: requestsData, error: requestsError } = await supabase
        .from("reschedule_requests")
        .select(`
          *,
          appointment:appointments(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (requestsError) {
        throw requestsError;
      }

      setRescheduleRequests(requestsData || []);
    } catch (err) {
      console.error("Error fetching reschedule requests:", err);
      toast.error("Failed to load reschedule history");
    }
  };

  const handleSubmitReschedule = async (
    appointmentId: string, 
    requestedDate: string, 
    requestedTime: string, 
    reason: string
  ) => {
    try {
      setLoading(true);
      
      // Create reschedule request
      const { data, error: insertError } = await supabase
        .from("reschedule_requests")
        .insert([
          {
            appointment_id: appointmentId,
            user_id: user.id,
            requested_date: requestedDate,
            requested_time: requestedTime,
            reason,
            status: "pending"
          }
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      toast.success("Reschedule request submitted successfully");
      
      // Refresh data
      await fetchData();
      
      return true;
    } catch (err) {
      console.error("Error submitting reschedule request:", err);
      toast.error("Failed to submit reschedule request");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // For UI demonstration purposes
  const mockAppointments: Appointment[] = [
    {
      id: "APT12345",
      title: "Move-Out Cleaning",
      date: "2024-07-15",
      time: "10:30 AM",
      status: "confirmed",
      address: "123 Main St, Toronto, ON",
      service_type: "Move-Out Cleaning",
      branch: "Toronto Downtown"
    },
    {
      id: "APT12346",
      title: "Carpet Cleaning",
      date: "2024-07-20",
      time: "2:00 PM",
      status: "confirmed",
      address: "456 Queen St, Toronto, ON",
      service_type: "Carpet Cleaning",
      branch: "North York"
    }
  ];

  const mockRescheduleRequests: RescheduleRequest[] = [
    {
      id: "RES123",
      appointment_id: "APT12347",
      requested_date: "2024-06-20",
      requested_time: "14:00",
      reason: "I will be out of town on the original date",
      status: "approved",
      created_at: "2024-06-10T14:30:00Z",
      appointment: {
        id: "APT12347",
        title: "Window Cleaning",
        date: "2024-06-15",
        time: "1:00 PM",
        status: "rescheduled",
        address: "789 King St, Toronto, ON",
        service_type: "Window Cleaning",
        branch: "Mississauga"
      }
    },
    {
      id: "RES124",
      appointment_id: "APT12348",
      requested_date: "2024-06-28",
      requested_time: "10:00",
      reason: "Need to reschedule due to a work commitment",
      status: "pending",
      created_at: "2024-06-18T09:15:00Z",
      appointment: {
        id: "APT12348",
        title: "Deep Cleaning",
        date: "2024-06-25",
        time: "11:00 AM",
        status: "confirmed",
        address: "321 Yonge St, Toronto, ON",
        service_type: "Deep Cleaning",
        branch: "Toronto Downtown"
      }
    }
  ];

  // If no data from DB, use mock data for display
  const displayAppointments = upcomingAppointments.length > 0 ? upcomingAppointments : mockAppointments;
  const displayRequests = rescheduleRequests.length > 0 ? rescheduleRequests : mockRescheduleRequests;

  return (
    <DashboardLayout>
      <Tabs defaultValue="request" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="request">Request Reschedule</TabsTrigger>
          <TabsTrigger value="history">Reschedule History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="request">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Request Reschedule</CardTitle>
              <CardDescription>
                Submit a request to change the date and time of an upcoming appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">
                  <p>Error loading appointments</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => fetchData()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : displayAppointments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="font-medium">No upcoming appointments found</p>
                  <p className="text-sm mt-1">You don't have any appointments eligible for rescheduling</p>
                </div>
              ) : (
                <RescheduleRequestForm 
                  appointments={displayAppointments} 
                  timeSlots={TIME_SLOTS}
                  onSubmit={handleSubmitReschedule} 
                />
              )}
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Rescheduling Policy</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Reschedule requests submitted at least 48 hours before the scheduled appointment time can 
                      typically be accommodated without any additional charges. Requests made less than 48 hours 
                      in advance will be reviewed on a case-by-case basis and may incur a rescheduling fee.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Reschedule History</CardTitle>
              <CardDescription>
                View status and details of your previous reschedule requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">
                  <p>Error loading reschedule history</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => fetchData()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : displayRequests.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="font-medium">No reschedule requests found</p>
                  <p className="text-sm mt-1">You haven't submitted any reschedule requests yet</p>
                </div>
              ) : (
                <RescheduleHistory requests={displayRequests} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}