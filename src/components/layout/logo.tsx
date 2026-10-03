"use client";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
  size = "md",
}: {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "sm" ? "w-7 h-7" : size === "lg" ? "w-12 h-12" : "w-9 h-9";
  const text =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div
          className={cn(
            "rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-md shadow-primary/20",
            dim
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-2/3 h-2/3"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 8h16M6 8v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8M9 4h6M10 12h4" />
          </svg>
        </div>
        <div className="absolute -inset-0.5 rounded-xl bg-primary/20 blur-md -z-10" />
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight", text)}>Tablo</span>
      )}
    </div>
  );
}
