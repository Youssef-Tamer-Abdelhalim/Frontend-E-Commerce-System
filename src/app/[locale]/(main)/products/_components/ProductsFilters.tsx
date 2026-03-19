"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { categoriesApi, brandsApi, subcategoriesApi } from "@/lib/api";
import { useFiltersStore } from "@/stores/filtersStore";
import { Button, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ChevronDown, X, SlidersHorizontal } from "lucide-react";

interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface SubCategoryData {
  _id: string;
  name: string;
  slug: string;
}

interface BrandData {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

export function ProductsFilters() {
  const t = useTranslations("products");
  const {
    priceMin,
    priceMax,
    setPriceRange,
    category: selectedCategory,
    subCategory: selectedSubCategory,
    brand: selectedBrand,
    setCategory,
    setSubCategory,
    setBrand,
    resetFilters,
  } = useFiltersStore();

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [subCategoriesList, setSubCategoriesList] = useState<SubCategoryData[]>([]);
  const [isLoadingSubCats, setIsLoadingSubCats] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    subCategories: true,
    brands: true,
    price: true,
  });

  const fetchFiltersData = useCallback(async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        categoriesApi.getAll({ limit: 20 }),
        brandsApi.getAll({ limit: 20 }),
      ]);
      setCategories(categoriesRes.data);
      setBrands(brandsRes.data);
    } catch (error) {
      console.error("Failed to fetch filters data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (!selectedCategory) { setSubCategoriesList([]); return; }
    setIsLoadingSubCats(true);
    categoriesApi.getSubcategories(selectedCategory)
      .then((res) => setSubCategoriesList(res.data || []))
      .catch(() => setSubCategoriesList([]))
      .finally(() => setIsLoadingSubCats(false));
  }, [selectedCategory]);

  useEffect(() => {
    fetchFiltersData();
  }, [fetchFiltersData]);

  // Prevent body scroll when mobile filters open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const hasActiveFilters =
    selectedCategory !== null ||
    selectedSubCategory !== null ||
    selectedBrand !== null ||
    (priceMin !== null && priceMin > 0) ||
    (priceMax !== null && priceMax < 10000);

  const activeFiltersCount = [
    selectedCategory,
    selectedSubCategory,
    selectedBrand,
    priceMin !== null && priceMin > 0 ? priceMin : null,
    priceMax !== null && priceMax < 10000 ? priceMax : null,
  ].filter(Boolean).length;

  if (isLoading) {
    return (
      <>
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Desktop Skeleton */}
        <div className="hidden lg:block space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </div>
      </>
    );
  }

  const FiltersContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{t("filters")}</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4 me-1" />
            {t("clearAll")}
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="border-t border-border pt-4">
        <button
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full text-sm font-medium mb-3"
        >
          {t("categories")}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              expandedSections.categories && "rotate-180"
            )}
          />
        </button>
        {expandedSections.categories && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <label
                key={category._id}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedCategory === category._id}
                  onChange={() =>
                    setCategory(
                      selectedCategory === category._id ? null : category._id
                    )
                  }
                  className="rounded border-input"
                />
                <span className="text-foreground">{category.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* SubCategories — shown only when a category is selected and has subcategories */}
      {selectedCategory && (subCategoriesList.length > 0 || isLoadingSubCats) && (
        <div className="border-t border-border pt-4">
          <button
            onClick={() => toggleSection("subCategories")}
            className="flex items-center justify-between w-full text-sm font-medium mb-3"
          >
            {t("subCategories") || "Sub Categories"}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                expandedSections.subCategories && "rotate-180"
              )}
            />
          </button>
          {expandedSections.subCategories && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {isLoadingSubCats ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-5 w-full rounded bg-muted animate-pulse" />
                  ))}
                </div>
              ) : (
                subCategoriesList.map((sc) => (
                  <label
                    key={sc._id}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubCategory === sc._id}
                      onChange={() =>
                        setSubCategory(selectedSubCategory === sc._id ? null : sc._id)
                      }
                      className="rounded border-input"
                    />
                    <span className="text-foreground">{sc.name}</span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Brands */}
      <div className="border-t border-border pt-4">
        <button
          onClick={() => toggleSection("brands")}
          className="flex items-center justify-between w-full text-sm font-medium mb-3"
        >
          {t("brands")}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              expandedSections.brands && "rotate-180"
            )}
          />
        </button>
        {expandedSections.brands && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map((brand) => (
              <label
                key={brand._id}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedBrand === brand._id}
                  onChange={() =>
                    setBrand(selectedBrand === brand._id ? null : brand._id)
                  }
                  className="rounded border-input"
                />
                <span className="text-foreground">{brand.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-t border-border pt-4">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full text-sm font-medium mb-3"
        >
          {t("priceRange")}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              expandedSections.price && "rotate-180"
            )}
          />
        </button>
        {expandedSections.price && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={t("min")}
                value={priceMin || ""}
                onChange={(e) =>
                  setPriceRange(Number(e.target.value) || null, priceMax)
                }
                className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background"
              />
              <span className="text-muted-foreground self-center">-</span>
              <input
                type="number"
                placeholder={t("max")}
                value={priceMax || ""}
                onChange={(e) =>
                  setPriceRange(priceMin, Number(e.target.value) || null)
                }
                className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsMobileOpen(true)}
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            {t("filters")}
          </span>
          {activeFiltersCount > 0 && (
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {/* Mobile Filters Modal */}
      {isMobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Panel */}
          <div className="fixed inset-y-0 start-0 z-50 w-full max-w-xs bg-card shadow-xl lg:hidden overflow-y-auto">
            {/* Mobile Header */}
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-card">
              <h2 className="font-semibold">{t("filters")}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {/* Mobile Content */}
            <div className="p-4 space-y-6">
              <FiltersContent />
            </div>
            {/* Mobile Footer */}
            <div className="sticky bottom-0 p-4 border-t border-border bg-card">
              <Button className="w-full" onClick={() => setIsMobileOpen(false)}>
                {t("applyFilters")}{" "}
                {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Desktop Filters */}
      <div className="hidden lg:block space-y-6 bg-card rounded-xl border border-border p-4">
        <FiltersContent />
      </div>
    </>
  );
}
