"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { SafeImage } from "@/components/ui/SafeImage";
import { categoriesApi } from "@/lib/api";
import { Category } from "@/types/category";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Skeleton,
  Input,
  Modal,
} from "@/components/ui";
import { getImageUrl } from "@/lib/utils";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const t = useTranslations("admin");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    image: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchCategories = useCallback(
    async (page: number, append: boolean = false) => {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await categoriesApi.getAll({
          page,
          limit: 12,
        });

        const totalPages =
          response.paginationResult?.numberOfPages ||
          response.pagination?.numberOfPages ||
          1;
        setHasMore(page < totalPages);

        if (append) {
          setCategories((prev) => {
            const existingIds = new Set(prev.map((c) => c._id));
            const newCategories = response.data.filter(
              (c) => !existingIds.has(c._id)
            );
            return [...prev, ...newCategories];
          });
        } else {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchCategories(1, false);
  }, [fetchCategories]);

  // Infinite scroll observer
  useEffect(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setCurrentPage((prev) => {
            const nextPage = prev + 1;
            fetchCategories(nextPage, true);
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
  }, [isLoading, isLoadingMore, hasMore, fetchCategories]);

  const refreshCategories = () => {
    setCurrentPage(1);
    setHasMore(true);
    fetchCategories(1, false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        // Update category
        const updateData: { name: string; image?: File } = {
          name: formData.name,
        };
        if (formData.image) {
          updateData.image = formData.image;
        }
        await categoriesApi.update(editingCategory._id, updateData);
        toast.success(t("categoryUpdated"));
      } else {
        // Create new category - image is required
        if (!formData.image) {
          toast.error(t("imageRequired") || "الصورة مطلوبة");
          setIsSubmitting(false);
          return;
        }
        await categoriesApi.create({
          name: formData.name,
          image: formData.image,
        });
        toast.success(t("categoryCreated"));
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", image: null });
      refreshCategories();
    } catch {
      toast.error(t("saveError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, image: null });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      await categoriesApi.delete(id);
      toast.success(t("categoryDeleted"));
      refreshCategories();
    } catch {
      toast.error(t("deleteError"));
    }
  };

  const openNewModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", image: null });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("categories")}</h1>
          <p className="text-muted-foreground">{t("manageCategories")}</p>
        </div>
        <Button onClick={openNewModal}>
          <Plus className="h-4 w-4 me-2" />
          {t("addCategory")}
        </Button>
      </div>

      {/* Categories Grid */}
      <Card>
        <CardHeader>
          <CardTitle>{t("allCategories")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-4 border border-border rounded-lg">
                  <Skeleton className="aspect-square rounded-lg mb-3" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {t("noCategories")}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="group p-4 border border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                      <SafeImage
                        src={getImageUrl(category.image)}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(category._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="text-center font-medium">{category.name}</h3>
                  </div>
                ))}
              </div>

              {/* Infinite Scroll Trigger */}
              <div ref={loadMoreRef} className="mt-6 py-4">
                {isLoadingMore && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{t("loadingMore")}</span>
                  </div>
                )}
                {!hasMore && categories.length > 0 && (
                  <p className="text-center text-muted-foreground text-sm">
                    {t("noMoreItems")}
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? t("editCategory") : t("addCategory")}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t("categoryName")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t("enterCategoryName")}
            required
          />
          <Input
            label={t("image")}
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.files?.[0] || null })
            }
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
              {editingCategory ? t("update") : t("create")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
