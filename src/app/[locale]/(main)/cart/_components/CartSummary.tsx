"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { ordersApi } from "@/lib/api";
import { Address } from "@/types";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import { Tag, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { AddressSelectionModal } from "./AddressSelectionModal";

export function CartSummary() {
  const t = useTranslations();
  const {
    items,
    applyCoupon,
    totalCartPrice,
    totalCartPriceAfterDiscount,
    cartId,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const subtotal =
    totalCartPrice ||
    items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 0; // Shipping comes from backend
  const tax = 0; // Tax comes from backend
  const hasDiscount =
    totalCartPriceAfterDiscount && totalCartPriceAfterDiscount < subtotal;
  const discountAmount = hasDiscount
    ? subtotal - totalCartPriceAfterDiscount
    : 0;
  const total =
    (hasDiscount ? totalCartPriceAfterDiscount : subtotal) + shipping + tax;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    try {
      await applyCoupon(couponCode.trim().toUpperCase());
      toast.success(t("cart.couponApplied"));
      setCouponCode("");
    } catch {
      toast.error(t("cart.invalidCoupon"));
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error(t("auth.loginRequired"));
      return;
    }

    if (!cartId) {
      toast.error(t("cart.checkoutError"));
      return;
    }

    // Show address selection modal
    setShowAddressModal(true);
  };

  const handleAddressSelected = async (address: Address) => {
    if (!cartId) return;

    setIsCheckingOut(true);
    try {
      // Create checkout session (Stripe) with selected address
      const response = await ordersApi.createCheckoutSession(cartId, {
        shippingAddress: {
          details: address.details,
          phone: address.phone,
          city: address.city,
          postalCode: address.postalCode || "",
        },
      });

      if (response.session?.url) {
        // Don't clear cart here! It will be cleared after successful payment in success page
        window.location.href = response.session.url;
      }
    } catch {
      toast.error(t("cart.checkoutError"));
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>{t("cart.summary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Coupon */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t("cart.couponCode")}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder={t("cart.enterCoupon")}
                className="ps-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleApplyCoupon}
              isLoading={isApplyingCoupon}
            >
              {t("cart.apply")}
            </Button>
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("cart.subtotal")}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>{t("cart.discount")}</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("cart.shipping")}</span>
            <span>{formatPrice(shipping)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("cart.tax")}</span>
            <span>{formatPrice(tax)}</span>
          </div>

          <div className="flex justify-between font-semibold text-lg pt-3 border-t border-border">
            <span>{t("cart.total")}</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          size="lg"
          className="w-full"
          onClick={handleCheckout}
          isLoading={isCheckingOut}
          disabled={items.length === 0 || !isAuthenticated}
        >
          <CreditCard className="h-5 w-5 me-2" />
          {t("cart.checkout")}
        </Button>
      </CardContent>

      {/* Address Selection Modal */}
      <AddressSelectionModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSelect={handleAddressSelected}
      />
    </Card>
  );
}
