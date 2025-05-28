import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";

interface LoginFormProps {
  redirectTo: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ redirectTo }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check for URL error param and display if present
    const urlParams = new URLSearchParams(window.location.search);
    const urlError = urlParams.get("error");
    if (urlError) {
      setErrorMessage(decodeURIComponent(urlError));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Hide any previous messages
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important: include cookies
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to sign in");
        return;
      }

      setSuccessMessage("Login successful! Redirecting...");

      // Redirect after a short delay to allow the user to see the success message
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 500);
    } catch (err) {
      setErrorMessage(`An unexpected error occurred: ${String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}

      {successMessage && <div className="text-green-500 text-sm">{successMessage}</div>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>

      <div className="text-center text-sm mt-4">
        <p>
          Don&apos;t have an account?{" "}
          <a href="/auth/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
        <a href="/auth/forgot-password" className="text-blue-600 hover:underline block mt-2">
          Forgot your password?
        </a>
      </div>
    </form>
  );
};

export default LoginForm;
