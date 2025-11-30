"use client";

import { useEffect, useRef } from "react";
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
  const previousPathname = useRef(pathname);

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

  // Close menu on route change (only when pathname actually changes)
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      onClose();
    }
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
      {/* Overlay - click anywhere outside to close */}
      <div
        className="fixed inset-0 z-50 bg-black/50 md:hidden"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={cn(
          "fixed inset-y-0 start-0 z-60 w-full max-w-xs shadow-2xl md:hidden",
          "bg-background border-e border-border",
          "transform transition-transform duration-300 ease-in-out",
          isOpen
            ? "translate-x-0 rtl:translate-x-0"
            : "-translate-x-full rtl:translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background">
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
          <div className="p-4 border-b border-border bg-muted">
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        )}

        {/* Navigation - scrollable area */}
        <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto bg-background">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
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
                        "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
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

            {/* Logout button at end of list */}
            {isAuthenticated && (
              <>
                <div className="my-4 border-t border-border" />
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors text-destructive hover:bg-destructive/10 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  {t("auth.logout")}
                </button>
              </>
            )}

            {/* Login button for non-authenticated users */}
            {!isAuthenticated && (
              <>
                <div className="my-4 border-t border-border" />
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={onClose}
                >
                  <LogIn className="h-5 w-5" />
                  {t("auth.login")}
                </Link>
              </>
            )}
          </nav>

          {/* Footer - Theme & Language only */}
          <div className="p-4 border-t border-border bg-background">
            <div className="flex items-center justify-center gap-4">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
