"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Clock, CalendarClock, MapPin, Building } from "lucide-react";
import PageHeader from "@/components/page-header";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { usePathname } from "next/navigation";
import { z } from "zod";
import { AppointmentCard } from "@/components/dashboard/overview/AppointmentCard";
import { FormSelectWithIcon } from "@/components/dashboard/overview/FormWithIcon";
import { InputWithIcon } from "@/components/dashboard/overview/InputWithIcon";
import { CalendarComponent } from "@/components/dashboard/overview/Calendar";
import { BookingHistoryTable } from "@/components/dashboard/overview/BookingHistory";

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
  const [bookingData, setBookingData] = useState<BookingData>({
    service: "",
    city: "",
    address: "",
    postalCode: "",
    branch: "",
    date: "",
  });
  const [errors, setErrors] = useState<ErrorData>({});

  const handleInputChange = (field: keyof BookingData, value: string) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = bookingSchema.safeParse(bookingData);
    if (!result.success) {
      const newErrors = result.error.format();
      setErrors(
        Object.keys(newErrors).reduce((acc: ErrorData, key) => {
          const typedKey = key as keyof ErrorData;
          const error = newErrors[key as keyof typeof newErrors];

          // Check if error is an object with _errors or an array of strings
          if (Array.isArray(error)) {
            acc[typedKey] = error[0];  // If it's an array, use the first error message
          } else if (error?._errors) {
            acc[typedKey] = error._errors[0];  // If it's an object, access _errors
          }

          return acc;
        }, {})
      );
      return;
    }
    console.log("Booking Data Submitted:", bookingData);
  };

  const appointments = [
    { id: 1, title: "Appointment 1", date: "July 15, 2024", time: "10:30AM" },
    { id: 2, title: "Appointment 2", date: "July 16, 2024", time: "2:00PM" },
  ];

  const bookingHistory: Booking[] = [
    { id: "12548796", date: "28 Jan, 12:30 AM", status: "Finished" },
    { id: "12548797", date: "28 Jan, 1:00 PM", status: "Upcoming" },
    { id: "12548798", date: "29 Jan, 10:00 AM", status: "Canceled" },
  ];

  const serviceOptions = [
    { value: "move-out", label: "Move-Out Cleaning" },
    { value: "move-in", label: "Move-In Cleaning" },
    { value: "repairs", label: "Repairs & Maintenance" },
  ];

  const cityOptions = [
    { value: "toronto", label: "Toronto" },
    { value: "ottawa", label: "Ottawa" },
    { value: "kitchener", label: "Kitchener" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">UPCOMING APPOINTMENTS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
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
                options={cityOptions}
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
                options={cityOptions}
                onChange={(value: any) => handleInputChange("branch", value)}
                error={errors.branch}
              />

              <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white">
                BOOK NOW
              </Button>
            </div>
            <CalendarComponent onSelectDate={(date: any) => handleInputChange("date", date)} />
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 max-h-lg">
          <div className="bg-white p-6 rounded-lg shadow-lg flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Booking History</h2>
              <Button variant="outline" size="sm">
                VIEW ALL
              </Button>
            </div>
            <BookingHistoryTable bookings={bookingHistory} />
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