"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { CartItem } from "./_components/CartItem";
import { CartSummary } from "./_components/CartSummary";
import { ShoppingCart, ArrowRight } from "lucide-react";

export default function CartPage() {
  const t = useTranslations();
  const { items, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const breadcrumbItems = [{ label: t("nav.cart") }];

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-4">{t("cart.empty")}</h1>
          <p className="text-muted-foreground mb-8">{t("cart.emptyMessage")}</p>
          <Link href="/products">
            <Button size="lg">
              {t("cart.continueShopping")}
              <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">{t("cart.title")}</h1>
        <Button variant="outline" onClick={() => clearCart()}>
          {t("cart.clearCart")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("cart.itemsCount", { count: items.length })}
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {items.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>

      {/* Login Prompt */}
      {!isAuthenticated && (
        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-muted-foreground mb-4">{t("cart.loginPrompt")}</p>
          <Link href="/login">
            <Button variant="outline">{t("auth.login")}</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
