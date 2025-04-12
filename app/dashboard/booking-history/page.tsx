"use client";

import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useClientBookings } from "@/hooks/use-client-bookings";
import { Loader2, FileText } from "lucide-react";

import { STATUS_OPTIONS, DATE_OPTIONS } from '@/constants/booking-constant';
import { BookingErrorState } from "@/components/dashboard/bookingHistory/booking-error-state";
import { BookingEmptyState } from "@/components/dashboard/bookingHistory/booking-empty-state";
import { BookingHistoryTable } from "@/components/dashboard/bookingHistory/booking-history-table";
import { BookingPagination } from "@/components/dashboard/bookingHistory/booking-pagination";
import { BookingFilters } from "@/components/dashboard/bookingHistory/booking-filters";

export default function BookingHistoryPage() {
  const {
    paginatedBookings,
    filteredBookings,
    loading,
    error,
    filters,
    pagination,
    setStatusFilter,
    setDateFilter,
    setSearchTerm,
    setCurrentPage,
    fetchBookings
  } = useClientBookings(5); // Show 5 items per page

  // Handle filter changes
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleDateChange = (date: string) => {
    setDateFilter(date);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when search changes
  };

  return (
    <DashboardLayout>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Booking History</CardTitle>
          <CardDescription>
            View all your past and upcoming bookings
          </CardDescription>
          
          <BookingFilters
            statusOptions={STATUS_OPTIONS}
            dateOptions={DATE_OPTIONS}
            currentStatusFilter={filters.status}
            currentDateFilter={filters.dateRange || "all"}
            currentSearchTerm={filters.searchTerm || ""}
            onStatusChange={handleStatusChange}
            onDateChange={handleDateChange}
            onSearch={handleSearch}
          />
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : error ? (
            <BookingErrorState onRetry={fetchBookings} />
          ) : filteredBookings.length === 0 ? (
            <BookingEmptyState />
          ) : (
            <div className="overflow-x-auto">
              <BookingHistoryTable bookings={paginatedBookings} />
            </div>
          )}
        </CardContent>
        
        {filteredBookings.length > pagination.itemsPerPage && (
          <CardFooter>
            <BookingPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              startItem={pagination.startIndex + 1}
              endItem={pagination.endIndex + 1}
              totalItems={filteredBookings.length}
              onPageChange={setCurrentPage}
            />
          </CardFooter>
        )}
      </Card>
    </DashboardLayout>
  );
}