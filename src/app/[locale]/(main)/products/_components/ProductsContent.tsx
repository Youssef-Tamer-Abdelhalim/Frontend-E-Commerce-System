"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { productsApi } from "@/lib/api";
import { Product } from "@/types";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductGridSkeleton, Select } from "@/components/ui";
import { useFiltersStore } from "@/stores/filtersStore";
import { Grid, List, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductsContentProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function ProductsContent({ searchParams }: ProductsContentProps) {
  const t = useTranslations("products");
  const urlParams = useSearchParams();
  const {
    sort,
    setSort,
    priceMin,
    priceMax,
    category: filterCategory,
    brand: filterBrand,
  } = useFiltersStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const category =
    searchParams.category ||
    urlParams.get("category") ||
    filterCategory ||
    undefined;
  const brand =
    searchParams.brand || urlParams.get("brand") || filterBrand || undefined;
  const search = searchParams.search || urlParams.get("search") || undefined;

  const fetchProducts = useCallback(
    async (page: number, append: boolean = false) => {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const params: Record<string, unknown> = {
          page,
          limit: 12,
          sort: sort || "-createdAt",
        };

        if (category) params.category = category;
        if (brand) params.brand = brand;
        if (search) params.keyword = search;
        if (priceMin !== null && priceMin > 0) params["price[gte]"] = priceMin;
        if (priceMax !== null && priceMax < 10000)
          params["price[lte]"] = priceMax;

        const response = await productsApi.getAll(params);

        const totalPages =
          response.paginationResult?.numberOfPages ||
          response.pagination?.numberOfPages ||
          1;
        setHasMore(page < totalPages);
        setTotalResults(response.results || 0);

        if (append) {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p._id));
            const newProducts = response.data.filter(
              (p) => !existingIds.has(p._id)
            );
            return [...prev, ...newProducts];
          });
        } else {
          setProducts(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [sort, category, brand, search, priceMin, priceMax]
  );

  // Reset and fetch when filters change
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchProducts(1, false);
  }, [fetchProducts]);

  // Infinite scroll observer
  useEffect(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setCurrentPage((prev) => {
            const nextPage = prev + 1;
            fetchProducts(nextPage, true);
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
  }, [isLoading, isLoadingMore, hasMore, fetchProducts]);

  const sortOptions = [
    { value: "-createdAt", label: t("sortNewest") },
    { value: "createdAt", label: t("sortOldest") },
    { value: "price", label: t("sortPriceLow") },
    { value: "-price", label: t("sortPriceHigh") },
    { value: "-ratingsAverage", label: t("sortRating") },
    { value: "-sold", label: t("sortBestSelling") },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("resultsCount", { count: totalResults })}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Sort */}
          <div className="flex-1 sm:flex-initial sm:w-48">
            <Select
              options={sortOptions}
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center border border-border rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products */}
      {isLoading ? (
        <ProductGridSkeleton count={12} />
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("noProducts")}</p>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
              : "space-y-4"
          )}
        >
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              className={viewMode === "list" ? "flex-row" : ""}
            />
          ))}
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      <div ref={loadMoreRef} className="mt-8 py-4">
        {isLoadingMore && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("loadingMore") || "Loading more..."}</span>
          </div>
        )}
        {!hasMore && products.length > 0 && (
          <p className="text-center text-muted-foreground text-sm">
            {t("noMoreProducts") || "No more products to load"}
          </p>
        )}
      </div>
    </div>
  );
}
