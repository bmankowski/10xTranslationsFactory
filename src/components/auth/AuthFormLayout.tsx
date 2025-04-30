import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

interface AuthFormLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  footer?: React.ReactNode;
}

export function AuthFormLayout({ children, title, description, footer }: AuthFormLayoutProps) {
  return (
    <div className="mx-auto max-w-md w-full px-4 py-8">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        {footer && (
          <CardFooter className="flex flex-col items-center border-t p-4">
            {footer}
          </CardFooter>
        )}
      </Card>
    </div>
  );
} 