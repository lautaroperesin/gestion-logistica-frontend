import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  value?: string | number;
  onValueChange: (value: string | number | undefined) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const CustomSelect = React.forwardRef<HTMLSelectElement, CustomSelectProps>(
  ({ value, onValueChange, options, placeholder = "Selecciona una opción", disabled, className }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = e.target.value;
      onValueChange(selectedValue === "" ? undefined : selectedValue);
    };

    return (
      <div className="relative">
        <select
          ref={ref}
          value={value || ""}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-colors",
            "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none",
            "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
            className
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    );
  }
);

CustomSelect.displayName = "CustomSelect";
