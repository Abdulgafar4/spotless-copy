"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  Search,
  Filter,
  Mail,
  Phone,
  User,
  Calendar,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Clock,
  Eye,
  MessageCircle,
  Loader2,
  AlertTriangle,
  Shield
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import AdminLayout from "@/components/admin/admin-layout"
import { InquiryDetailsDialog } from "@/components/admin/inquiries/inquiryDetails"
import { useAdminInquiries } from "@/hooks/use-inquiries"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConfirmActionDialog } from "./confirm-action"

export default function InquiriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTab, setCurrentTab] = useState("all")
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ 
    action: string; 
    inquiryId: string;
    title: string; 
    description: string 
  }>({ 
    action: "", 
    inquiryId: "",
    title: "", 
    description: "" 
  })
  
  const itemsPerPage = 10

  // Use our custom hook to fetch and manage inquiries
  const { 
    inquiries, 
    loading, 
    error, 
    fetchInquiries, 
    updateInquiry,
    isAuthorized 
  } = useAdminInquiries()

  // Filter inquiries based on search term and current tab
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentTab === "all") return matchesSearch;
    return matchesSearch && inquiry.status === currentTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedInquiries = filteredInquiries.slice(startIndex, startIndex + itemsPerPage)

  // Open inquiry details
  const handleViewInquiry = (inquiry: any) => {
    setSelectedInquiry(inquiry)
    setIsDetailsDialogOpen(true)
  }
  
  // Handle bulk actions
  const handleMarkAsResolved = () => {
    const selectedIds = filteredInquiries
      .filter(inquiry => inquiry.status !== "resolved")
      .map(inquiry => inquiry.id);
    
    if (selectedIds.length === 0) return;
    
    setConfirmAction({
      action: "resolve-bulk",
      inquiryId: "",
      title: "Mark Inquiries as Resolved",
      description: `Are you sure you want to mark ${selectedIds.length} inquiries as resolved?`
    });
    setIsConfirmDialogOpen(true);
  }
  
  // Handle single inquiry actions from dropdown
  const handleInquiryAction = (action: string, inquiry: any) => {
    let title = "";
    let description = "";
    
    switch (action) {
      case "resolve":
        title = "Mark as Resolved";
        description = `Are you sure you want to mark this inquiry from ${inquiry.name} as resolved?`;
        break;
      case "urgent":
        title = "Flag as Urgent";
        description = `Are you sure you want to flag this inquiry from ${inquiry.name} as urgent?`;
        break;
      case "archive":
        title = "Archive Inquiry";
        description = `Are you sure you want to archive this inquiry from ${inquiry.name}? This will remove it from the active list.`;
        break;
    }
    
    setConfirmAction({
      action,
      inquiryId: inquiry.id,
      title,
      description
    });
    setIsConfirmDialogOpen(true);
  }
  
  // Handle confirmation actions
  const handleConfirmAction = async () => {
    try {
      if (confirmAction.action === "resolve-bulk") {
        // Handle bulk resolve
        const updates = filteredInquiries
          .filter(inquiry => inquiry.status !== "resolved")
          .map(inquiry => updateInquiry(inquiry.id, { status: "resolved" }));
        
        await Promise.all(updates);
      } else if (confirmAction.inquiryId) {
        // Handle single inquiry action
        const newStatus = confirmAction.action === "resolve" 
          ? "resolved" 
          : confirmAction.action === "urgent" 
            ? "urgent" 
            : confirmAction.action === "archive" 
              ? "archived" 
              : "";
        
        if (newStatus) {
          await updateInquiry(confirmAction.inquiryId, { status: newStatus });
        }
      }
      
      // Refresh data
      fetchInquiries();
      
    } catch (err) {
      console.error("Error performing action:", err);
    } finally {
      setIsConfirmDialogOpen(false);
    }
  }

  // Calculate counts for each status
  const countByStatus = inquiries.reduce((acc, inquiry) => {
    const status = inquiry.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">New</Badge>
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Urgent</Badge>
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Archived</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (!isAuthorized) {
    return (
      <AdminLayout>
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access the customer inquiries page.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col gap-8 md:flex-row justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Customer Inquiries</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleMarkAsResolved}>
              <Check className="mr-2 h-4 w-4" />
              Mark as Resolved
            </Button>
            <Button variant="outline">
              <MessageCircle className="mr-2 h-4 w-4" />
              Send Response
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="py-4">
              <CardTitle className="text-blue-700 text-lg">New</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{countByStatus.new || 0}</div>
              <p className="text-sm text-blue-600">Unassigned inquiries</p>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="py-4">
              <CardTitle className="text-yellow-700 text-lg">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{countByStatus['in-progress'] || 0}</div>
              <p className="text-sm text-yellow-600">Being handled</p>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 border-red-200">
            <CardHeader className="py-4">
              <CardTitle className="text-red-700 text-lg">Urgent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{countByStatus.urgent || 0}</div>
              <p className="text-sm text-red-600">Need immediate attention</p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="py-4">
              <CardTitle className="text-green-700 text-lg">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{countByStatus.resolved || 0}</div>
              <p className="text-sm text-green-600">Successfully completed</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Inquiries</CardTitle>
                <CardDescription>
                  Manage customer questions, requests, and feedback
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search inquiries..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCurrentTab("all")}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentTab("new")}>New</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentTab("in-progress")}>In Progress</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentTab("urgent")}>Urgent</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentTab("resolved")}>Resolved</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentTab("archived")}>Archived</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-lg">Loading inquiries...</span>
              </div>
            ) : error ? (
              <Alert variant="destructive" className="my-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load inquiries. Please try refreshing the page.
                </AlertDescription>
              </Alert>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInquiries.length > 0 ? (
                    paginatedInquiries.map((inquiry) => (
                      <TableRow key={inquiry.id} className="whitespace-nowrap">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {inquiry.full_name.split(' ').map(name => name[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{inquiry.full_name}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {inquiry.email}
                              </div>
                              {inquiry.phone && (
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Phone className="h-3 w-3" /> {inquiry.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{inquiry.subject}</div>
                          <div className="text-sm text-gray-500 truncate max-w-[250px]">
                            {inquiry.message.length > 60 
                              ? `${inquiry.message.substring(0, 60)}...` 
                              : inquiry.message}
                          </div>
                          <div className="text-xs text-gray-500">
                            {inquiry.responses && inquiry.responses.length > 0 ? (
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {inquiry.responses.length} response{inquiry.responses.length > 1 ? 's' : ''}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(inquiry.date), "MMM d, yyyy")}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {format(new Date(inquiry.date), "h:mm a")}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                        <TableCell>
                          {inquiry.assignedTo ? (
                            <div className="text-sm">{inquiry.assignedTo}</div>
                          ) : (
                            <div className="text-sm text-gray-500">Unassigned</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewInquiry(inquiry)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewInquiry(inquiry)}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>Assign to Staff</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleInquiryAction("resolve", inquiry)}>
                                  Mark as Resolved
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleInquiryAction("urgent", inquiry)}>
                                  Flag as Urgent
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleInquiryAction("archive", inquiry)}
                                  className="text-red-600"
                                >
                                  Archive
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Mail className="h-10 w-10 mb-2" />
                          <h3 className="text-lg font-medium">No inquiries found</h3>
                          <p className="text-sm">
                            {searchTerm || currentTab !== "all"
                              ? "Try adjusting your search terms or filters" 
                              : "All customer inquiries will appear here"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
          {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredInquiries.length)}
                </span>{" "}
                of <span className="font-medium">{filteredInquiries.length}</span> inquiries
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

      <InquiryDetailsDialog
        isOpen={isDetailsDialogOpen}
        setIsOpen={setIsDetailsDialogOpen}
        inquiry={selectedInquiry}
        onInquiryUpdated={() => fetchInquiries()}
      />

      <ConfirmActionDialog
        isOpen={isConfirmDialogOpen}
        setIsOpen={setIsConfirmDialogOpen}
        title={confirmAction.title}
        description={confirmAction.description}
        onConfirm={handleConfirmAction}
      />
    </AdminLayout>
  )
}