import React, { useState, useEffect } from "react";
import { FormField } from "./FormField";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { AuthError } from "./AuthError";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthContext";

interface LoginFormProps {
  initialError?: string;
  redirectTo?: string;
}

export function LoginForm({ initialError = "", redirectTo = "/dashboard" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError);
  const [isLoading, setIsLoading] = useState(false);
  // Using optional chaining with useAuth to prevent server-side rendering errors
  const auth = typeof window !== "undefined" ? useAuth() : null;

  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError("Password is required");
      setIsLoading(false);
      return;
    }

    try {
      // Only call login if auth is available (client-side)
      if (auth) {
        const { error: authError } = await auth.login(email, password);
        if (authError) {
          setError(authError.message);
          return;
        }
        
        // Redirect to the requested page or dashboard
        window.location.href = redirectTo;
      }
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
      // Only call loginWithGoogle if auth is available (client-side)
      if (auth) {
        const { error: authError } = await auth.loginWithGoogle();
        if (authError) {
          setError(authError.message);
        }
        // Google OAuth redirects automatically so no need to redirect here
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during Google login");
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