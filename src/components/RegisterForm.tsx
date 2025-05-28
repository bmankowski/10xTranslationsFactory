import React, { useState } from "react";
import { Button } from "./ui/button";

interface RegisterFormProps {
  redirectTo: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ redirectTo }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Hide any previous messages
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to create account");
        return;
      }

      if (data.message === "Email confirmation required") {
        // Show confirmation message and reset form
        setEmail("");
        setPassword("");
        setSuccessMessage("Please check your email to confirm your account");
      } else {
        // Redirect to the specified redirect path
        window.location.href = redirectTo;
      }
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
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
      </div>

      {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}

      {successMessage && <div className="text-green-500 text-sm">{successMessage}</div>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creating account..." : "Create Account"}
      </Button>

      <div className="text-center text-sm mt-4">
        <p>
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;
