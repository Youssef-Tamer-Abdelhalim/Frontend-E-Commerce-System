"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Product } from "@/types";
import { Button, Rating, Badge } from "@/components/ui";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useAuthStore } from "@/stores/authStore";
import {
  cn,
  formatPrice,
  getImageUrl,
  getDiscountPercentage,
} from "@/lib/utils";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const t = useTranslations();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist: checkWishlist,
  } = useWishlistStore();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const isInWishlist = checkWishlist(product._id);
  const hasDiscount =
    product.priceAfterDiscount && product.priceAfterDiscount < product.price;
  const discountPercentage = hasDiscount
    ? getDiscountPercentage(product.price, product.priceAfterDiscount!)
    : 0;

  const handleAddToCart = async () => {
    if (product.quantity < 1) {
      toast.error(t("products.outOfStock"));
      return;
    }

    setIsAddingToCart(true);
    try {
      // Only pass color if product has colors
      const color = product.colors?.length ? product.colors[0] : undefined;
      await addToCart(product._id, color);
      toast.success(t("cart.addedToCart"));
    } catch {
      toast.error(t("cart.checkoutError"));
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error(t("auth.loginRequired"));
      return;
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist(product._id);
        toast.success(t("wishlist.removed"));
      } else {
        await addToWishlist(product._id);
        toast.success(t("wishlist.added"));
      }
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-lg",
        className
      )}
    >
      {/* Badges */}
      <div className="absolute top-3 start-3 z-10 flex flex-col gap-2">
        {hasDiscount && (
          <Badge variant="destructive" size="sm">
            -{discountPercentage}%
          </Badge>
        )}
        {product.quantity < 1 && (
          <Badge variant="secondary" size="sm">
            {t("products.outOfStock")}
          </Badge>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className={cn(
          "absolute top-3 end-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm transition-colors",
          isInWishlist
            ? "text-destructive"
            : "text-muted-foreground hover:text-destructive"
        )}
        aria-label={isInWishlist ? t("wishlist.remove") : t("wishlist.add")}
      >
        <Heart className={cn("h-5 w-5", isInWishlist && "fill-current")} />
      </button>

      {/* Image */}
      <Link href={`/products/${product._id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <SafeImage
            src={getImageUrl(product.imageCover)}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {/* Quick View Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="flex items-center gap-2 text-white text-sm font-medium">
              <Eye className="h-4 w-4" />
              {t("products.quickView")}
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Category/Brand */}
        {product.category && typeof product.category !== "string" && (
          <p className="text-xs text-muted-foreground mb-1">
            {product.category.name}
          </p>
        )}

        {/* Title */}
        <Link href={`/products/${product._id}`}>
          <h3 className="font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mt-2">
          <Rating value={product.ratingsAverage || 0} size="sm" />
          <span className="text-xs text-muted-foreground">
            ({product.ratingsQuantity || 0})
          </span>
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              {formatPrice(
                hasDiscount ? product.priceAfterDiscount! : product.price
              )}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <Button
            variant="primary"
            size="icon"
            onClick={handleAddToCart}
            disabled={product.quantity < 1 || isAddingToCart}
            aria-label={t("cart.addToCart")}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
