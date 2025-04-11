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
  Clock,
  DollarSign,
  Users,
  ImageIcon,
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
import { AddServiceDialog } from "@/components/admin/services/addService";
import { DeleteServiceDialog } from "@/components/admin/services/deleteModal";
import AdminLayout from "@/components/admin/admin-layout";
import { useAdminServices } from "@/hooks/use-service";
import { toast } from "sonner";
import FilterDropdown from "@/components/shared/shared-filter";

// Status badge component to reduce repetition
const StatusBadge: React.FC<ServiceStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    active: {
      className: "bg-green-100 text-green-800 hover:bg-green-100",
      label: "Active",
    },
    inactive: {
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      label: "Inactive",
    },
    seasonal: {
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      label: "Seasonal",
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
      of <span className="font-medium">{totalItems}</span> services
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
      placeholder="Search services..."
      className="pl-8"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
);
// ServicesTable props interface
interface ServicesTableProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}
// Format price utility function
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};
// ServicesTable component
const ServicesTable: React.FC<ServicesTableProps> = ({
  services,
  onEdit,
  onDelete,
}) => (
<Table>
    <TableHeader>
      <TableRow className="whitespace-nowrap">
        <TableHead>Image</TableHead>
        <TableHead>Service Name</TableHead>
        <TableHead className="hidden lg:table-cell">Description</TableHead>
        <TableHead className="hidden sm:table-cell">
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            Duration
          </div>
        </TableHead>
        <TableHead className="hidden md:table-cell">
          <div className="flex items-center">
            <DollarSign className="mr-1 h-4 w-4" />
            Price/hr
          </div>
        </TableHead>
        <TableHead className="hidden md:table-cell">Category</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="hidden sm:table-cell">
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4" />
            Staff Req.
          </div>
        </TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {services.map((service) => (
        <TableRow key={service.id}>
          <TableCell>
            {service.imageUrl ? (
              <div className="h-12 w-12 rounded-md overflow-hidden">
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </TableCell>
          <TableCell className="font-medium whitespace-nowrap">{service.name.toLocaleUpperCase()}</TableCell>
          <TableCell className="hidden lg:table-cell">
            <div className="max-w-xs truncate">{service.description}</div>
          </TableCell>
          <TableCell className="hidden sm:table-cell">
            {service.duration} min
          </TableCell>
          <TableCell className="hidden md:table-cell">
            {formatPrice(Number(service.price))}
          </TableCell>
          <TableCell className="hidden md:table-cell">
            {service.category}
          </TableCell>
          <TableCell>
            <StatusBadge status={service.status} />
          </TableCell>
          <TableCell className="hidden sm:table-cell">
            {service.staffRequired}
          </TableCell>
          <TableCell className="text-right">
            <ActionButtons
              onEdit={() => onEdit(service)}
              onDelete={() => onDelete(service)}
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
// Empty State Component
const EmptyState: React.FC<{ loading: boolean, error: Error | null }> = ({ loading, error }) => (
  <div className="flex flex-col items-center justify-center py-10 w-full">
    <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium">No services found</h3>
    {!loading ? (
      <p className="text-gray-500 text-center mt-2">
        No services match your search criteria. Try adjusting your search or
        create a new service.{" "}
      </p>
    ) : (
      <div className="flex justify-center p-8">Loading services...</div>
    )}

    {error && (
      <div className="text-red-600 p-8 mt-24">Error: {error.message}</div>
    )}
  </div>
);

export default function ServicesPage() {
  const {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
  } = useAdminServices();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Fetch services when component mounts
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Filter services based on search term, status, and category
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || service.status === statusFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === "All" || service.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle adding a new service
  const handleAddService = async (newService: Omit<Service, "id">) => {
    try {
      await createService(newService);
      fetchServices(); // Refresh the list
      setIsAddDialogOpen(false);
      toast.success("New Service Added Successfully");
    } catch (err) {
      console.error("Failed to create service:", err);
      toast.error("Failed to create service");
    }
  };

  // Handle editing an existing service
  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsAddDialogOpen(true);
  };

  // Handle updating a service
  const handleUpdateService = async (updatedService: Service) => {
    try {
      await updateService(updatedService.id, updatedService);
      fetchServices(); // Refresh the list
      setIsAddDialogOpen(false);
      setSelectedService(null);
      toast.success("Service Updated Successfully");
    } catch (err) {
      console.error("Failed to update service:", err);
      toast.error("Failed to update service");
    }
  };

  // Handle deleting a service
  const handleDeleteClick = (service: Service) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedService) {
      try {
        await deleteService(selectedService.id);
        fetchServices(); // Refresh the list
        setIsDeleteDialogOpen(false);
        setSelectedService(null);
        toast.success("Service Deleted Successfully");
      } catch (err) {
        console.error("Failed to delete service:", err);
        toast.error("Failed to delete service");
      }
    }
  };

  const openAddDialog = () => {
    setSelectedService(null);
    setIsAddDialogOpen(true);
  };

  // Get unique categories for filter dropdown
  const categories = ["All", ...new Set(services.map(service => service.category))];
  

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Services Management
          </h1>
          <Button onClick={openAddDialog} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Service
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Catalog</CardTitle>
            <CardDescription>
              Manage all your services across locations. Add, edit, or
              remove services as needed.
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <FilterDropdown
                  label="Filter by Status"
                  options={["All", "Active", "Inactive", "Seasonal"]}
                  onSelect={(filter) => {
                    setStatusFilter(filter);
                  }}
                />
                <FilterDropdown
                  label="Filter by Category"
                  options={categories}
                  onSelect={(filter) => {
                    setCategoryFilter(filter);
                  }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredServices.length > 0 ? (
              <div className="overflow-x-auto">
                <ServicesTable
                  services={paginatedServices}
                  onEdit={handleEditService}
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
              totalItems={filteredServices.length}
              startIndex={startIndex}
              setCurrentPage={setCurrentPage}
            />
          )}
        </Card>
      </div>

      <AddServiceDialog
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        onAdd={handleAddService}
        onUpdate={handleUpdateService}
        service={selectedService}
      />

      <DeleteServiceDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        serviceName={selectedService?.name}
      />
    </AdminLayout>
  );
}