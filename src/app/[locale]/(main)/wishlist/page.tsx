"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductGridSkeleton } from "@/components/ui";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui";
import { Link } from "@/i18n/navigation";

export default function WishlistPage() {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { products, isLoading, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, authLoading, fetchWishlist, router]);

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return <ProductGridSkeleton count={8} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{t("wishlist.title")}</h1>
          <p className="text-muted-foreground">
            {t("wishlist.itemCount", { count: products.length })}
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t("wishlist.empty")}</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {t("wishlist.emptyDescription")}
          </p>
          <Link href="/products">
            <Button>
              <ShoppingBag className="h-4 w-4 me-2" />
              {t("wishlist.startShopping")}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
