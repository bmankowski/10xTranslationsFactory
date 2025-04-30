import React, { useMemo } from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => {
    if (!password) return 0;
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Cap the score at 4
    return Math.min(4, score);
  }, [password]);
  
  const getStrengthLabel = () => {
    if (strength === 0) return "Too weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };
  
  const getStrengthColor = () => {
    if (strength === 0) return "bg-destructive/20";
    if (strength === 1) return "bg-destructive";
    if (strength === 2) return "bg-yellow-500";
    if (strength === 3) return "bg-yellow-400";
    return "bg-green-500";
  };
  
  if (!password) return null;
  
  return (
    <div className="mt-1 space-y-1">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div 
          className={`${getStrengthColor()} h-full transition-all duration-300`} 
          style={{ width: `${(strength / 4) * 100}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{getStrengthLabel()}</p>
    </div>
  );
} 