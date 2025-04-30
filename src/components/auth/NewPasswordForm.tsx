import React, { useState } from "react";
import { FormField } from "./FormField";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { AuthError } from "./AuthError";
import { Loader2 } from "lucide-react";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

interface NewPasswordFormProps {
  onSubmit: (data: { password: string }) => Promise<void>;
}

export function NewPasswordForm({ onSubmit }: NewPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validatePasswords = () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validatePasswords()) {
      return;
    }
    
    setIsLoading(true);

    try {
      await onSubmit({ password });
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while updating your password");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
          <p>
            Your password has been successfully updated. You can now log in with your new password.
          </p>
        </div>
        <div className="text-center">
          <a 
            href="/auth/login" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium text-primary hover:underline"
          >
            Return to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Create a new password for your account
      </p>
      
      {error && <AuthError message={error} />}
      
      <Form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <FormField
            id="password"
            label="New Password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrengthIndicator password={password} />
        </div>
        
        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={password !== confirmPassword && confirmPassword !== "" ? "Passwords do not match" : ""}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Reset password
        </Button>
      </Form>
    </div>
  );
} 