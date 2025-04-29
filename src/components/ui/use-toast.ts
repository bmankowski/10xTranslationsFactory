import * as React from "react"
import { toast as sonnerToast, type ToastT } from "sonner";

export type ToastProps = ToastT;

type ToastActionElement = {
  altText: string;
  onClick: () => void;
  children?: React.ReactNode;
};

export const toast = {
  // Base toast function
  toast(props: Partial<ToastT>) {
    return sonnerToast(props.title as string, {
      description: props.description,
      ...props,
    });
  },

  // Variants
  default(props: Partial<ToastT>) {
    return sonnerToast(props.title as string, {
      description: props.description,
      ...props,
    });
  },
  destructive(props: Partial<ToastT>) {
    return sonnerToast.error(props.title as string, {
      description: props.description,
      ...props,
    });
  },
  success(props: Partial<ToastT>) {
    return sonnerToast.success(props.title as string, {
      description: props.description,
      ...props,
    });
  },
  info(props: Partial<ToastT>) {
    return sonnerToast.info(props.title as string, {
      description: props.description,
      ...props,
    });
  },
  warning(props: Partial<ToastT>) {
    return sonnerToast.warning(props.title as string, {
      description: props.description,
      ...props,
    });
  },

  // Utility functions
  dismiss(toastId?: string) {
    sonnerToast.dismiss(toastId);
  },
};

// For backwards compatibility
export function useToast() {
  return {
    toast,
    dismiss: (toastId?: string) => toast.dismiss(toastId),
  };
}

export type { ToastActionElement };