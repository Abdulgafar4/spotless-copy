import { Input } from "@/components/ui/input";
import { ReactNode } from "react";

interface InputWithIconProps {
  icon: ReactNode;
  placeholder: string;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export function InputWithIcon({
  icon,
  placeholder,
  type = "text",
  onChange,
  error,
}: InputWithIconProps) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-3 h-5 w-5 text-gray-400">
        {icon}
      </div>
      <Input
        type={type}
        placeholder={placeholder}
        className={`pl-10 ${error ? 'border-red-500' : ''}`}
        onChange={onChange}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
