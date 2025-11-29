"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Grid,
  Tags,
  Users,
  ShoppingCart,
  Ticket,
  Star,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";

const sidebarItems = [
  { href: "/admin", label: "admin.dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "admin.products", icon: Package },
  { href: "/admin/categories", label: "admin.categories", icon: Grid },
  { href: "/admin/brands", label: "admin.brands", icon: Tags },
  { href: "/admin/orders", label: "admin.orders", icon: ShoppingCart },
  { href: "/admin/users", label: "admin.users", icon: Users },
  { href: "/admin/coupons", label: "admin.coupons", icon: Ticket },
  { href: "/admin/reviews", label: "admin.reviews", icon: Star },
];

export function AdminSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = useCallback(
    (href: string) => {
      if (href === "/admin") {
        return pathname === "/admin";
      }
      return pathname.startsWith(href);
    },
    [pathname]
  );

  const renderSidebarContent = (collapsed: boolean) => (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2">
          {!collapsed && (
            <span className="text-xl font-bold text-primary">EaseShopping</span>
          )}
          {collapsed && <LayoutDashboard className="h-6 w-6 text-primary" />}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                collapsed && "justify-center"
              )}
              title={collapsed ? t(item.label) : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{t(item.label)}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-1">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
            collapsed && "justify-center"
          )}
          title={collapsed ? t("admin.backToStore") : undefined}
        >
          <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          {!collapsed && <span>{t("admin.backToStore")}</span>}
        </Link>
        <button
          onClick={() => logout()}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors",
            collapsed && "justify-center"
          )}
          title={collapsed ? t("auth.logout") : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>{t("auth.logout")}</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 start-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 w-64 bg-card border-e border-border flex flex-col lg:hidden",
          "transform transition-transform duration-300 ease-in-out",
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full rtl:translate-x-full"
        )}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 bg-card border-e border-border transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {renderSidebarContent(isCollapsed)}

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -end-3 top-20 h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform rtl:rotate-180",
              isCollapsed && "rotate-180 rtl:rotate-0"
            )}
          />
        </button>
      </aside>
    </>
  );
}
