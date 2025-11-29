"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usersApi, productsApi, ordersApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { RecentOrders } from "./_components/RecentOrders";
import { SalesChart } from "./_components/SalesChart";

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          usersApi.getAll({ limit: 1 }),
          productsApi.getAll({ limit: 1 }),
          ordersApi.getAll({ limit: 100 }),
        ]);

        // Calculate stats
        const orders = ordersRes.data || [];
        const totalRevenue = orders.reduce(
          (acc: number, order: { totalOrderPrice?: number }) =>
            acc + (order.totalOrderPrice || 0),
          0
        );
        const pendingOrders = orders.filter(
          (order: { isPaid?: boolean }) => !order.isPaid
        ).length;

        setStats({
          totalUsers: usersRes.results || 0,
          totalProducts: productsRes.results || 0,
          totalOrders: ordersRes.results || 0,
          totalRevenue,
          pendingOrders,
          lowStockProducts: 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    {
      title: t("totalUsers"),
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: t("totalProducts"),
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: t("totalOrders"),
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: t("totalRevenue"),
      value: formatPrice(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("dashboard")}</h1>
        <p className="text-muted-foreground">{t("dashboardSubtitle")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-10 w-10 rounded-lg mb-4" />
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t("salesOverview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>{t("quickStats")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("pendingOrders")}
                </p>
                <p className="text-2xl font-bold">
                  {stats?.pendingOrders || 0}
                </p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">{t("lowStock")}</p>
                <p className="text-2xl font-bold">
                  {stats?.lowStockProducts || 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <RecentOrders />
    </div>
  );
}
