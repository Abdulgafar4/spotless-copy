"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
  Repeat,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/admin/admin-layout";
import { AddUnavailableDateDialog } from "@/components/admin/scheduling/addUnavailableDate";
import { DeleteUnavailableDateDialog } from "@/components/admin/scheduling/deleteUnavailableDate";
import { useUnavailableDates } from "@/hooks/use-unavailable-dates";
import { UnavailableDate } from "@/model/unavailable-date-schema";
import { toast } from "sonner";
import FilterDropdown from "@/components/shared/shared-filter";
import { useAdminBranches } from "@/hooks/use-branch";
import { formatShortDate } from "@/lib/utils";

// Branch badge component
const BranchBadge: React.FC<{ branch: string }> = ({ branch }) => {
  const isAllBranches = branch === "All Branches";
  return (
    <Badge
      className={
        isAllBranches
          ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
          : "bg-blue-100 text-blue-800 hover:bg-blue-100"
      }
    >
      {branch}
    </Badge>
  );
};

// Recurring indicator component
const RecurringIndicator: React.FC<{
  isRecurring: boolean;
  recurringType?: string | null;
}> = ({ isRecurring, recurringType }) => {
  if (!isRecurring) return null;

  return (
    <div className="flex items-center text-sm text-gray-500">
      <Repeat className="h-4 w-4 mr-1" />
      {recurringType &&
        recurringType?.charAt(0).toUpperCase() + recurringType?.slice(1)}
    </div>
  );
};

