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
  sizes,
  ...props
}: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [cacheVersion, setCacheVersion] = useState(0);
  const sourceValue = typeof src === "string" ? src : null;
  const hasError = Boolean(sourceValue && failedSrc === sourceValue);

  // Determine if this is a Cloudinary URL
  const isCloudinary = Boolean(sourceValue && sourceValue.includes('res.cloudinary.com'));

  // Default sizes for fill images to prevent Next.js warning
  const hasFill = 'fill' in props && props.fill;
  const resolvedSizes = sizes || (hasFill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined);

  // Add cache buster to backend images if disableCache is true (skip Cloudinary — versioned URLs)
  const imageSrc = useMemo(() => {
    if (hasError) return fallbackSrc;
    if (!sourceValue) return src;

    // Only add cache buster to non-Cloudinary backend URLs
    if (disableCache && !isCloudinary && (sourceValue.includes("railway.app") || sourceValue.includes("localhost:8000"))) {
      const separator = sourceValue.includes("?") ? "&" : "?";
      return `${sourceValue}${separator}v=${cacheVersion}`;
    }

    return sourceValue;
  }, [src, sourceValue, hasError, fallbackSrc, disableCache, isCloudinary, cacheVersion]);

  return (
    <Image
      {...props}
      key={`${sourceValue ?? "image"}-${hasError ? "fallback" : "main"}-${cacheVersion}`}
      src={imageSrc}
      alt={alt}
      className={cn(className)}
      sizes={resolvedSizes}
      unoptimized={!isCloudinary}
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
