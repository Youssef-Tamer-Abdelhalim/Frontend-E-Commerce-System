"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/stores/cartStore";
import { Button, Card, CardContent } from "@/components/ui";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";

export default function CheckoutSuccessPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { resetCart } = useCartStore();
  const [isCleared, setIsCleared] = useState(false);

  useEffect(() => {
    // Clear the cart after successful payment
    if (!isCleared) {
      resetCart();
      setIsCleared(true);
    }
  }, [resetCart, isCleared]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto text-center">
        <Card>
          <CardContent className="p-8">
            {/* Success Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t("checkout.paymentSuccess")}
            </h1>

            <p className="text-muted-foreground mb-6">
              {t("checkout.orderConfirmed")}
            </p>

            {/* Order Info */}
            {sessionId && (
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {t("checkout.sessionId")}
                </p>
                <p className="text-xs font-mono text-foreground break-all">
                  {sessionId}
                </p>
              </div>
            )}

            {/* What's Next */}
            <div className="text-start bg-muted/30 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                {t("checkout.whatsNext")}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  {t("checkout.emailConfirmation")}
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  {t("checkout.orderProcessing")}
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  {t("checkout.trackOrder")}
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/orders" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Package className="w-4 h-4 me-2" />
                  {t("checkout.viewOrders")}
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full">
                  <Home className="w-4 h-4 me-2" />
                  {t("checkout.continueShopping")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
