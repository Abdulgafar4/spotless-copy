"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { AppointmentCard } from "@/components/dashboard/appointments/appointment-card";
import { Loader2, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FilterDropdown from "@/components/shared/shared-filter";
import { supabase } from "@/lib/supabaseClient";

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  address: string;
  service_type: string;
  branch: string;
  notes?: string;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  useEffect(() => {
    filterAppointments();
  }, [statusFilter, appointments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setAppointments(data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch appointments"));
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    if (statusFilter === "all") {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(
        appointments.filter((appointment) => appointment.status === statusFilter)
      );
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
      branch: "Toronto Downtown",
      notes: "Please bring extra supplies for kitchen deep clean"
    },
    {
      id: "APT12346",
      title: "Carpet Cleaning",
      date: "2024-07-20",
      time: "2:00 PM",
      status: "pending",
      address: "456 Queen St, Toronto, ON",
      service_type: "Carpet Cleaning",
      branch: "North York",
      notes: "Pet stains in living room area"
    }
  ];

  // If no appointments from DB, use mock data for display
  const displayAppointments = appointments.length > 0 ? filteredAppointments : mockAppointments;

  return (
    <DashboardLayout>
      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">Upcoming Appointments</CardTitle>
            <CardDescription>
              View and manage your scheduled cleaning services
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <FilterDropdown
              label="Filter by Status"
              options={["all", "confirmed", "pending", "cancelled"]}
              onSelect={(filter) => setStatusFilter(filter.toLowerCase())}
            />
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={fetchAppointments}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
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
                onClick={() => fetchAppointments()}
              >
                Try Again
              </Button>
            </div>
          ) : displayAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="font-medium">No appointments found</p>
              <p className="text-sm mt-1">You don't have any upcoming appointments</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </CardContent>
        {displayAppointments.length > 0 && (
          <CardFooter className="flex justify-between">
            <p className="text-sm text-gray-500">
              Showing {displayAppointments.length} appointment(s)
            </p>
          </CardFooter>
        )}
      </Card>
    </DashboardLayout>
  );
}