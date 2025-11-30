"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  Skeleton,
  Badge,
  Select,
} from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/utils";
import { Eye, Truck, CheckCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminOrdersPage() {
  const t = useTranslations("admin");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchOrders = useCallback(
    async (page: number, append: boolean = false, filter: string = "all") => {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const params: { page: number; limit: number } = {
          page,
          limit: 12,
        };
        const response = await ordersApi.getAll(params);
        let filteredOrders = response.data;

        // Client-side filtering since API might not support it
        if (filter !== "all") {
          filteredOrders = filteredOrders.filter((order: Order) => {
            if (filter === "pending") return !order.isPaid;
            if (filter === "paid") return order.isPaid && !order.isDelivered;
            if (filter === "delivered") return order.isDelivered;
            return true;
          });
        }

        const totalPages =
          response.paginationResult?.numberOfPages ||
          response.pagination?.numberOfPages ||
          1;
        setHasMore(page < totalPages);

        if (append) {
          setOrders((prev) => {
            const existingIds = new Set(prev.map((o) => o._id));
            const newOrders = filteredOrders.filter(
              (o) => !existingIds.has(o._id)
            );
            return [...prev, ...newOrders];
          });
        } else {
          setOrders(filteredOrders);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // Initial load and filter change
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchOrders(1, false, statusFilter);
  }, [fetchOrders, statusFilter]);

  // Infinite scroll observer
  useEffect(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setCurrentPage((prev) => {
            const nextPage = prev + 1;
            fetchOrders(nextPage, true, statusFilter);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoading, isLoadingMore, hasMore, fetchOrders, statusFilter]);

  const refreshOrders = () => {
    setCurrentPage(1);
    setHasMore(true);
    fetchOrders(1, false, statusFilter);
  };

  const handleUpdatePaid = async (id: string) => {
    try {
      await ordersApi.updatePaidStatus(id);
      toast.success(t("orderUpdated"));
      refreshOrders();
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
      refreshOrders();
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

          {/* Infinite Scroll Trigger */}
          <div ref={loadMoreRef} className="mt-6 py-4">
            {isLoadingMore && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{t("loadingMore")}</span>
              </div>
            )}
            {!hasMore && orders.length > 0 && (
              <p className="text-center text-muted-foreground text-sm">
                {t("noMoreItems")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
