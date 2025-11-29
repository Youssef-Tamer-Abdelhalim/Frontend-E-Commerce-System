"use client";

import { useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  X,
  Home,
  Package,
  Grid,
  ShoppingCart,
  Heart,
  User,
  LogIn,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  if (!isOpen) return null;

  const menuItems = [
    { href: "/", label: t("nav.home"), icon: Home },
    { href: "/products", label: t("nav.products"), icon: Package },
    { href: "/categories", label: t("nav.categories"), icon: Grid },
    { href: "/cart", label: t("nav.cart"), icon: ShoppingCart },
  ];

  const authMenuItems = isAuthenticated
    ? [
        { href: "/wishlist", label: t("nav.wishlist"), icon: Heart },
        { href: "/profile", label: t("nav.profile"), icon: User },
        { href: "/orders", label: t("nav.orders"), icon: Package },
        ...(user?.role === "admin"
          ? [{ href: "/admin", label: t("nav.admin"), icon: LayoutDashboard }]
          : []),
      ]
    : [];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={cn(
          "fixed inset-y-0 start-0 z-50 w-full max-w-xs bg-card shadow-xl md:hidden",
          "transform transition-transform duration-300 ease-in-out",
          isOpen
            ? "translate-x-0 rtl:translate-x-0"
            : "-translate-x-full rtl:translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link
            href="/"
            className="text-xl font-bold text-primary"
            onClick={onClose}
          >
            EaseShopping
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
        {isAuthenticated && (
          <div className="p-4 border-b border-border bg-accent/50">
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"
                )}
                onClick={onClose}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}

          {authMenuItems.length > 0 && (
            <>
              <div className="my-4 border-t border-border" />
              {authMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent"
                    )}
                    onClick={onClose}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Footer Actions */}
        <div className="absolute bottom-0 start-0 end-0 p-4 border-t border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          {isAuthenticated ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                logout();
                onClose();
              }}
            >
              <LogOut className="h-4 w-4 me-2" />
              {t("auth.logout")}
            </Button>
          ) : (
            <Link href="/login" onClick={onClose}>
              <Button variant="primary" className="w-full">
                <LogIn className="h-4 w-4 me-2" />
                {t("auth.login")}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
