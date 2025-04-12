// components/dashboard/bookingHistory/booking-filters.tsx
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import FilterDropdown from "@/components/shared/shared-filter";

interface BookingFilterOption {
  label: string;
  value: string;
}

interface BookingFiltersProps {
  statusOptions: BookingFilterOption[];
  dateOptions: BookingFilterOption[];
  currentStatusFilter: string | undefined;
  currentDateFilter: string;
  currentSearchTerm: string;
  onStatusChange: (status: string) => void;
  onDateChange: (date: string) => void;
  onSearch: (term: string) => void;
}

export function BookingFilters({
  statusOptions,
  dateOptions,
  currentStatusFilter,
  currentDateFilter,
  currentSearchTerm,
  onStatusChange,
  onDateChange,
  onSearch
}: BookingFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(currentSearchTerm);
  
  // Handle search input with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== currentSearchTerm) {
        onSearch(searchTerm);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, currentSearchTerm, onSearch]);
  
  // Handle status filter change
  const handleStatusFilterChange = (filter: string) => {
    const option = statusOptions.find(o => o.label === filter);
    if (option) {
      onStatusChange(option.value);
    }
  };
  
  // Handle date filter change
  const handleDateFilterChange = (filter: string) => {
    const option = dateOptions.find(o => o.label === filter);
    if (option) {
      onDateChange(option.value);
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search by ID or service..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-2 flex-col sm:flex-row">
        <FilterDropdown
          label="Status"
          options={statusOptions.map(option => option.label)}
          onSelect={handleStatusFilterChange}
          currentValue={statusOptions.find(o => o.value === currentStatusFilter)?.label || "All"}
        />
        <FilterDropdown
          label="Date"
          options={dateOptions.map(option => option.label)}
          onSelect={handleDateFilterChange}
          currentValue={dateOptions.find(o => o.value === currentDateFilter)?.label || "All"}
        />
      </div>
    </div>
  );
}