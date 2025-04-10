import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { BookingRow } from "./booking-row"
import { Calendar } from "lucide-react"

export const BookingsTable: React.FC<BookingsTableProps> = ({ 
    paginatedBookings, 
    filteredBookings, 
    onViewBooking, 
    onUpdateStatus, 
    onAssignStaff, 
    onMessageCustomer,
    searchTerm,
    statusFilter,
    dateFilter,
    branchFilter
  }) => (
    <div className="rounded-md border overflow-x-auto"> {/* Added overflow-x-auto for horizontal scrolling */}
    <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            {[
              "Booking ID", "Customer", "Service", "Date & Time", 
              "Status", "Staff", "Amount", "Actions"
            ].map(header => (
              <TableHead key={header} className="px-6 py-4 whitespace-nowrap"> 
                {header === "Actions" ? <span className="text-right">{header}</span> : header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedBookings.length > 0 ? (
            paginatedBookings.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                onViewBooking={onViewBooking}
                onUpdateStatus={onUpdateStatus}
                onAssignStaff={onAssignStaff}
                onMessageCustomer={onMessageCustomer}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-8">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <Calendar className="h-10 w-10 mb-2" />
                  <h3 className="text-lg font-medium">No bookings found</h3>
                  <p className="text-sm">
                    {(searchTerm || statusFilter !== "all" || dateFilter !== "all" || branchFilter !== "all")
                      ? "Try adjusting your search or filters"
                      : "No bookings have been created yet"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )