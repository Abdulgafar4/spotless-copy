"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Clock, CalendarClock, MapPin, Building } from "lucide-react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { usePathname } from "next/navigation";
import { AppointmentCard } from "@/components/dashboard/overview/AppointmentCard";
import { FormSelectWithIcon } from "@/components/dashboard/overview/FormWithIcon";
import { InputWithIcon } from "@/components/dashboard/overview/InputWithIcon";
import { CalendarComponent } from "@/components/dashboard/overview/Calendar";
import { BookingHistoryTable } from "@/components/dashboard/overview/BookingHistory";
import { useClientAppointments } from "@/hooks/use-client-appointments";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useClientServices } from "@/hooks/use-client-service";
import { toast } from "sonner";

interface BookingData {
  service: string;
  city: string;
  address: string;
  postalCode: string;
  branch: string;
  date: string;
}

interface ErrorData {
  service?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  branch?: string;
  date?: string;
}

interface Booking {
  id: string;
  date: string;
  status: "Finished" | "Upcoming" | "Canceled";
}

const bookingSchema = z.object({
  service: z.string().nonempty("Service is required"),
  city: z.string().nonempty("City is required"),
  address: z.string().nonempty("Address is required"),
  postalCode: z.string().nonempty("Postal code is required"),
  branch: z.string().nonempty("Nearest branch is required"),
  date: z.string().nonempty("Date is required"),
});

export default function DashboardPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { appointments, loading } = useClientAppointments();
  const { services, branches, submitBooking, loading: servicesLoading } = useClientServices();

  
  const [bookingData, setBookingData] = useState<BookingData>({
    service: "",
    city: "",
    address: "",
    postalCode: "",
    branch: "",
    date: "",
  });
  const [errors, setErrors] = useState<ErrorData>({});
  const [submitting, setSubmitting] = useState(false);


  const handleInputChange = (field: keyof BookingData, value: string) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = bookingSchema.safeParse(bookingData);
    if (!result.success) {
      const newErrors = result.error.format();
      setErrors(
        Object.keys(newErrors).reduce((acc: ErrorData, key) => {
          const typedKey = key as keyof ErrorData;
          const error = newErrors[key as keyof typeof newErrors];

          if (Array.isArray(error)) {
            acc[typedKey] = error[0];
          } else if (error?._errors) {
            acc[typedKey] = error._errors[0];
          }

          return acc;
        }, {})
      );
      return;
    }

    setSubmitting(true);
    try {
      // Submit booking using client services hook
      const success = await submitBooking(bookingData);
      if (success) {
        toast.success("Booking submitted successfully!");
        // Reset form
        setBookingData({
          service: "",
          city: "",
          address: "",
          postalCode: "",
          branch: "",
          date: "",
        });
        // Redirect to appointments page
        router.push("/dashboard/appointments");
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast.error("Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  };

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
    time: apt.time
  }));

  // Format booking history from appointments
  const bookingHistory: Booking[] = appointments
    .slice(0, 3)
    .map(apt => {
      // Map the appointment status to one of the three required status types
      let status: "Finished" | "Upcoming" | "Canceled";
      if (apt.status === "completed") {
        status = "Finished";
      } else if (apt.status === "confirmed") {
        status = "Upcoming";
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
        status: status
      };
    });
  // Create service options from real services data
  const serviceOptions = services.map(service => ({
    value: service.id,
    label: service.name
  }));

  // Create branch options from real branches data
  const branchOptions = branches.map(branch => ({
    value: branch.id,
    label: branch.name
  }));

  console.log(branchOptions)


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
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-10 mt-2">QUICK BOOKING</h2>
            <FormSelectWithIcon
              icon={<CalendarClock className="h-5 w-5" />}
              placeholder="Select Service"
              options={serviceOptions}
              onChange={(value: any) => handleInputChange("service", value)}
              error={errors.service}
            />

            <FormSelectWithIcon
              icon={<MapPin className="h-5 w-5" />}
              placeholder="Select City"
              options={branchOptions}
              onChange={(value: any) => handleInputChange("city", value)}
              error={errors.city}
            />

            <InputWithIcon
              icon={<MapPin className="h-5 w-5" />}
              placeholder="Address Street"
              onChange={(e: any) => handleInputChange("address", e.target.value)}
              error={errors.address}
            />

            <InputWithIcon
              icon={<Clock className="h-5 w-5" />}
              placeholder="Postal Code"
              onChange={(e: any) => handleInputChange("postalCode", e.target.value)}
              error={errors.postalCode}
            />

            <FormSelectWithIcon
              icon={<Building className="h-5 w-5" />}
              placeholder="Nearest Branch"
              options={branchOptions}
              onChange={(value: any) => handleInputChange("branch", value)}
              error={errors.branch}
            />

            <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white">
              BOOK NOW
            </Button>
          </div>
          <CalendarComponent 
            onSelectDate={(date: string) => handleInputChange("date", date)} 
          />
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 max-h-lg">
        <div className="bg-white p-6 rounded-lg shadow-lg flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Booking History</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/dashboard/appointments")}
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