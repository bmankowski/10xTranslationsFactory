import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        duration: 5000,
        className: "!bg-background !text-foreground !border-border !shadow-md",
      }}
    />
  );
} 