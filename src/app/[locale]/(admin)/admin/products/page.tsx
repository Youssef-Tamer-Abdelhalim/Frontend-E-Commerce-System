"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { SafeImage } from "@/components/ui/SafeImage";
import { productsApi } from "@/lib/api";
import { Product } from "@/types/product";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Skeleton,
  Badge,
  Input,
} from "@/components/ui";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
  const t = useTranslations("admin");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchProducts = useCallback(
    async (page: number, append: boolean = false, search: string = "") => {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const params: { page: number; limit: number; keyword?: string } = {
          page,
          limit: 12,
        };
        if (search) {
          params.keyword = search;
        }
        const response = await productsApi.getAll(params);

        const totalPages =
          response.paginationResult?.numberOfPages ||
          response.pagination?.numberOfPages ||
          1;
        setHasMore(page < totalPages);

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
    []
  );

  // Initial load
  useEffect(() => {
    fetchProducts(1, false, appliedSearch);
  }, [fetchProducts, appliedSearch]);

  // Infinite scroll observer
  useEffect(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setCurrentPage((prev) => {
            const nextPage = prev + 1;
            fetchProducts(nextPage, true, appliedSearch);
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
  }, [isLoading, isLoadingMore, hasMore, fetchProducts, appliedSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setHasMore(true);
    setAppliedSearch(searchQuery);
  };

  const refreshProducts = () => {
    setCurrentPage(1);
    setHasMore(true);
    fetchProducts(1, false, appliedSearch);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      await productsApi.delete(id);
      toast.success(t("productDeleted"));
      refreshProducts();
    } catch {
      toast.error(t("deleteError"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("products")}</h1>
          <p className="text-muted-foreground">{t("manageProducts")}</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 me-2" />
            {t("addProduct")}
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchProducts")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9"
              />
            </div>
            <Button type="submit">{t("search")}</Button>
          </form>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("allProducts")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border border-border rounded-lg"
                >
                  <Skeleton className="w-16 h-16 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {t("noProducts")}
            </p>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="relative w-16 h-16 rounded overflow-hidden bg-muted shrink-0">
                    <SafeImage
                      src={getImageUrl(product.imageCover)}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{product.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {typeof product.category !== "string" &&
                        product.category?.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      {product.quantity < 10 && (
                        <Badge variant="warning" size="sm">
                          {t("lowStock")}: {product.quantity}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/products/${product._id}`}>
                      <Button variant="outline" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(product._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          <div ref={loadMoreRef} className="mt-6 py-4">
            {isLoadingMore && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{t("loadingMore")}</span>
              </div>
            )}
            {!hasMore && products.length > 0 && (
              <p className="text-center text-muted-foreground text-sm">
                {t("noMoreItems")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
