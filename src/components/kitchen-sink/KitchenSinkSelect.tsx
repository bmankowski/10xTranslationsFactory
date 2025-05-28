import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function KitchenSinkSelect() {
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="pl">Polish</SelectItem>
        <SelectItem value="de">German</SelectItem>
        <SelectItem value="fr">French</SelectItem>
      </SelectContent>
    </Select>
  );
}
