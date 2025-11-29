"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { productsApi } from "@/lib/api";
import { Product } from "@/types";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductGridSkeleton } from "@/components/ui";

interface RelatedProductsProps {
  productId: string;
  categoryId?: string;
}

export function RelatedProducts({
  productId,
  categoryId,
}: RelatedProductsProps) {
  const t = useTranslations("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedProducts() {
      if (!categoryId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await productsApi.getAll({
          category: categoryId,
          limit: 4,
        });
        // Filter out current product
        setProducts(response.data.filter((p: Product) => p._id !== productId));
      } catch (error) {
        console.error("Failed to fetch related products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRelatedProducts();
  }, [categoryId, productId]);

  if (!categoryId || (!isLoading && products.length === 0)) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-xl font-bold mb-6">{t("relatedProducts")}</h2>
      {isLoading ? (
        <ProductGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
