"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { usersApi } from "@/lib/api";
import { User } from "@/types/user";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Pagination,
  Skeleton,
  Input,
  Select,
} from "@/components/ui";
import { formatDate, getInitials } from "@/lib/utils";
import { Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await usersApi.getAll({ page: currentPage, limit: 10 });
      setUsers(response.data);
      setTotalPages(response.paginationResult?.numberOfPages || 1);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async (id: string, role: "user" | "admin") => {
    try {
      await usersApi.update(id, { role });
      toast.success(t("userUpdated"));
      fetchUsers();
    } catch {
      toast.error(t("updateError"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      await usersApi.delete(id);
      toast.success(t("userDeleted"));
      fetchUsers();
    } catch {
      toast.error(t("deleteError"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("users")}</h1>
          <p className="text-muted-foreground">{t("manageUsers")}</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchUsers")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("allUsers")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border border-border rounded-lg"
                >
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {t("noUsers")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-start p-3 font-medium">{t("user")}</th>
                    <th className="text-start p-3 font-medium">{t("email")}</th>
                    <th className="text-start p-3 font-medium">{t("role")}</th>
                    <th className="text-start p-3 font-medium">
                      {t("joined")}
                    </th>
                    <th className="text-end p-3 font-medium">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {getInitials(user.name)}
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="p-3">
                        <Select
                          options={[
                            { value: "user", label: t("roleUser") },
                            { value: "admin", label: t("roleAdmin") },
                          ]}
                          value={user.role}
                          onChange={(e) =>
                            handleUpdateRole(
                              user._id,
                              e.target.value as "user" | "admin"
                            )
                          }
                          className="w-32"
                        />
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {user.createdAt ? formatDate(user.createdAt) : "-"}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(user._id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
