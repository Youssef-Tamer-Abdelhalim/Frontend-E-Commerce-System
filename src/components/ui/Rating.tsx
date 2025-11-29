"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export function Rating({
  value,
  max = 5,
  size = "md",
  showValue = false,
  className,
}: RatingProps) {
  const sizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, index) => {
          const filled = index < Math.floor(value);
          const partial = index === Math.floor(value) && value % 1 !== 0;

          return (
            <span key={index} className="relative">
              <Star
                className={cn(
                  sizes[size],
                  filled || partial
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                )}
              />
              {partial && (
                <Star
                  className={cn(
                    sizes[size],
                    "absolute inset-0 text-yellow-400 fill-yellow-400"
                  )}
                  style={{
                    clipPath: `inset(0 ${100 - (value % 1) * 100}% 0 0)`,
                  }}
                />
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className={cn("text-muted-foreground", textSizes[size])}>
          ({value.toFixed(1)})
        </span>
      )}
    </div>
  );
}

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RatingInput({
  value,
  onChange,
  max = 5,
  size = "md",
  className,
}: RatingInputProps) {
  const sizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;
        const filled = starValue <= value;

        return (
          <button
            key={index}
            type="button"
            onClick={() => onChange(starValue)}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            aria-label={`Rate ${starValue} out of ${max}`}
          >
            <Star
              className={cn(
                sizes[size],
                "transition-colors cursor-pointer",
                filled
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
