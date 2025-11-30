"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { categoriesApi } from "@/lib/api";
import { Category } from "@/types";
import { SafeImage } from "@/components/ui/SafeImage";
import { Skeleton } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { getImageUrl } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function CategoriesPage() {
  const t = useTranslations();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchCategories = useCallback(
    async (page: number, append: boolean = false) => {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await categoriesApi.getAll({
          page,
          limit: 20,
        });

        const totalPages =
          response.paginationResult?.numberOfPages ||
          response.pagination?.numberOfPages ||
          1;
        setHasMore(page < totalPages);

        if (append) {
          setCategories((prev) => {
            const existingIds = new Set(prev.map((c) => c._id));
            const newCategories = response.data.filter(
              (c) => !existingIds.has(c._id)
            );
            return [...prev, ...newCategories];
          });
        } else {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchCategories(1, false);
  }, [fetchCategories]);

  // Infinite scroll observer
  useEffect(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setCurrentPage((prev) => {
            const nextPage = prev + 1;
            fetchCategories(nextPage, true);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoading, isLoadingMore, hasMore, fetchCategories]);

  const breadcrumbItems = [{ label: t("nav.categories") }];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("nav.categories")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("home.categoriesSubtitle")}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("common.noResults")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/products?category=${category._id}`}
              className="group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border hover:border-primary transition-colors">
                <SafeImage
                  src={getImageUrl(category.image)}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 start-0 end-0 p-4">
                  <h3 className="font-semibold text-white text-center">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {!isLoading && (
        <div ref={loadMoreRef} className="mt-8 py-4">
          {isLoadingMore && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{t("common.loading")}</span>
            </div>
          )}
          {!hasMore && categories.length > 0 && (
            <p className="text-center text-muted-foreground text-sm">
              {t("common.noMoreResults") || "No more categories to load"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
