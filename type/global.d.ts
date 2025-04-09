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
  email?: string;
  phone?: string;
  branch_id: string;
  role: string;
  status: "active" | "inactive";
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
  id: string;
  customer_id: string;
  employee_id: string;
  branch_id: string;
  appointment_date: Date;
  start_time: string;
  end_time: string;
  service_type: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  created_at: Date;
  updated_at?: Date;
  customers?: Customer;
  employees?: Employee;
  branches?: Branch;
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
