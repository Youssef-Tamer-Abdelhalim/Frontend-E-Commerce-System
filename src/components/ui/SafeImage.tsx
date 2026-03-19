"use client";

import { useState, useMemo } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
  disableCache?: boolean;
}

export function SafeImage({
  src,
  alt,
  fallbackSrc = "/images/placeholder.svg",
  className,
  disableCache = false,
  ...props
}: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [cacheVersion, setCacheVersion] = useState(0);
  const sourceValue = typeof src === "string" ? src : null;
  const hasError = Boolean(sourceValue && failedSrc === sourceValue);

  // Add cache buster to backend images if disableCache is true
  const imageSrc = useMemo(() => {
    if (hasError) return fallbackSrc;
    if (!sourceValue) return src;

    // Only add cache buster to backend URLs
    if (disableCache && sourceValue.includes("railway.app")) {
      const separator = sourceValue.includes("?") ? "&" : "?";
      return `${sourceValue}${separator}v=${cacheVersion}`;
    }

    return sourceValue;
  }, [src, sourceValue, hasError, fallbackSrc, disableCache, cacheVersion]);

  return (
    <Image
      {...props}
      key={`${sourceValue ?? "image"}-${hasError ? "fallback" : "main"}-${cacheVersion}`}
      src={imageSrc}
      alt={alt}
      className={cn(className)}
      unoptimized
      onError={() => {
        if (sourceValue && failedSrc !== sourceValue) {
          setFailedSrc(sourceValue);
        }
        if (disableCache && sourceValue) {
          setCacheVersion((prev) => prev + 1);
        }
      }}
    />
  );
}
