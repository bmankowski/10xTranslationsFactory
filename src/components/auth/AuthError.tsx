import React from "react";
import { AlertTriangle } from "lucide-react";

interface AuthErrorProps {
  message: string;
}

export function AuthError({ message }: AuthErrorProps) {
  if (!message) return null;
  
  return (
    <div className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
      <AlertTriangle className="size-4" />
      <p>{message}</p>
    </div>
  );
} 