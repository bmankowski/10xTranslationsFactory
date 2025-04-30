import React, { useState } from "react";
import { FormField } from "./FormField";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { AuthError } from "./AuthError";
import { Loader2 } from "lucide-react";

interface PasswordResetFormProps {
  onSubmit: (data: { email: string }) => Promise<void>;
}

export function PasswordResetForm({ onSubmit }: PasswordResetFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await onSubmit({ email });
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while requesting password reset");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
          <p>
            If an account exists with the email <strong>{email}</strong>, we've sent instructions to reset your password.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Didn't receive an email?{" "}
          <a href="/auth/login" className="text-primary hover:underline">
            Return to login
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
      {error && <AuthError message={error} />}
      
      <Form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="name@example.com"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Send reset link
        </Button>
      </Form>
      
      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Remember your password?{" "}
          <a href="/auth/login" className="text-primary hover:underline">
            Back to login
          </a>
        </p>
      </div>
    </div>
  );
} 