"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { usePathname } from "next/navigation";
import { AppointmentCard } from "@/components/dashboard/overview/AppointmentCard";
import { QuickBooking } from "@/components/dashboard/overview/QuickBooking";
import { BookingHistoryTable } from "@/components/dashboard/overview/BookingHistory";
import { useClientAppointments } from "@/hooks/use-client-appointments";
import { useRouter } from "next/navigation";
import { useClientServices } from "@/hooks/use-client-service";
import { useClientBookings } from "@/hooks/use-client-bookings";

interface Booking {
  id: string;
  date: string;
  refId: string;
  status: "Finished" | "Upcoming" | "Canceled" | "Waiting Approval";
}

export default function DashboardPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { appointments, loading } = useClientAppointments();
  const { services, branches, submitBooking, loading: servicesLoading } = useClientServices();
  const { paginatedBookings } = useClientBookings(10); 

  // Filter for upcoming appointments
  const upcomingAppointments = appointments
    .filter(apt => apt.status === "confirmed" && new Date(apt.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2); // Get first 2 appointments to match your sample data
  
  // Format for AppointmentCard component
  const formattedAppointments = upcomingAppointments.map((apt, index) => ({
    id: parseInt(apt.id),
    title: apt.service_type || `Appointment ${index + 1}`,
    date: new Date(apt.date).toLocaleDateString('en-US', {
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    }),
    time: new Date(apt.date).toLocaleTimeString('en-US', {
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true
    }),
  }));

  // Format booking history from appointments
  const bookingHistory: Booking[] = paginatedBookings
    .slice(0, 5)
    .map(apt => {
      // Map the appointment status to one of the three required status types
      let status: "Finished" | "Upcoming" | "Canceled" | "Waiting Approval";
      if (apt.status === "completed") {
        status = "Finished";
      } else if (apt.status === "confirmed") {
        status = "Upcoming";
      }else if (apt.status === "pending") {
        status = "Waiting Approval";
      } else {
        status = "Canceled";
      }
      
      return {
        id: apt.id,
        date: new Date(apt.date).toLocaleDateString('en-US', { 
          day: 'numeric',
          month: 'short',
          hour: 'numeric', 
          minute: 'numeric',
          hour12: true
        }),
        status: status,
        refId: apt.reference_number
      };
    });

  return (
    <DashboardLayout>
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">UPCOMING APPOINTMENTS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 text-center py-4">Loading appointments...</div>
          ) : formattedAppointments.length > 0 ? (
            formattedAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <div className="col-span-2 text-center py-4">
              No upcoming appointments found.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        {/* Import the QuickBooking component */}
        <QuickBooking 
          services={services}
          branches={branches}
          submitBooking={submitBooking}
          loading={servicesLoading}
        />
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4 max-h-lg">
        <div className="bg-white p-6 rounded-lg shadow-lg flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Booking History</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/dashboard/booking-history")}
            >
              VIEW ALL
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-4">Loading booking history...</div>
          ) : (
            <BookingHistoryTable bookings={bookingHistory} />
          )}
        </div>

        <div className="hidden lg:flex relative h-64 w-full lg:w-64 lg:h-full min-h-[400px]">
          <Image
            src="/assets/service/Banner.png"
            alt="More cleaning services"
            fill
            className="rounded-lg object-cover"
          />
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}