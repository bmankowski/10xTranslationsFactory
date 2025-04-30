import React, { useState } from "react";
import { FormField } from "./FormField";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { AuthError } from "./AuthError";
import { Loader2 } from "lucide-react";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

interface RegisterFormProps {
  onSubmit: (data: { name: string; email: string; password: string }) => Promise<void>;
  onGoogleRegister: () => Promise<void>;
}

export function RegisterForm({ onSubmit, onGoogleRegister }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!acceptTerms) {
      setError("You must accept the terms and conditions");
      return;
    }
    
    setIsLoading(true);

    try {
      await onSubmit({ name, email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    
    if (!acceptTerms) {
      setError("You must accept the terms and conditions");
      return;
    }
    
    setIsLoading(true);

    try {
      await onGoogleRegister();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during Google registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <AuthError message={error} />}
      
      <Form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="name"
          label="Name"
          type="text"
          placeholder="John Doe"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        
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
        
        <div className="space-y-1">
          <FormField
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrengthIndicator password={password} />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <input
              id="terms"
              type="checkbox"
              className="mt-0.5"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              I accept the <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
            </label>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Create account
        </Button>
      </Form>
      
      <div className="relative flex items-center">
        <div className="flex-grow border-t"></div>
        <span className="mx-4 flex-shrink text-xs text-muted-foreground">OR</span>
        <div className="flex-grow border-t"></div>
      </div>
      
      <GoogleAuthButton 
        onClick={handleGoogleRegister} 
        isLoading={isLoading} 
        type="register" 
      />
      
      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <a href="/auth/login" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
} 