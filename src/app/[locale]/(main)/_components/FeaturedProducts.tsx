"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { productsApi } from "@/lib/api";
import { Product } from "@/types";
import { ProductGridSkeleton } from "@/components/ui";
import { ProductCard } from "@/components/products/ProductCard";
import { ArrowRight } from "lucide-react";

export function FeaturedProducts() {
  const t = useTranslations("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await productsApi.getAll({
          limit: 8,
          sort: "-ratingsAverage",
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              {t("featuredProducts")}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t("featuredSubtitle")}
            </p>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center text-primary hover:underline"
          >
            {t("viewAll")}
            <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Mobile View All Link */}
        <Link
          href="/products"
          className="flex sm:hidden items-center justify-center text-primary hover:underline mt-6"
        >
          {t("viewAll")}
          <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </section>
  );
}
