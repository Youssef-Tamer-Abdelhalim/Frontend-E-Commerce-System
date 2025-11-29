"use client";

import { useEffect, useState, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ordersApi } from "@/lib/api";
import { Order } from "@/types/order";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Pagination,
  Skeleton,
  Badge,
  Select,
} from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/utils";
import { Eye, Truck, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminOrdersPage() {
  const t = useTranslations("admin");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: { page: number; limit: number } = {
        page: currentPage,
        limit: 10,
      };
      const response = await ordersApi.getAll(params);
      let filteredOrders = response.data;

      // Client-side filtering since API might not support it
      if (statusFilter !== "all") {
        filteredOrders = filteredOrders.filter((order: Order) => {
          if (statusFilter === "pending") return !order.isPaid;
          if (statusFilter === "paid")
            return order.isPaid && !order.isDelivered;
          if (statusFilter === "delivered") return order.isDelivered;
          return true;
        });
      }

      setOrders(filteredOrders);
      setTotalPages(response.paginationResult?.numberOfPages || 1);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdatePaid = async (id: string) => {
    try {
      await ordersApi.updatePaidStatus(id);
      toast.success(t("orderUpdated"));
      fetchOrders();
    } catch (error: unknown) {
      console.error("Update paid error:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t("updateError"));
    }
  };

  const handleUpdateDelivered = async (id: string) => {
    try {
      await ordersApi.updateDeliveredStatus(id);
      toast.success(t("orderUpdated"));
      fetchOrders();
    } catch (error: unknown) {
      console.error("Update delivered error:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t("updateError"));
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

  const filterOptions = [
    { value: "all", label: t("allOrders") },
    { value: "pending", label: t("pending") },
    { value: "paid", label: t("processing") },
    { value: "delivered", label: t("delivered") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("orders")}</h1>
          <p className="text-muted-foreground">{t("manageOrders")}</p>
        </div>
        <div className="w-48">
          <Select
            options={filterOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("allOrders")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border border-border rounded-lg"
                >
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {t("noOrders")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-start p-3 font-medium">
                      {t("orderId")}
                    </th>
                    <th className="text-start p-3 font-medium">
                      {t("customer")}
                    </th>
                    <th className="text-start p-3 font-medium">{t("date")}</th>
                    <th className="text-start p-3 font-medium">{t("total")}</th>
                    <th className="text-start p-3 font-medium">
                      {t("status")}
                    </th>
                    <th className="text-end p-3 font-medium">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="p-3">
                        <span className="font-mono text-sm">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        {order.user && typeof order.user !== "string"
                          ? order.user.name
                          : t("guest")}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="p-3 font-semibold">
                        {formatPrice(order.totalOrderPrice)}
                      </td>
                      <td className="p-3">{getStatusBadge(order)}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/orders/${order._id}`}>
                            <Button variant="outline" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {!order.isPaid && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleUpdatePaid(order._id)}
                              title={t("markAsPaid")}
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          {order.isPaid && !order.isDelivered && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleUpdateDelivered(order._id)}
                              title={t("markAsDelivered")}
                            >
                              <Truck className="h-4 w-4 text-blue-500" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
