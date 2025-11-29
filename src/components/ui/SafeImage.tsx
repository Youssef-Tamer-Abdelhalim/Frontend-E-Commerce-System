"use client";

import { useState, useEffect, useMemo } from "react";
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
  const [hasError, setHasError] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
    setImageKey((prev) => prev + 1);
  }, [src]);

  // Add cache buster to backend images if disableCache is true
  const imageSrc = useMemo(() => {
    if (hasError) return fallbackSrc;
    if (!src || typeof src !== "string") return src;

    // Only add cache buster to backend URLs
    if (disableCache && src.includes("railway.app")) {
      const separator = src.includes("?") ? "&" : "?";
      return `${src}${separator}v=${imageKey}`;
    }

    return src;
  }, [src, hasError, fallbackSrc, disableCache, imageKey]);

  return (
    <Image
      {...props}
      key={imageKey}
      src={imageSrc}
      alt={alt}
      className={cn(className)}
      unoptimized
      onError={() => {
        if (!hasError) {
          setHasError(true);
        }
      }}
    />
  );
}
