"use client";

import { useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { useTranslations } from "next-intl";
import { Product, Category } from "@/types";
import { Button, Rating, Badge } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useAuthStore } from "@/stores/authStore";
import {
  formatPrice,
  getImageUrl,
  getDiscountPercentage,
  cn,
} from "@/lib/utils";
import { Heart, ShoppingCart, Minus, Plus, Share2, Check } from "lucide-react";
import toast from "react-hot-toast";

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const t = useTranslations();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist: checkWishlist,
  } = useWishlistStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || "#000000"
  );
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const isInWishlist = checkWishlist(product._id);
  const hasDiscount =
    product.priceAfterDiscount && product.priceAfterDiscount < product.price;
  const discountPercentage = hasDiscount
    ? getDiscountPercentage(product.price, product.priceAfterDiscount!)
    : 0;

  const images = [product.imageCover, ...(product.images || [])];

  const handleAddToCart = async () => {
    if (product.quantity < quantity) {
      toast.error(t("products.notEnoughStock"));
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(product._id, selectedColor);
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t("common.linkCopied"));
    }
  };

  const categoryData = product.category as Category | undefined;
  const breadcrumbItems = [
    { label: t("nav.products"), href: "/products" },
    ...(categoryData && categoryData._id
      ? [
          {
            label: categoryData.name,
            href: `/products?category=${categoryData._id}`,
          },
        ]
      : []),
    { label: product.title },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
            <SafeImage
              src={getImageUrl(images[selectedImage])}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
            {hasDiscount && (
              <Badge variant="destructive" className="absolute top-4 start-4">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "relative w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-colors",
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent"
                  )}
                >
                  <SafeImage
                    src={getImageUrl(image)}
                    alt={`${product.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Category & Brand */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {product.category && typeof product.category !== "string" && (
              <span>{product.category.name}</span>
            )}
            {product.brand && typeof product.brand !== "string" && (
              <>
                <span>•</span>
                <span>{product.brand.name}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold">{product.title}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <Rating value={product.ratingsAverage || 0} showValue />
            <span className="text-muted-foreground">
              ({product.ratingsQuantity || 0} {t("products.reviews")})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(
                hasDiscount ? product.priceAfterDiscount! : product.price
              )}
            </span>
            {hasDiscount && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {product.quantity > 0 ? (
              <>
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-green-600">{t("products.inStock")}</span>
                <span className="text-muted-foreground">
                  ({product.quantity} {t("products.available")})
                </span>
              </>
            ) : (
              <span className="text-destructive">
                {t("products.outOfStock")}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">
                {t("products.colors")}
              </h3>
              <div className="flex gap-2">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-colors",
                      selectedColor === color
                        ? "border-primary"
                        : "border-border"
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="text-sm font-medium mb-2">
              {t("products.quantity")}
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(product.quantity, q + 1))
                }
                className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"
                disabled={quantity >= product.quantity}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.quantity < 1 || isAddingToCart}
              isLoading={isAddingToCart}
            >
              <ShoppingCart className="h-5 w-5 me-2" />
              {t("cart.addToCart")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleWishlistToggle}
              className={cn(
                isInWishlist && "text-destructive border-destructive"
              )}
            >
              <Heart
                className={cn("h-5 w-5", isInWishlist && "fill-current")}
              />
            </Button>
            <Button variant="outline" size="lg" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
