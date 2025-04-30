import React from "react";
import { FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  autoComplete?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FormField({
  id,
  label,
  type = "text",
  placeholder,
  required = false,
  error,
  autoComplete,
  value,
  onChange,
}: FormFieldProps) {
  return (
    <FormItem className="space-y-1">
      <FormLabel htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </FormLabel>
      <FormControl>
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          required={required}
          className={error ? "border-destructive" : ""}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
        />
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
} 