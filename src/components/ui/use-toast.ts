import * as React from "react"
import { toast as sonnerToast, type Toast as SonnerToast } from "sonner";

export type ToastProps = SonnerToast;

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