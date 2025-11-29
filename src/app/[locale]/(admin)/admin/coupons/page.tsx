"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { couponsApi } from "@/lib/api";
import { Coupon } from "@/types/coupon";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Pagination,
  Skeleton,
  Input,
  Modal,
  Badge,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { Plus, Pencil, Trash2, Ticket, Calendar, Percent } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminCouponsPage() {
  const t = useTranslations("admin");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    discountDegree: 0,
    discountMAX: 0,
    expiryDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await couponsApi.getAll({
        page: currentPage,
        limit: 10,
      });
      setCoupons(response.data);
      setTotalPages(response.paginationResult?.numberOfPages || 1);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }
    if (formData.discountDegree <= 0 || formData.discountDegree > 100) {
      toast.error(t("invalidDiscount"));
      return;
    }
    if (!formData.expiryDate) {
      toast.error(t("expiryRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCoupon) {
        await couponsApi.update(editingCoupon._id, formData);
        toast.success(t("couponUpdated"));
      } else {
        await couponsApi.create(formData);
        toast.success(t("couponCreated"));
      }

      setIsModalOpen(false);
      setEditingCoupon(null);
      setFormData({
        name: "",
        discountDegree: 0,
        discountMAX: 0,
        expiryDate: "",
      });
      fetchCoupons();
    } catch {
      toast.error(t("saveError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      name: coupon.name,
      discountDegree: coupon.discountDegree,
      discountMAX: coupon.discountMAX,
      expiryDate: coupon.expiryDate.split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      await couponsApi.delete(id);
      toast.success(t("couponDeleted"));
      fetchCoupons();
    } catch {
      toast.error(t("deleteError"));
    }
  };

  const openNewModal = () => {
    setEditingCoupon(null);
    setFormData({
      name: "",
      discountDegree: 0,
      discountMAX: 0,
      expiryDate: "",
    });
    setIsModalOpen(true);
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("coupons")}</h1>
          <p className="text-muted-foreground">{t("manageCoupons")}</p>
        </div>
        <Button onClick={openNewModal}>
          <Plus className="h-4 w-4 me-2" />
          {t("addCoupon")}
        </Button>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("allCoupons")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border border-border rounded-lg"
                >
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {t("noCoupons")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-start p-3 font-medium">
                      {t("couponCode")}
                    </th>
                    <th className="text-start p-3 font-medium">
                      {t("discount")}
                    </th>
                    <th className="text-start p-3 font-medium">
                      {t("maxDiscount")}
                    </th>
                    <th className="text-start p-3 font-medium">
                      {t("expiryDate")}
                    </th>
                    <th className="text-start p-3 font-medium">
                      {t("status")}
                    </th>
                    <th className="text-end p-3 font-medium">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr
                      key={coupon._id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Ticket className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-mono font-semibold">
                            {coupon.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Percent className="h-4 w-4 text-muted-foreground" />
                          <span>{coupon.discountDegree}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-muted-foreground">
                          {coupon.discountMAX} {t("currency")}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(coupon.expiryDate)}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        {isExpired(coupon.expiryDate) ? (
                          <Badge variant="destructive">{t("expired")}</Badge>
                        ) : (
                          <Badge variant="success">{t("active")}</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(coupon)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(coupon._id)}
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoupon ? t("editCoupon") : t("addCoupon")}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t("couponCode")}
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value.toUpperCase() })
            }
            placeholder={t("enterCouponCode")}
            required
          />
          <Input
            label={t("discountPercent")}
            type="number"
            min="1"
            max="100"
            value={formData.discountDegree || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                discountDegree: Number(e.target.value),
              })
            }
            placeholder="10"
            required
          />
          <Input
            label={t("maxDiscount")}
            type="number"
            min="0"
            value={formData.discountMAX || ""}
            onChange={(e) =>
              setFormData({ ...formData, discountMAX: Number(e.target.value) })
            }
            placeholder="500"
            required
          />
          <Input
            label={t("expiryDate")}
            type="date"
            value={formData.expiryDate}
            onChange={(e) =>
              setFormData({ ...formData, expiryDate: e.target.value })
            }
            min={new Date().toISOString().split("T")[0]}
            required
          />
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingCoupon ? t("update") : t("create")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
