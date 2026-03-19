"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { SafeImage } from "@/components/ui/SafeImage";
import { categoriesApi, subcategoriesApi } from "@/lib/api";
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
import { Plus, Pencil, Trash2, Loader2, ChevronUp, Tag } from "lucide-react";
import toast from "react-hot-toast";

interface SubCategoryItem {
  _id: string;
  name: string;
  slug: string;
  category: string | { _id: string; name: string };
}

export default function AdminCategoriesPage() {
  const t = useTranslations("admin");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", image: null as File | null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // SubCategory management state
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [subCategories, setSubCategories] = useState<Record<string, SubCategoryItem[]>>({});
  const [isLoadingSubCats, setIsLoadingSubCats] = useState(false);
  const [newSubCatName, setNewSubCatName] = useState("");
  const [isAddingSubCat, setIsAddingSubCat] = useState(false);

  const fetchCategories = useCallback(
    async (page: number, append: boolean = false) => {
      if (page === 1) { setIsLoading(true); } else { setIsLoadingMore(true); }
      try {
        const response = await categoriesApi.getAll({ page, limit: 12 });
        const totalPages =
          response.paginationResult?.numberOfPages ||
          response.pagination?.numberOfPages ||
          1;
        setHasMore(page < totalPages);
        if (append) {
          setCategories((prev) => {
            const existingIds = new Set(prev.map((c) => c._id));
            return [...prev, ...response.data.filter((c) => !existingIds.has(c._id))];
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

  useEffect(() => { fetchCategories(1, false); }, [fetchCategories]);

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
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [isLoading, isLoadingMore, hasMore, fetchCategories]);

  const refreshCategories = () => { setCurrentPage(1); setHasMore(true); fetchCategories(1, false); };

  // ── Category CRUD ─────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error(t("nameRequired")); return; }
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        const updateData: { name: string; image?: File } = { name: formData.name };
        if (formData.image) updateData.image = formData.image;
        await categoriesApi.update(editingCategory._id, updateData);
        toast.success(t("categoryUpdated"));
      } else {
        if (!formData.image) { toast.error(t("imageRequired") || "الصورة مطلوبة"); setIsSubmitting(false); return; }
        await categoriesApi.create({ name: formData.name, image: formData.image });
        toast.success(t("categoryCreated"));
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", image: null });
      refreshCategories();
    } catch { toast.error(t("saveError")); }
    finally { setIsSubmitting(false); }
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
      if (expandedCategoryId === id) setExpandedCategoryId(null);
      refreshCategories();
    } catch { toast.error(t("deleteError")); }
  };

  const openNewModal = () => { setEditingCategory(null); setFormData({ name: "", image: null }); setIsModalOpen(true); };

  // ── SubCategory CRUD ──────────────────────
  const handleToggleExpand = async (categoryId: string) => {
    if (expandedCategoryId === categoryId) { setExpandedCategoryId(null); return; }
    setExpandedCategoryId(categoryId);
    if (subCategories[categoryId]) return; // already loaded
    setIsLoadingSubCats(true);
    try {
      const res = await categoriesApi.getSubcategories(categoryId);
      setSubCategories((prev) => ({ ...prev, [categoryId]: res.data || [] }));
    } catch {
      setSubCategories((prev) => ({ ...prev, [categoryId]: [] }));
    } finally { setIsLoadingSubCats(false); }
  };

  const handleAddSubCategory = async (categoryId: string) => {
    if (!newSubCatName.trim()) return;
    setIsAddingSubCat(true);
    try {
      const res = await subcategoriesApi.create({ name: newSubCatName.trim(), category: categoryId });
      setSubCategories((prev) => ({ ...prev, [categoryId]: [...(prev[categoryId] || []), res.data] }));
      setNewSubCatName("");
      toast.success(t("subCategoryCreated") || "تم إنشاء التصنيف الفرعي");
    } catch { toast.error(t("saveError")); }
    finally { setIsAddingSubCat(false); }
  };

  const handleDeleteSubCategory = async (categoryId: string, subCatId: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await subcategoriesApi.delete(subCatId);
      setSubCategories((prev) => ({
        ...prev,
        [categoryId]: (prev[categoryId] || []).filter((sc) => sc._id !== subCatId),
      }));
      toast.success(t("subCategoryDeleted") || "تم حذف التصنيف الفرعي");
    } catch { toast.error(t("deleteError")); }
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

      <Card>
        <CardHeader>
          <CardTitle>{t("allCategories")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t("noCategories")}</p>
          ) : (
            <>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category._id} className="border border-border rounded-lg overflow-hidden">
                    {/* Category Row */}
                    <div className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <SafeImage
                          src={getImageUrl(category.image)}
                          alt={category.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{category.name}</h3>
                        {subCategories[category._id] && (
                          <p className="text-xs text-muted-foreground">
                            {subCategories[category._id].length} {t("subCategories") || "تصنيفات فرعية"}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleExpand(category._id)}
                          title={t("subCategories") || "SubCategories"}
                          className="h-8 w-8"
                        >
                          {expandedCategoryId === category._id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <Tag className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)} className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category._id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* SubCategories Expanded Panel */}
                    {expandedCategoryId === category._id && (
                      <div className="border-t border-border bg-muted/20 px-4 py-3 space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          {t("subCategories") || "التصنيفات الفرعية"}
                        </h4>
                        {isLoadingSubCats && !subCategories[category._id] ? (
                          <div className="flex gap-2">
                            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-7 w-20 rounded-full" />)}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(subCategories[category._id] || []).length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                {t("noSubCategories") || "لا توجد تصنيفات فرعية بعد"}
                              </p>
                            ) : (
                              (subCategories[category._id] || []).map((sc) => (
                                <div
                                  key={sc._id}
                                  className="flex items-center gap-1 bg-background border border-border rounded-full px-3 py-1 text-sm"
                                >
                                  <span>{sc.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSubCategory(category._id, sc._id)}
                                    className="text-muted-foreground hover:text-destructive ms-1"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                        {/* Add SubCategory */}
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={newSubCatName}
                            onChange={(e) => setNewSubCatName(e.target.value)}
                            placeholder={t("enterSubCategoryName") || "اسم التصنيف الفرعي"}
                            className="h-8 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") { e.preventDefault(); handleAddSubCategory(category._id); }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddSubCategory(category._id)}
                            isLoading={isAddingSubCat}
                            className="h-8 px-3 flex-shrink-0"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
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
                  <p className="text-center text-muted-foreground text-sm">{t("noMoreItems")}</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Category Modal */}
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
            onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
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
