"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/authStore";
import { AdminSidebar } from "@/components/layout";
import { ThemeToggle, LanguageSwitcher } from "@/components/layout";
import { Loading } from "@/components/ui";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user?.role !== "admin") {
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <Loading fullScreen />;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        {/* Admin Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
          <div className="flex items-center justify-end h-full px-4 lg:px-6 gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </header>

        {/* Admin Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
