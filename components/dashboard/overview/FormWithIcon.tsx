import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReactNode } from "react";

interface FormSelectWithIconProps {
  icon: ReactNode;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  error?: string;
}

export function FormSelectWithIcon({ icon, placeholder, options, onChange, error }: FormSelectWithIconProps) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-3 h-5 w-5 text-gray-400">
        {icon}
      </div>
      <Select onValueChange={onChange}>
        <SelectTrigger className={`pl-10 ${error ? 'border-red-500' : ''}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
