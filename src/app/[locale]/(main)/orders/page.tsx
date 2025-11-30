"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ordersApi } from "@/lib/api";
import { Order } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { SafeImage } from "@/components/ui/SafeImage";
import { getImageUrl } from "@/lib/utils/helpers";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiShoppingBag,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";

export default function OrdersPage() {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const { isAuthenticated, token } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchOrders = useCallback(
    async (page: number, append: boolean = false) => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      if (page === 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await ordersApi.getMyOrders({
          page,
          limit: 10,
        });

        const totalPages =
          response.paginationResult?.numberOfPages ||
          response.pagination?.numberOfPages ||
          1;
        setHasMore(page < totalPages);

        if (append) {
          setOrders((prev) => {
            const existingIds = new Set(prev.map((o) => o._id));
            const newOrders = (response.data || []).filter(
              (o) => !existingIds.has(o._id)
            );
            return [...prev, ...newOrders];
          });
        } else {
          setOrders(response.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError(t("fetchError"));
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [isAuthenticated, token, t]
  );

  // Initial load
  useEffect(() => {
    fetchOrders(1, false);
  }, [fetchOrders]);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || isLoadingMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setCurrentPage((prev) => {
            const nextPage = prev + 1;
            fetchOrders(nextPage, true);
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
  }, [loading, isLoadingMore, hasMore, fetchOrders]);

  const getStatusIcon = (order: Order) => {
    if (order.isDelivered) {
      return <FiCheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (order.isPaid) {
      return <FiTruck className="w-5 h-5 text-blue-500" />;
    }
    return <FiClock className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusText = (order: Order) => {
    if (order.isDelivered) {
      return t("statusDelivered");
    }
    if (order.isPaid) {
      return t("statusShipping");
    }
    return t("statusPending");
  };

  const getStatusClass = (order: Order) => {
    if (order.isDelivered) {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    }
    if (order.isPaid) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <FiAlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t("loginRequired")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          {t("loginRequiredMessage")}
        </p>
        <Link
          href="/login"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {t("loginButton")}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <FiAlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {tCommon("error")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {t("tryAgain")}
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <FiPackage className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t("noOrders")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          {t("noOrdersMessage")}
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FiShoppingBag className="w-5 h-5" />
          {t("startShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {t("title")}
      </h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Order Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("orderNumber")}
                    </p>
                    <p className="font-mono font-semibold text-gray-900 dark:text-white">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="hidden sm:block w-px h-10 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="hidden sm:block">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("orderDate")}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(
                      order
                    )}`}
                  >
                    {getStatusIcon(order)}
                    {getStatusText(order)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {order.cartItems.slice(0, 3).map((item, index) => {
                  const product =
                    typeof item.product === "object" ? item.product : null;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        {product && (
                          <SafeImage
                            src={getImageUrl(
                              "imageCover" in product ? product.imageCover : ""
                            )}
                            alt={product.title || ""}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {product?.title || t("productUnavailable")}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("quantity")}: {item.quantity}
                        </p>
                        {item.color && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {t("color")}:
                            </span>
                            <span
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: item.color }}
                            ></span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {order.cartItems.length > 3 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    {t("moreItems", { count: order.cartItems.length - 3 })}
                  </p>
                )}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{t("paymentMethod")}:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {order.paymentMethodType === "cash"
                          ? t("cash")
                          : t("online")}
                      </span>
                    </div>
                    {order.isPaid && order.paidAt && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {t("paidOn", { date: formatDate(order.paidAt) })}
                      </p>
                    )}
                    {order.isDelivered && order.deliveredAt && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {t("deliveredOn", {
                          date: formatDate(order.deliveredAt),
                        })}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("total")}
                    </p>
                    <p className="text-xl font-bold text-primary-600">
                      {formatPrice(order.totalOrderPrice)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={loadMoreRef} className="mt-8 py-4">
        {isLoadingMore && (
          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
            <FiLoader className="h-5 w-5 animate-spin" />
            <span>{t("loadingMore") || "Loading more..."}</span>
          </div>
        )}
        {!hasMore && orders.length > 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            {t("noMoreOrders") || "No more orders to load"}
          </p>
        )}
      </div>
    </div>
  );
}
