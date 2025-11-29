"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ordersApi } from "@/lib/api";
import { Order } from "@/types/order";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Skeleton,
} from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function RecentOrders() {
  const t = useTranslations("admin");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await ordersApi.getAll({ limit: 5 });
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const getStatusBadge = (order: Order) => {
    if (order.isDelivered) {
      return <Badge variant="success">{t("delivered")}</Badge>;
    }
    if (order.isPaid) {
      return <Badge variant="warning">{t("processing")}</Badge>;
    }
    return <Badge variant="secondary">{t("pending")}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("recentOrders")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{t("recentOrders")}</CardTitle>
        <Link href="/admin/orders">
          <Button variant="ghost" size="sm">
            {t("viewAll")}
            <ArrowRight className="h-4 w-4 ms-1 rtl:rotate-180" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {t("noOrders")}
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                href={`/admin/orders/${order._id}`}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div>
                  <p className="font-medium">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.user && typeof order.user !== "string"
                      ? order.user.name
                      : t("guest")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-end">
                  <p className="font-semibold">
                    {formatPrice(order.totalOrderPrice)}
                  </p>
                  {getStatusBadge(order)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
