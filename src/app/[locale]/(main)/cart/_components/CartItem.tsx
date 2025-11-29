"use client";

import { useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "@/types/cart";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const t = useTranslations("cart");
  const tProducts = useTranslations("products");
  const { updateQuantity, removeItem } = useCartStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || isUpdating) return;

    setIsUpdating(true);
    try {
      await updateQuantity(item._id, newQuantity);
    } catch (error) {
      // Handle stock limit error
      if (error instanceof AxiosError && error.response?.status === 400) {
        const message = error.response?.data?.message || "";

        // Check if it's a stock-related error
        if (
          message.toLowerCase().includes("quantity") ||
          message.toLowerCase().includes("stock") ||
          message.toLowerCase().includes("available")
        ) {
          toast.error(tProducts("notEnoughStock"), {
            icon: "📦",
            duration: 4000,
          });
        } else {
          toast.error(message || t("updateError"));
        }
      } else {
        toast.error(t("updateError"));
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const productId =
    typeof item.product === "string"
      ? item.product
      : (item.product as { _id: string })._id;

  return (
    <div className="flex gap-4 py-4 first:pt-0 last:pb-0">
      {/* Image */}
      <Link href={`/products/${productId}`} className="shrink-0">
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
          <SafeImage
            src={getImageUrl(item.productImage || "")}
            alt={item.nameOfProduct || "Product"}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${productId}`}
          className="font-medium hover:text-primary transition-colors line-clamp-2"
        >
          {item.nameOfProduct || "Product"}
        </Link>

        {/* Price */}
        <p className="text-primary font-semibold mt-1">
          {formatPrice(item.price)}
        </p>

        {/* Color */}
        {item.color && (
          <div className="flex items-center gap-2 mt-1">
            <span
              className="w-4 h-4 rounded-full border border-border"
              style={{ backgroundColor: item.color }}
            />
          </div>
        )}

        {/* Quantity Controls */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={item.quantity <= 1 || isUpdating}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-medium">
              {isUpdating ? (
                <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUpdating}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeItem(item._id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 me-1" />
            {t("remove")}
          </Button>
        </div>
      </div>

      {/* Total */}
      <div className="text-end">
        <p className="font-semibold">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>
    </div>
  );
}
