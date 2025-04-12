import { useState } from "react";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type FilterDropdownProps = {
  options: string[];
  label?: string;
  onSelect: (selected: string) => void;
  defaultOption?: string;
  currentValue?: string; // ✅ added
};

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  options,
  label = "Filter",
  onSelect,
  defaultOption = "All",
  currentValue,
}) => {
  const selectedOption = currentValue ?? defaultOption;

  const handleSelect = (option: string) => {
    onSelect(option);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex-shrink-0">
          <Filter className="mr-2 h-4 w-4" />
          {selectedOption}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuItem key={option} onClick={() => handleSelect(option)}>
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown