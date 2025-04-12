"use client";

import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar } from "lucide-react";
import { useClientAppointments } from "@/hooks/use-client-appointments";
import { AppointmentFilter } from "@/components/dashboard/appointments/appointment-filter";
import { AppointmentErrorState } from "@/components/dashboard/appointments/appointment-error-state";
import { AppointmentEmptyState } from "@/components/dashboard/appointments/appointment-empty-state";
import { AppointmentList } from "@/components/dashboard/appointments/appointment-list";

export default function AppointmentsPage() {
  const { 
    filteredAppointments, 
    loading, 
    error, 
    statusFilter, 
    setStatusFilter,
    fetchAppointments
  } = useClientAppointments();

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
            <AppointmentFilter
              currentFilter={statusFilter} 
              onFilterChange={setStatusFilter} 
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
            <AppointmentErrorState onRetry={fetchAppointments} />
          ) : filteredAppointments.length === 0 ? (
            <AppointmentEmptyState />
          ) : (
            <AppointmentList appointments={filteredAppointments} />
          )}
        </CardContent>
        
        {filteredAppointments.length > 0 && (
          <CardFooter className="flex justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredAppointments.length} appointment(s)
            </p>
          </CardFooter>
        )}
      </Card>
    </DashboardLayout>
  );
}