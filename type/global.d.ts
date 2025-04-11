type BranchStatus = "active" | "inactive" | "pending";

interface StatusBadgeProps {
  status: BranchStatus;
}
interface Branch {
  id: any;
  name: string;
  address: string;
  phone: string;
  manager: string;
  status: BranchStatus;
  employees: number;
  opendate: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  branch_id: string;
  role: string;
  status: "active" | "inactive" | any;
  auth_id?: string;
  created_at: Date;
  updated_at?: Date;
  branches?: Branch;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  created_at: Date;
  updated_at?: Date;
}

interface Appointment {
  id: number
  date: string
  time: string
  title: string
  customer: string
  phone: string
  branch: string
  address: string
  status: 'confirmed' | 'pending' | 'cancelled'
  duration: string
  staff: string[]
}

interface AppointmentFilters {
  date_from?: string;
  date_to?: string;
  status?: string;
  branch_id?: string;
  employee_id?: string;
}

interface EmployeeFilters {
  branch_id?: string;
  status?: string;
  role?: string;
}

// Types
interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  service: string;
  branch: string;
  date: string;
  duration: string;
  status: string;
  assignedStaff?: string[];
  amount: number;
  address: string;
  modified?: string;
}

interface StatusBadge {
  bg: string;
  text: string;
  label: string;
}

interface StatusOption {
  value: string;
  label: string;
}

interface BookingAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action: () => void;
}

interface ConfirmAction {
  action: string;
  title: string;
  description: string;
}

interface BookingFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  branchFilter: string;
  setBranchFilter: (filter: string) => void;
}

interface BookingActionsProps {
  booking: Booking;
  onViewBooking: (booking: Booking) => void;
  onUpdateStatus: (booking: Booking, status: string) => void;
  onAssignStaff: (booking: Booking) => void;
  onMessageCustomer: (booking: Booking) => void;
}

interface BookingRowProps extends BookingActionsProps {
  booking: Booking;
}

interface BookingsTableProps {
  paginatedBookings: Booking[];
  filteredBookings: Booking[];
  onViewBooking: (booking: Booking) => void;
  onUpdateStatus: (booking: Booking, status: string) => void;
  onAssignStaff: (booking: Booking) => void;
  onMessageCustomer: (booking: Booking) => void;
  searchTerm: string;
  statusFilter: string;
  dateFilter: string;
  branchFilter: string;
}

interface BookingOverviewCardsProps {
  bookings: Booking[];
  upcomingBookings: number;
  todayBookings: number;
  countByStatus: Record<string, number>;
}

type ServiceStatus = "active" | "inactive" | "seasonal";

interface ServiceStatusBadgeProps {
  status: ServiceStatus;
}

interface Service {
  id: any;
  name: string;
  description: string;
  duration: string;
  price: string;
  category: string;
  status: ServiceStatus;
  staffRequired: string;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string;
}