"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ordersApi } from "@/lib/api";
import { Order } from "@/types/order";
import { Skeleton } from "@/components/ui";

interface MonthlyData {
  month: string;
  sales: number;
  orders: number;
}

export function SalesChart() {
  const t = useTranslations("admin");
  const [data, setData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSalesData() {
      try {
        // Fetch all orders (or last 6 months)
        const response = await ordersApi.getAll({ limit: 500 });
        const orders: Order[] = response.data || [];

        // Group orders by month
        const monthlyMap = new Map<string, { sales: number; orders: number }>();

        // Get last 6 months
        const months = [];
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${date.getFullYear()}-${date.getMonth()}`;
          const monthName = monthNames[date.getMonth()];
          months.push({ key, name: monthName });
          monthlyMap.set(key, { sales: 0, orders: 0 });
        }

        // Aggregate orders data
        orders.forEach((order) => {
          if (order.isPaid && order.createdAt) {
            const orderDate = new Date(order.createdAt);
            const key = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;

            if (monthlyMap.has(key)) {
              const current = monthlyMap.get(key)!;
              monthlyMap.set(key, {
                sales: current.sales + (order.totalOrderPrice || 0),
                orders: current.orders + 1,
              });
            }
          }
        });

        // Convert to array
        const chartData = months.map(({ key, name }) => ({
          month: name,
          sales: monthlyMap.get(key)?.sales || 0,
          orders: monthlyMap.get(key)?.orders || 0,
        }));

        setData(chartData);
      } catch (error) {
        console.error("Failed to fetch sales data:", error);
        // Set empty data on error
        setData([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSalesData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-end justify-between h-48 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <Skeleton className="w-full max-w-10 h-24 rounded-t-md" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const maxSales = Math.max(...data.map((d) => d.sales), 1);
  const totalSales = data.reduce((acc, d) => acc + d.sales, 0);
  const totalOrders = data.reduce((acc, d) => acc + d.orders, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-muted-foreground">{t("totalSales")}: </span>
          <span className="font-semibold">
            {totalSales.toLocaleString()} {t("currency")}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">{t("ordersCount")}: </span>
          <span className="font-semibold">{totalOrders}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between h-48 gap-2">
        {data.map((item, index) => {
          const height = maxSales > 0 ? (item.sales / maxSales) * 100 : 0;
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-2 group"
            >
              <div className="w-full flex flex-col items-center justify-end h-40 relative">
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border border-border px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-md">
                  <div>
                    {item.sales.toLocaleString()} {t("currency")}
                  </div>
                  <div className="text-muted-foreground">
                    {item.orders} {t("orders")}
                  </div>
                </div>
                <div
                  className="w-full max-w-10 bg-primary rounded-t-md transition-all duration-300 hover:bg-primary/80 cursor-pointer"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {item.month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>{t("sales")}</span>
        </div>
      </div>
    </div>
  );
}
