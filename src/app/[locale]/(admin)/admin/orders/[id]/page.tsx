"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ordersApi } from "@/lib/api";
import { Order } from "@/types/order";
import { SafeImage } from "@/components/ui/SafeImage";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Skeleton,
  Badge,
} from "@/components/ui";
import { formatPrice, formatDate, getImageUrl } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle,
  Truck,
  Package,
  User,
  MapPin,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("admin");
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await ordersApi.getById(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast.error(t("orderNotFound") || "الطلب غير موجود");
      router.push("/admin/orders");
    } finally {
      setIsLoading(false);
    }
  }, [orderId, router, t]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleUpdatePaid = async () => {
    if (!order) return;
    setIsUpdating(true);
    try {
      await ordersApi.updatePaidStatus(order._id);
      toast.success(t("orderUpdated"));
      fetchOrder();
    } catch (error) {
      console.error("Failed to update paid status:", error);
      toast.error(t("updateError"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateDelivered = async () => {
    if (!order) return;
    setIsUpdating(true);
    try {
      await ordersApi.updateDeliveredStatus(order._id);
      toast.success(t("orderUpdated"));
      fetchOrder();
    } catch (error) {
      console.error("Failed to update delivered status:", error);
      toast.error(t("updateError"));
    } finally {
      setIsUpdating(false);
    }
  };

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
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {t("orderDetails")} #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">{getStatusBadge(order)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t("orderItems")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 border border-border rounded-lg"
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      <SafeImage
                        src={getImageUrl(
                          typeof item.product === "object" &&
                            item.product?.imageCover
                            ? item.product.imageCover
                            : ""
                        )}
                        alt={
                          typeof item.product === "object"
                            ? item.product?.title || ""
                            : ""
                        }
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {typeof item.product === "object"
                          ? item.product?.title
                          : "Product"}
                      </h3>
                      {item.color && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {t("color")}:
                          </span>
                          <div
                            className="w-4 h-4 rounded-full border border-border"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {t("quantity")}: {item.quantity}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-semibold">{formatPrice(item.price)}</p>
                      <p className="text-sm text-muted-foreground">
                        × {item.quantity} ={" "}
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t("shippingAddress")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shippingAddress ? (
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    {order.shippingAddress.details}
                  </p>
                  <p className="text-muted-foreground">
                    {order.shippingAddress.city}
                    {order.shippingAddress.postalCode &&
                      `, ${order.shippingAddress.postalCode}`}
                  </p>
                  <p className="text-muted-foreground">
                    {t("phone")}: {order.shippingAddress.phone}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">{t("noAddress")}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("customer")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.user && typeof order.user !== "string" ? (
                <div className="space-y-2">
                  <p className="font-medium">{order.user.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {order.user.email}
                  </p>
                  {order.user.phone && (
                    <p className="text-muted-foreground text-sm">
                      {order.user.phone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">{t("guest")}</p>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t("payment")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("paymentMethod")}
                  </span>
                  <span className="font-medium">
                    {order.paymentMethodType === "online"
                      ? t("card")
                      : t("cash")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("paymentStatus")}
                  </span>
                  <Badge variant={order.isPaid ? "success" : "secondary"}>
                    {order.isPaid ? t("paid") : t("unpaid")}
                  </Badge>
                </div>
                {order.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("paidAt")}</span>
                    <span className="text-sm">{formatDate(order.paidAt)}</span>
                  </div>
                )}
                <hr className="border-border" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("subtotal")}</span>
                  <span>
                    {formatPrice(
                      order.totalOrderPrice -
                        (order.shippingPrice || 0) -
                        (order.taxPrice || 0)
                    )}
                  </span>
                </div>
                {order.shippingPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("shipping")}
                    </span>
                    <span>{formatPrice(order.shippingPrice)}</span>
                  </div>
                )}
                {order.taxPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("tax")}</span>
                    <span>{formatPrice(order.taxPrice)}</span>
                  </div>
                )}
                <hr className="border-border" />
                <div className="flex justify-between text-lg font-bold">
                  <span>{t("total")}</span>
                  <span>{formatPrice(order.totalOrderPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("actions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!order.isPaid && (
                <Button
                  className="w-full"
                  onClick={handleUpdatePaid}
                  disabled={isUpdating}
                >
                  <CheckCircle className="h-4 w-4 me-2" />
                  {t("markAsPaid")}
                </Button>
              )}
              {order.isPaid && !order.isDelivered && (
                <Button
                  className="w-full"
                  onClick={handleUpdateDelivered}
                  disabled={isUpdating}
                >
                  <Truck className="h-4 w-4 me-2" />
                  {t("markAsDelivered")}
                </Button>
              )}
              {order.isDelivered && (
                <p className="text-center text-muted-foreground py-2">
                  {t("orderCompleted")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
