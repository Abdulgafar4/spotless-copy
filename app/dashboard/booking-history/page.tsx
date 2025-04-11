"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { BookingHistoryTable } from "@/components/dashboard/bookingHistory/booking-history-table";
import { Loader2, FileText, Search, Filter, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FilterDropdown from "@/components/shared/shared-filter";
import { DATE_OPTIONS, STATUS_OPTIONS } from '@/constants/booking-constant';
import { supabase } from "@/lib/supabaseClient";

interface Booking {
  id: string;
  date: string;
  time: string;
  status: string;
  service_type: string;
  branch: string;
  total_amount?: number;
  payment_status?: string;
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    filterBookings();
  }, [statusFilter, dateFilter, searchTerm, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setBookings(data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch bookings"));
      toast.error("Failed to load booking history");
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (booking) => booking.status.toLowerCase() === statusFilter
      );
    }
    
    // Filter by date
    if (dateFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.date);
        bookingDate.setHours(0, 0, 0, 0);
        
        if (dateFilter === "today") {
          return bookingDate.getTime() === today.getTime();
        } else if (dateFilter === "tomorrow") {
          return bookingDate.getTime() === tomorrow.getTime();
        } else if (dateFilter === "this-week") {
          return bookingDate >= today && bookingDate < nextWeek;
        }
        return true;
      });
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.id.toLowerCase().includes(term) ||
          booking.service_type.toLowerCase().includes(term) ||
          booking.branch.toLowerCase().includes(term)
      );
    }
    
    setFilteredBookings(filtered);
  };

  // For UI demonstration purposes
  const mockBookings: Booking[] = [
    {
      id: "BKG12345",
      date: "2024-07-10",
      time: "10:30 AM",
      status: "completed",
      service_type: "Move-Out Cleaning",
      branch: "Toronto Downtown",
      total_amount: 350,
      payment_status: "paid"
    },
    {
      id: "BKG12346",
      date: "2024-06-25",
      time: "2:00 PM",
      status: "cancelled",
      service_type: "Carpet Cleaning",
      branch: "North York",
      total_amount: 225,
      payment_status: "refunded"
    },
    {
      id: "BKG12347",
      date: "2024-06-15",
      time: "1:00 PM",
      status: "completed",
      service_type: "Deep Cleaning",
      branch: "Mississauga",
      total_amount: 450,
      payment_status: "paid"
    },
    {
      id: "BKG12348",
      date: "2024-06-05",
      time: "9:00 AM",
      status: "completed",
      service_type: "Window Cleaning",
      branch: "Etobicoke",
      total_amount: 275,
      payment_status: "paid"
    },
    {
      id: "BKG12349",
      date: "2024-05-20",
      time: "11:00 AM",
      status: "cancelled",
      service_type: "Move-In Cleaning",
      branch: "Toronto Downtown",
      total_amount: 350,
      payment_status: "refunded"
    }
  ];

  // If no bookings from DB, use mock data for display
  const displayBookings = bookings.length > 0 ? filteredBookings : mockBookings;
  
  // Calculate pagination
  const totalPages = Math.ceil(displayBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = displayBookings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <DashboardLayout>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Booking History</CardTitle>
          <CardDescription>
            View all your past and upcoming bookings
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by ID or service..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-col sm:flex-row">
              <FilterDropdown
                label="Status"
                options={STATUS_OPTIONS.map(option => option.label)}
                onSelect={(filter) => {
                  const status = STATUS_OPTIONS.find(option => option.label === filter)?.value || "all";
                  setStatusFilter(status);
                }}
              />
              <FilterDropdown
                label="Date"
                options={DATE_OPTIONS.map(option => option.label)}
                onSelect={(filter) => {
                  const date = DATE_OPTIONS.find(option => option.label === filter)?.value || "all";
                  setDateFilter(date);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              <p>Error loading booking history</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => fetchBookings()}
              >
                Try Again
              </Button>
            </div>
          ) : displayBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="font-medium">No booking history found</p>
              <p className="text-sm mt-1">You haven't made any bookings yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <BookingHistoryTable bookings={paginatedBookings} />
            </div>
          )}
        </CardContent>
        {displayBookings.length > itemsPerPage && (
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, displayBookings.length)}
              </span>{" "}
              of <span className="font-medium">{displayBookings.length}</span> bookings
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </DashboardLayout>
  );
}