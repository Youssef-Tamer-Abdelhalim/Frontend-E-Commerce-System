"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { brandsApi } from "@/lib/api";
import { Brand } from "@/types";
import { Skeleton } from "@/components/ui";
import { SafeImage } from "@/components/ui/SafeImage";
import { getImageUrl } from "@/lib/utils";

export function BrandsSection() {
  const t = useTranslations("home");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await brandsApi.getAll({ limit: 8 });
        setBrands(response.data);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBrands();
  }, []);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            {t("popularBrands")}
          </h2>
          <p className="text-muted-foreground mt-1">{t("brandsSubtitle")}</p>
        </div>

        {/* Brands Grid */}
        {isLoading ? (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {brands.map((brand) => (
              <Link
                key={brand._id}
                href={`/products?brand=${brand._id}`}
                className="group aspect-square rounded-lg border border-border bg-card p-4 hover:border-primary transition-colors flex items-center justify-center"
              >
                <SafeImage
                  src={getImageUrl(brand.image)}
                  alt={brand.name}
                  width={80}
                  height={80}
                  className="object-contain grayscale group-hover:grayscale-0 transition-all"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
