import * as React from "react"
import { toast as sonnerToast } from "sonner";

// Define our own ToastProps type based on Sonner's parameters
export type ToastProps = Parameters<typeof sonnerToast>[1] & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "info" | "warning";
};

type ToastActionElement = {
  altText: string;
  onClick: () => void;
  children?: React.ReactNode;
};

type ToastOptions = Partial<ToastProps> & {
  variant?: "default" | "destructive" | "success" | "info" | "warning";
}

function toast(props: ToastOptions) {
  const { variant, ...options } = props;
  
  switch (variant) {
    case "destructive":
      return sonnerToast.error(props.title as string, {
        description: props.description,
        ...options,
      });
    case "success":
      return sonnerToast.success(props.title as string, {
        description: props.description,
        ...options,
      });
    case "info":
      return sonnerToast.info(props.title as string, {
        description: props.description,
        ...options,
      });
    case "warning":
      return sonnerToast.warning(props.title as string, {
        description: props.description,
        ...options,
      });
    default:
      return sonnerToast(props.title as string, {
        description: props.description,
        ...options,
      });
  }
}

// Add variant methods
toast.success = (options: Omit<ToastOptions, 'variant'>) => toast({ ...options, variant: "success" });
toast.destructive = (options: Omit<ToastOptions, 'variant'>) => toast({ ...options, variant: "destructive" });
toast.info = (options: Omit<ToastOptions, 'variant'>) => toast({ ...options, variant: "info" });
toast.warning = (options: Omit<ToastOptions, 'variant'>) => toast({ ...options, variant: "warning" });

// Utility functions
toast.dismiss = (toastId?: string) => {
  sonnerToast.dismiss(toastId);
};

// For backwards compatibility
export function useToast() {
  return {
    toast,
    dismiss: (toastId?: string) => toast.dismiss(toastId),
  };
}

export { toast };
export type { ToastActionElement };