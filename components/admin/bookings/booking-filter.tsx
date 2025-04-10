import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BRANCH_OPTIONS, DATE_OPTIONS, STATUS_OPTIONS } from "@/constants/booking-constant";
import { Search } from "lucide-react";

export const BookingFilters: React.FC<BookingFiltersProps> = ({ 
    searchTerm, 
    setSearchTerm, 
    statusFilter, 
    setStatusFilter, 
    dateFilter, 
    setDateFilter, 
    branchFilter, 
    setBranchFilter 
  }) => (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search bookings..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        {[
          { 
            value: statusFilter, 
            onChange: setStatusFilter, 
            options: STATUS_OPTIONS, 
            placeholder: "Status",
            width: "w-[130px]"
          },
          { 
            value: dateFilter, 
            onChange: setDateFilter, 
            options: DATE_OPTIONS, 
            placeholder: "Date",
            width: "w-[130px]"
          },
          { 
            value: branchFilter, 
            onChange: setBranchFilter, 
            options: BRANCH_OPTIONS, 
            placeholder: "Branch",
            width: "w-[150px]"
          }
        ].map(({ value, onChange, options, placeholder, width }) => (
          <Select
            key={placeholder}
            value={value}
            onValueChange={onChange}
          >
            <SelectTrigger className={width}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
    </div>
  )