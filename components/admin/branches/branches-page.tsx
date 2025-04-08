"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AddBranchDialog } from "@/components/admin/branches/addBranch"
import { DeleteConfirmDialog } from "@/components/admin/branches/deleteConfirm"
import AdminLayout from "@/components/admin/admin-layout"

// Mock branches data
const initialBranches = [
  { 
    id: 1, 
    name: "Toronto Downtown", 
    address: "123 Queen Street West, Toronto, ON", 
    phone: "416-555-0100", 
    manager: "John Smith", 
    status: "active",
    employees: 12,
    openDate: "2022-03-15"
  },
  { 
    id: 2, 
    name: "Mississauga", 
    address: "456 Burnhamthorpe Road, Mississauga, ON", 
    phone: "905-555-0200", 
    manager: "Sarah Johnson", 
    status: "active",
    employees: 8,
    openDate: "2022-05-22"
  },
  { 
    id: 3, 
    name: "North York", 
    address: "789 Yonge Street, North York, ON", 
    phone: "416-555-0300", 
    manager: "Michael Wong", 
    status: "active",
    employees: 10,
    openDate: "2022-07-10"
  },
  { 
    id: 4, 
    name: "Scarborough", 
    address: "321 Markham Road, Scarborough, ON", 
    phone: "416-555-0400", 
    manager: "Emily Davis", 
    status: "inactive",
    employees: 0,
    openDate: "2023-01-05"
  },
  { 
    id: 5, 
    name: "Etobicoke", 
    address: "654 The Queensway, Etobicoke, ON", 
    phone: "416-555-0500", 
    manager: "Robert Brown", 
    status: "active",
    employees: 6,
    openDate: "2023-02-18"
  },
  { 
    id: 6, 
    name: "Ottawa Central", 
    address: "987 Bank Street, Ottawa, ON", 
    phone: "613-555-0600", 
    manager: "Jennifer Wilson", 
    status: "active",
    employees: 9,
    openDate: "2023-04-01"
  },
  { 
    id: 7, 
    name: "Kitchener", 
    address: "147 King Street East, Kitchener, ON", 
    phone: "519-555-0700", 
    manager: "David Miller", 
    status: "pending",
    employees: 4,
    openDate: "2023-08-15"
  },
]

export default function BranchesPage() {
  const [branches, setBranches] = useState(initialBranches)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filter branches based on search term
  const filteredBranches = branches.filter(branch => 
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.manager.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedBranches = filteredBranches.slice(startIndex, startIndex + itemsPerPage)

  // Handle adding a new branch
  const handleAddBranch = (newBranch: any) => {
    const id = branches.length > 0 ? Math.max(...branches.map(b => b.id)) + 1 : 1
    setBranches([...branches, { ...newBranch, id }])
    setIsAddDialogOpen(false)
  }

  // Handle editing an existing branch
  const handleEditBranch = (branch: any) => {
    setSelectedBranch(branch)
    setIsAddDialogOpen(true)
  }

  // Handle updating a branch
  const handleUpdateBranch = (updatedBranch: any) => {
    setBranches(branches.map(branch => 
      branch.id === updatedBranch.id ? updatedBranch : branch
    ))
    setIsAddDialogOpen(false)
    setSelectedBranch(null)
  }

  // Handle deleting a branch
  const handleDeleteClick = (branch: any) => {
    setSelectedBranch(branch)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    setBranches(branches.filter(branch => branch.id !== selectedBranch.id))
    setIsDeleteDialogOpen(false)
    setSelectedBranch(null)
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Branches Management</h1>
          <Button onClick={() => {
            setSelectedBranch(null)
            setIsAddDialogOpen(true)
          }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Branch
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Branch Locations</CardTitle>
            <CardDescription>
              Manage all your branch locations across Canada. Add, edit, or remove branches as needed.
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search branches..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-shrink-0">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>All</DropdownMenuItem>
                  <DropdownMenuItem>Active</DropdownMenuItem>
                  <DropdownMenuItem>Inactive</DropdownMenuItem>
                  <DropdownMenuItem>Pending</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {filteredBranches.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBranches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">{branch.name}</TableCell>
                      <TableCell>{branch.address}</TableCell>
                      <TableCell>{branch.manager}</TableCell>
                      <TableCell>{getStatusBadge(branch.status)}</TableCell>
                      <TableCell>{branch.employees}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditBranch(branch)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-500 hover:bg-red-50"
                            onClick={() => handleDeleteClick(branch)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">No branches found</h3>
                <p className="text-gray-500 text-center mt-2">
                  No branches match your search criteria. Try adjusting your search or create a new branch.
                </p>
              </div>
            )}
          </CardContent>
          {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredBranches.length)}
                </span>{" "}
                of <span className="font-medium">{filteredBranches.length}</span> branches
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

      <AddBranchDialog
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        onAdd={handleAddBranch}
        onUpdate={handleUpdateBranch}
        branch={selectedBranch}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        branchName={selectedBranch?.name}
      />
    </AdminLayout>
  )}