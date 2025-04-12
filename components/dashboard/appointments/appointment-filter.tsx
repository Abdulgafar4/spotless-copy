
// components/dashboard/appointments/appointment-filter.tsx
import FilterDropdown from "@/components/shared/shared-filter";

interface AppointmentFilterProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export function AppointmentFilter({ currentFilter, onFilterChange }: AppointmentFilterProps) {
  const statusOptions = ["all", "confirmed", "pending", "cancelled"];
  
  const handleFilterChange = (filter: string) => {
    onFilterChange(filter.toLowerCase());
  };
  
  return (
    <FilterDropdown
      label="Filter by Status"
      options={statusOptions.map(option => 
        option.charAt(0).toUpperCase() + option.slice(1)
      )}
      onSelect={handleFilterChange}
      currentValue={currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}
    />
  );
}