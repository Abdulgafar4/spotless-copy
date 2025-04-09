"use client";
import { useEffect, useState } from "react";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Filter,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddBranchDialog } from "@/components/admin/branches/addBranch";
import { DeleteConfirmDialog } from "@/components/admin/branches/deleteConfirm";
import AdminLayout from "@/components/admin/admin-layout";
import { useAdminBranches } from "@/hooks/use-branch";
import { useAuth } from '@/hooks/use-auth';

// Status badge component to reduce repetition
const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    active: {
      className: "bg-green-100 text-green-800 hover:bg-green-100",
      label: "Active",
    },
    inactive: {
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      label: "Inactive",
    },
    pending: {
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      label: "Pending",
    },
  };

  const config = statusConfig[status] || { className: "", label: status };

  return <Badge className={config.className}>{config.label}</Badge>;
};

// Action buttons props interface
interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
}

// Action buttons component
const ActionButtons: React.FC<ActionButtonsProps> = ({ onEdit, onDelete }) => (
  <div className="flex justify-end gap-2">
    <Button variant="outline" size="sm" onClick={onEdit}>
      <Edit className="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      size="sm"
      className="text-red-500 hover:bg-red-50"
      onClick={onDelete}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
);

// Empty state component

// Pagination props interface
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  startIndex: number;
  setCurrentPage: (page: number) => void;
}

// Pagination component
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  startIndex,
  setCurrentPage,
}) => (
  <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
    <p className="text-sm text-gray-500">
      Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
      <span className="font-medium">
        {Math.min(startIndex + itemsPerPage, totalItems)}
      </span>{" "}
      of <span className="font-medium">{totalItems}</span> branches
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
);

// SearchBar props interface
interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

// SearchBar component
const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => (
  <div className="relative flex-1">
    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
    <Input
      placeholder="Search branches..."
      className="pl-8"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
);

// FilterDropdown component
const FilterDropdown: React.FC = () => (
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
);

// BranchesTable props interface
interface BranchesTableProps {
  branches: Branch[];
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
}

// BranchesTable component
const BranchesTable: React.FC<BranchesTableProps> = ({
  branches,
  onEdit,
  onDelete,
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Branch Name</TableHead>
        <TableHead className="hidden md:table-cell">Address</TableHead>
        <TableHead className="hidden sm:table-cell">Manager</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="hidden sm:table-cell">Employees</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {branches.map((branch) => (
        <TableRow key={branch.id}>
          <TableCell className="font-medium">{branch.name}</TableCell>
          <TableCell className="hidden md:table-cell">
            {branch.address}
          </TableCell>
          <TableCell className="hidden sm:table-cell">
            {branch.manager}
          </TableCell>
          <TableCell>
            <StatusBadge status={branch.status} />
          </TableCell>
          <TableCell className="hidden sm:table-cell">
            {branch.employees}
          </TableCell>
          <TableCell className="text-right">
            <ActionButtons
              onEdit={() => onEdit(branch)}
              onDelete={() => onDelete(branch)}
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default function BranchesPage() {
  const {
    branches,
    loading,
    error,
    fetchBranches,
    createBranch,
    updateBranch,
    deleteBranch,
  } = useAdminBranches();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;


  // Fetch branches when component mounts
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Filter branches based on search term
  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBranches = filteredBranches.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle adding a new branch
  const handleAddBranch = async (newBranch: Omit<Branch, "id">) => {
    try {
      await createBranch(newBranch);
      fetchBranches(); // Refresh the list
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error("Failed to create branch:", err);
    }
  };

  // Handle editing an existing branch
  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsAddDialogOpen(true);
  };

  // Handle updating a branch
  const handleUpdateBranch = async (updatedBranch: Branch) => {
    try {
      await updateBranch(updatedBranch.id, updatedBranch);
      fetchBranches(); // Refresh the list
      setIsAddDialogOpen(false);
      setSelectedBranch(null);
    } catch (err) {
      console.error("Failed to update branch:", err);
    }
  };

  // Handle deleting a branch
  const handleDeleteClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedBranch) {
      try {
        await deleteBranch(selectedBranch.id);
        fetchBranches(); // Refresh the list
        setIsDeleteDialogOpen(false);
        setSelectedBranch(null);
      } catch (err) {
        console.error("Failed to delete branch:", err);
      }
    }
  };

  const openAddDialog = () => {
    setSelectedBranch(null);
    setIsAddDialogOpen(true);
  };

  const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-10 w-full">
      <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium">No branches found</h3>
      {!loading ? (<p className="text-gray-500 text-center mt-2">
        No branches match your search criteria. Try adjusting your search or
        create a new branch.{" "}
      </p>) : (<div className="flex justify-center p-8">Loading branches...</div>)}

      {error && (
        <div className="text-red-600 p-8 mt-24">Error: {error.message}</div>
      )}
    </div>
  );

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Branches Management
          </h1>
          <Button onClick={openAddDialog} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Branch
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Branch Locations</CardTitle>
            <CardDescription>
              Manage all your branch locations across Canada. Add, edit, or
              remove branches as needed.
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
              <FilterDropdown />
            </div>
          </CardHeader>

          <CardContent>
            {filteredBranches.length > 0 ? (
              <div className="overflow-x-auto">
                <BranchesTable
                  branches={paginatedBranches}
                  onEdit={handleEditBranch}
                  onDelete={handleDeleteClick}
                />
              </div>
            ) : (
                <EmptyState />
            )}
          </CardContent>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredBranches.length}
              startIndex={startIndex}
              setCurrentPage={setCurrentPage}
            />
          )}
        </Card>
      </div>

      {/* We would need to update the AddBranchDialog and DeleteConfirmDialog component props */}
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
  );
}
