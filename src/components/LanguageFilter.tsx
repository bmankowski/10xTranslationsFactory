import React from "react";
import type { LanguageDTO } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assumes Shadcn Select is installed at this path

interface LanguageFilterProps {
  languages: LanguageDTO[];
  selectedLanguageId: string | null;
  onFilterChange: (languageId: string | null) => void;
  className?: string;
}

const LanguageFilter: React.FC<LanguageFilterProps> = ({
  languages,
  selectedLanguageId,
  onFilterChange,
  className = "",
}) => {
  // Handle value change from Shadcn Select
  const handleValueChange = (value: string) => {
    onFilterChange(value === "all" ? null : value);
  };

  // Determine the value prop for the Select component
  // Map null to 'all' since Select needs string values
  const selectValue = selectedLanguageId === null ? "all" : selectedLanguageId;

  return (
    <div className={`w-full md:w-64 ${className}`}>
      <label htmlFor="language-filter" className="block text-sm font-medium text-gray-700 mb-1">
        Filter by Language
      </label>
      <Select onValueChange={handleValueChange} value={selectValue} name="language-filter">
        <SelectTrigger id="language-filter" className="w-full">
          <SelectValue placeholder="Filter by language..." />
        </SelectTrigger>
        <SelectContent>
          {/* "All Languages" option */}
          <SelectItem value="all">All Languages</SelectItem>

          {/* Map available languages to SelectItem components */}
          {languages.map((lang) => (
            <SelectItem key={lang.id} value={lang.id}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageFilter;
