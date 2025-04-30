import React, { useState } from "react";
import { FormField } from "./FormField";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { AuthError } from "./AuthError";
import { Loader2 } from "lucide-react";

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  onGoogleLogin: () => Promise<void>;
}

export function LoginForm({ onSubmit, onGoogleLogin }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await onSubmit({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      await onGoogleLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during Google login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
        
        <FormField
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between">
          <a 
            href="/auth/reset-password" 
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </a>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Sign in
        </Button>
      </Form>
      
      <div className="relative flex items-center">
        <div className="flex-grow border-t"></div>
        <span className="mx-4 flex-shrink text-xs text-muted-foreground">OR</span>
        <div className="flex-grow border-t"></div>
      </div>
      
      <GoogleAuthButton 
        onClick={handleGoogleLogin} 
        isLoading={isLoading} 
        type="login" 
      />
      
      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Don't have an account?{" "}
          <a href="/auth/register" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
} 