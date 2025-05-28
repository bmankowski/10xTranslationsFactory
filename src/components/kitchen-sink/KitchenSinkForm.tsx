import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function KitchenSinkForm() {
  return (
    <div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Your name" />
        <p className="text-sm text-gray-500">Enter your full name</p>
      </div>
      <div className="grid w-full items-center gap-1.5 mt-4">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          placeholder="Tell us about yourself"
          className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );
}
