"use client";

import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-[var(--primary)] text-[var(--primary-foreground)]": variant === "default",
          "bg-[var(--secondary)] text-[var(--secondary-foreground)]": variant === "secondary",
          "border border-[var(--border)] text-[var(--foreground)]": variant === "outline",
          "bg-[var(--success)] text-[var(--success-foreground)]": variant === "success",
          "bg-[var(--warning)] text-[var(--warning-foreground)]": variant === "warning",
          "bg-[var(--destructive)] text-[var(--destructive-foreground)]": variant === "destructive",
        },
        className
      )}
      {...props}
    />
  );
}
