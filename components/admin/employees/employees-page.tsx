"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  Search,
  UserPlus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  UserCog,
  Award,
  Download,
  MessageSquare,
  Clock,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import AdminLayout from "@/components/admin/admin-layout"
import { mockEmployees } from "../adminDummyData"
import { EmployeeDetailsDialog } from "./employee-details"
import { AddEmployeeDialog } from "./add-employee"
import { ConfirmActionDialog } from "./confirm-action"
import { MessageEmployeeDialog } from "./message-employee"
import { AssignRoleDialog } from "./assign-role"


export default function EmployeesPage() {
  const [employees, setEmployees] = useState(mockEmployees)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [branchFilter, setBranchFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ action: string; title: string; description: string }>({ 
    action: "", title: "", description: "" 
  })
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [isAssignRoleDialogOpen, setIsAssignRoleDialogOpen] = useState(false)
  
  const itemsPerPage = 8

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    // Search filter
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone.includes(searchTerm);
    
    // Role filter
    const matchesRole = roleFilter === "all" || employee.role === roleFilter;
    
    // Branch filter
    const matchesBranch = branchFilter === "all" || employee.branch === branchFilter;
    
    // Status filter
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesBranch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage)

  // Action handlers
  const handleViewEmployee = (employee: any) => {
    setSelectedEmployee(employee)
    setIsDetailsDialogOpen(true)
  }

  const handleAddNewEmployee = (newEmployee: any) => {
    const id = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1
    const today = new Date().toISOString().split('T')[0]
    
    const employeeToAdd = {
      ...newEmployee,
      id,
      hireDate: today,
      completedJobs: 0,
      rating: 0,
      status: "probation"
    }
    
    setEmployees([...employees, employeeToAdd])
    setIsAddDialogOpen(false)
  }

  const handleUpdateStatus = (employee: any, newStatus: string) => {
    let actionTitle = "";
    let actionDescription = "";
    
    switch(newStatus) {
      case "active":
        actionTitle = "Activate Employee";
        actionDescription = `Are you sure you want to change ${employee.firstName} ${employee.lastName}'s status to active?`;
        break;
      case "inactive":
        actionTitle = "Deactivate Employee";
        actionDescription = `Are you sure you want to deactivate ${employee.firstName} ${employee.lastName}? They will no longer be assigned to new jobs.`;
        break;
      case "terminated":
        actionTitle = "Terminate Employee";
        actionDescription = `Are you sure you want to terminate ${employee.firstName} ${employee.lastName}? This action will remove them from all scheduled jobs.`;
        break;
    }
    
    setSelectedEmployee(employee)
    setConfirmAction({ 
      action: newStatus, 
      title: actionTitle, 
      description: actionDescription 
    })
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmAction = () => {
    // Process the status change
    const updatedEmployees = employees.map(employee => {
      if (employee.id === selectedEmployee.id) {
        return { 
          ...employee, 
          status: confirmAction.action
        };
      }
      return employee;
    });
    
    setEmployees(updatedEmployees)
    setIsConfirmDialogOpen(false)
  }

  const handleAssignRole = (employee: any) => {
    setSelectedEmployee(employee)
    setIsAssignRoleDialogOpen(true)
  }

  const handleRoleAssignment = (newRole: string, newBranch: string) => {
    // Update the employee with new role and branch
    const updatedEmployees = employees.map(employee => {
      if (employee.id === selectedEmployee.id) {
        return { 
          ...employee, 
          role: newRole,
          branch: newBranch
        };
      }
      return employee;
    });
    
    setEmployees(updatedEmployees)
    setIsAssignRoleDialogOpen(false)
  }

  const handleMessageEmployee = (employee: any) => {
    setSelectedEmployee(employee)
    setIsMessageDialogOpen(true)
  }

  const handleSendMessage = (message: string) => {
    // In a real app, this would send a message to the employee
    console.log(`Sending message to ${selectedEmployee.firstName} ${selectedEmployee.lastName}:`, message);
    setIsMessageDialogOpen(false);
  }

  // Helper to format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy")
  }

  // Helper to get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case "probation":
        return <Badge className="bg-yellow-100 text-yellow-800">Probation</Badge>
      case "terminated":
        return <Badge className="bg-red-100 text-red-800">Terminated</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Count employees by status
  const countByStatus = employees.reduce((acc, employee) => {
    acc[employee.status] = (acc[employee.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get unique roles
  const roles = Array.from(new Set(employees.map(e => e.role)));
  
  // Get unique branches
  const branches = Array.from(new Set(employees.map(e => e.branch)));

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6 mt-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
          <div className="flex gap-4">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Roster
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{employees.length}</div>
              <p className="text-sm text-gray-500">Across all branches</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{countByStatus.active || 0}</div>
              <p className="text-sm text-gray-500">Currently working</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">On Probation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{countByStatus.probation || 0}</div>
              <p className="text-sm text-gray-500">New hires</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{(countByStatus.inactive || 0) + (countByStatus.terminated || 0)}</div>
              <p className="text-sm text-gray-500">Currently unavailable</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col xl:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle>Employee Directory</CardTitle>
                <CardDescription>
                  View and manage all staff members
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search employees..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select
                    value={roleFilter}
                    onValueChange={setRoleFilter}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={branchFilter}
                    onValueChange={setBranchFilter}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map(branch => (
                        <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="probation">Probation</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Jobs</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.length > 0 ? (
                    paginatedEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>
                                {employee.firstName[0]}{employee.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {employee.firstName} {employee.lastName}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {employee.email}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {employee.phone}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{employee.role}</TableCell>
                        <TableCell>{employee.branch}</TableCell>
                        <TableCell>{getStatusBadge(employee.status)}</TableCell>
                        <TableCell>{employee.completedJobs}</TableCell>
                        <TableCell>
                          {employee.rating > 0 ? (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{employee.rating.toFixed(1)}</span>
                              <Progress value={employee.rating * 20} className="h-2 w-16" />
                            </div>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewEmployee(employee)}
                            >
                              View
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                
                                <DropdownMenuItem onClick={() => handleViewEmployee(employee)}>
                                  <UserCog className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem onClick={() => handleAssignRole(employee)}>
                                  <Award className="mr-2 h-4 w-4" />
                                  Change Role/Branch
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem onClick={() => handleMessageEmployee(employee)}>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Send Message
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                {employee.status !== "active" && (
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(employee, "active")}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                    Activate Employee
                                  </DropdownMenuItem>
                                )}
                                
                                {employee.status === "active" && (
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(employee, "inactive")}>
                                    <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                                    Set as Inactive
                                  </DropdownMenuItem>
                                )}
                                
                                {employee.status !== "terminated" && (
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(employee, "terminated")}>
                                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                    Terminate Employee
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <UserCog className="h-10 w-10 mb-2" />
                          <h3 className="text-lg font-medium">No employees found</h3>
                          <p className="text-sm">
                            {searchTerm || roleFilter !== "all" || branchFilter !== "all" || statusFilter !== "all"
                              ? "Try adjusting your search or filters"
                              : "Add your first employee to get started"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredEmployees.length)}
                </span>{" "}
                of <span className="font-medium">{filteredEmployees.length}</span> employees
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
      </div>

      <EmployeeDetailsDialog
        isOpen={isDetailsDialogOpen}
        setIsOpen={setIsDetailsDialogOpen}
        employee={selectedEmployee}
        onAssignRole={handleAssignRole}
        onUpdateStatus={handleUpdateStatus}
        onMessageEmployee={handleMessageEmployee}
      />

      <AddEmployeeDialog
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        onAdd={handleAddNewEmployee}
        branches={branches}
      />

      <ConfirmActionDialog
        isOpen={isConfirmDialogOpen}
        setIsOpen={setIsConfirmDialogOpen}
        title={confirmAction.title}
        description={confirmAction.description}
        onConfirm={handleConfirmAction}
      />

      <MessageEmployeeDialog
        isOpen={isMessageDialogOpen}
        setIsOpen={setIsMessageDialogOpen}
        employee={selectedEmployee}
        onSendMessage={handleSendMessage}
      />

      <AssignRoleDialog
        isOpen={isAssignRoleDialogOpen}
        setIsOpen={setIsAssignRoleDialogOpen}
        employee={selectedEmployee}
        roles={roles}
        branches={branches}
        onAssign={handleRoleAssignment}
      />
    </AdminLayout>
  )}