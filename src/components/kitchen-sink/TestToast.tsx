import * as React from 'react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';

export function TestToast() {
  const { toast } = useToast();

  const showDefaultToast = () => {
    toast.default({
      title: "Default Toast",
      description: "This is a default toast message",
    });
  };

  const showSuccessToast = () => {
    toast.success({
      title: "Success!",
      description: "Operation completed successfully",
    });
  };

  const showErrorToast = () => {
    toast.destructive({
      title: "Error",
      description: "Something went wrong",
    });
  };

  const showInfoToast = () => {
    toast.info({
      title: "Information",
      description: "Here's some information for you",
    });
  };

  const showWarningToast = () => {
    toast.warning({
      title: "Warning",
      description: "Proceed with caution",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Test Sonner Toasts</h2>
      <div className="flex flex-wrap gap-4">
        <Button onClick={showDefaultToast}>Default Toast</Button>
        <Button onClick={showSuccessToast} variant="outline">Success Toast</Button>
        <Button onClick={showErrorToast} variant="destructive">Error Toast</Button>
        <Button onClick={showInfoToast} variant="secondary">Info Toast</Button>
        <Button onClick={showWarningToast} variant="ghost">Warning Toast</Button>
      </div>
    </div>
  );
} 