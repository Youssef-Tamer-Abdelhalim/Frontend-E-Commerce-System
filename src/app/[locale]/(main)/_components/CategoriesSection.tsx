"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { categoriesApi } from "@/lib/api";
import { Category } from "@/types";
import { CategoryCardSkeleton } from "@/components/ui";
import { SafeImage } from "@/components/ui/SafeImage";
import { getImageUrl } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function CategoriesSection() {
  const t = useTranslations("home");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await categoriesApi.getAll({ limit: 6 });
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              {t("shopByCategory")}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t("categoriesSubtitle")}
            </p>
          </div>
          <Link
            href="/categories"
            className="hidden sm:flex items-center text-primary hover:underline"
          >
            {t("viewAll")}
            <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/products?category=${category._id}`}
                className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-primary transition-colors"
              >
                <div className="aspect-square relative">
                  <SafeImage
                    src={getImageUrl(category.image)}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                </div>
                <div className="absolute bottom-0 start-0 end-0 p-3 text-center">
                  <h3 className="font-medium text-white">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Mobile View All Link */}
        <Link
          href="/categories"
          className="flex sm:hidden items-center justify-center text-primary hover:underline mt-6"
        >
          {t("viewAll")}
          <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </section>
  );
}