// Action buttons component
const ActionButtons: React.FC<{
  onEdit: () => void;
  onDelete: () => void;
}> = ({ onEdit, onDelete }) => (
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
const EmptyState: React.FC<{ loading: boolean; error: string | null }> = ({
  loading,
  error,
}) => (
  <div className="flex flex-col items-center justify-center py-10 w-full">
    <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium">No unavailable dates found</h3>
    {!loading ? (
      <p className="text-gray-500 text-center mt-2">
        No unavailable dates match your search criteria. Try adjusting your
        search or add a new unavailable date.
      </p>
    ) : (
      <div className="flex justify-center p-8">
        Loading unavailable dates...
      </div>
    )}

    {error && <div className="text-red-600 p-8 mt-4">Error: {error}</div>}
  </div>
);

// Pagination component
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  startIndex: number;
  setCurrentPage: (page: number) => void;
}> = ({
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
      of <span className="font-medium">{totalItems}</span> unavailable dates
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

// SearchBar component
const SearchBar: React.FC<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}> = ({ searchTerm, setSearchTerm }) => (
  <div className="relative flex-1">
    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
    <Input
      placeholder="Search by reason or branch..."
      className="pl-8"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
);

// UnavailableDatesTable component
const UnavailableDatesTable: React.FC<{
  unavailableDates: UnavailableDate[];
  onEdit: (date: UnavailableDate) => void;
  onDelete: (date: UnavailableDate) => void;
}> = ({ unavailableDates, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Date</TableHead>
        <TableHead>Branch</TableHead>
        <TableHead className="hidden md:table-cell">Reason</TableHead>
        <TableHead className="hidden sm:table-cell">Type</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {unavailableDates.map((unavailableDate) => (
        <TableRow key={unavailableDate.id}>
          <TableCell className="font-medium">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              {/* {format(new Date(unavailableDate.date), "MMM d, yyyy")} */}
              {formatShortDate(unavailableDate.date)}
            </div>
          </TableCell>
          <TableCell>
            <BranchBadge branch={unavailableDate.branch} />
          </TableCell>
          <TableCell className="hidden md:table-cell">
            {unavailableDate.reason}
          </TableCell>
          <TableCell className="hidden sm:table-cell">
            <RecurringIndicator
              isRecurring={unavailableDate.is_recurring}
              recurringType={unavailableDate.recurring_type}
            />
            {!unavailableDate.is_recurring && (
              <span className="text-sm text-gray-500">One-time</span>
            )}
          </TableCell>
          <TableCell className="text-right">
            <ActionButtons
              onEdit={() => onEdit(unavailableDate)}
              onDelete={() => onDelete(unavailableDate)}
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default function UnavailableDatesPage() {
  const {
    unavailableDates,
    loading,
    error,
    fetchUnavailableDates,
    createUnavailableDate,
    updateUnavailableDate,
    deleteUnavailableDate,
  } = useUnavailableDates();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedUnavailableDate, setSelectedUnavailableDate] =
    useState<UnavailableDate | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const [branchFilter, setBranchFilter] = useState<string>("All");

  // Fetch unavailable dates when component mounts
  useEffect(() => {
    fetchUnavailableDates();
  }, [fetchUnavailableDates]);

  // Filter unavailable dates based on search term and branch
  const filteredUnavailableDates = unavailableDates.filter(
    (unavailableDate) => {
      const matchesSearch =
        unavailableDate.reason
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        unavailableDate.branch
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        format(new Date(unavailableDate.date), "MMM d, yyyy")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesBranch =
        branchFilter === "All" ||
        unavailableDate.branch === branchFilter ||
        (branchFilter === "All Branches" &&
          unavailableDate.branch === "All Branches");

      return matchesSearch && matchesBranch;
    }
  );

  // Pagination
  const totalPages = Math.ceil(filteredUnavailableDates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUnavailableDates = filteredUnavailableDates.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle adding a new unavailable date
  const handleAddUnavailableDate = async (newUnavailableDate: any) => {
    try {
      await createUnavailableDate(newUnavailableDate);
      fetchUnavailableDates(); // Refresh the list
      setIsAddDialogOpen(false);
      toast.success("Unavailable date added successfully");
    } catch (err) {
      console.error("Failed to create unavailable date:", err);
      toast.error("Failed to add unavailable date");
    }
  };

  // Handle editing an existing unavailable date
  const handleEditUnavailableDate = (unavailableDate: UnavailableDate) => {
    setSelectedUnavailableDate(unavailableDate);
    setIsAddDialogOpen(true);
  };

  // Handle updating an unavailable date
  const handleUpdateUnavailableDate = async (updatedUnavailableDate: any) => {
    try {
      await updateUnavailableDate(
        updatedUnavailableDate.id,
        updatedUnavailableDate
      );
      fetchUnavailableDates(); // Refresh the list
      setIsAddDialogOpen(false);
      setSelectedUnavailableDate(null);
      toast.success("Unavailable date updated successfully");
    } catch (err) {
      console.error("Failed to update unavailable date:", err);
      toast.error("Failed to update unavailable date");
    }
  };

  // Handle deleting an unavailable date
  const handleDeleteClick = (unavailableDate: UnavailableDate) => {
    setSelectedUnavailableDate(unavailableDate);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedUnavailableDate) {
      try {
        await deleteUnavailableDate(selectedUnavailableDate.id);
        fetchUnavailableDates(); // Refresh the list
        setIsDeleteDialogOpen(false);
        setSelectedUnavailableDate(null);
        toast.success("Unavailable date deleted successfully");
      } catch (err) {
        console.error("Failed to delete unavailable date:", err);
        toast.error("Failed to delete unavailable date");
      }
    }
  };

  const openAddDialog = () => {
    setSelectedUnavailableDate(null);
    setIsAddDialogOpen(true);
  };

  const { branches } = useAdminBranches();

  // Create filter options from actual branches
  const branchFilterOptions = [
    "All",
    "All Branches",
    ...branches.map((branch) => branch.name),
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Unavailable Dates Management
          </h1>
          <Button onClick={openAddDialog} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Unavailable Date
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Unavailability</CardTitle>
            <CardDescription>
              Manage dates when services are not available. These dates will be
              disabled in the customer booking calendar.
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
              <FilterDropdown
                label="Filter by Branch"
                options={branchFilterOptions}
                onSelect={(filter) => {
                  setBranchFilter(filter);
                  setCurrentPage(1); // Reset to first page when filtering
                }}
              />
            </div>
          </CardHeader>

          <CardContent>
            {filteredUnavailableDates.length > 0 ? (
              <div className="overflow-x-auto">
                <UnavailableDatesTable
                  unavailableDates={paginatedUnavailableDates}
                  onEdit={handleEditUnavailableDate}
                  onDelete={handleDeleteClick}
                />
              </div>
            ) : (
              <EmptyState loading={loading} error={error} />
            )}
          </CardContent>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredUnavailableDates.length}
              startIndex={startIndex}
              setCurrentPage={setCurrentPage}
            />
          )}
        </Card>
      </div>

      <AddUnavailableDateDialog
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        onAdd={handleAddUnavailableDate}
        onUpdate={handleUpdateUnavailableDate}
        unavailableDate={selectedUnavailableDate}
      />

      <DeleteUnavailableDateDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        dateInfo={
          selectedUnavailableDate
            ? {
                date: format(
                  new Date(selectedUnavailableDate.date),
                  "MMM d, yyyy"
                ),
                reason: selectedUnavailableDate.reason,
                branch: selectedUnavailableDate.branch,
              }
            : undefined
        }
      />
    </AdminLayout>
  );
}
