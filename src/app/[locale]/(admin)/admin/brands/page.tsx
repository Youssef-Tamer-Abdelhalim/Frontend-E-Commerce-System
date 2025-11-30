"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { SafeImage } from "@/components/ui/SafeImage";
import { brandsApi } from "@/lib/api";
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

interface Brand {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

export default function AdminBrandsPage() {
  const t = useTranslations("admin");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    image: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchBrands = useCallback(
    async (page: number, append: boolean = false) => {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await brandsApi.getAll({
          page,
          limit: 12,
        });

        const totalPages =
          response.paginationResult?.numberOfPages ||
          response.pagination?.numberOfPages ||
          1;
        setHasMore(page < totalPages);

        if (append) {
          setBrands((prev) => {
            const existingIds = new Set(prev.map((b) => b._id));
            const newBrands = response.data.filter(
              (b) => !existingIds.has(b._id)
            );
            return [...prev, ...newBrands];
          });
        } else {
          setBrands(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchBrands(1, false);
  }, [fetchBrands]);

  // Infinite scroll observer
  useEffect(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setCurrentPage((prev) => {
            const nextPage = prev + 1;
            fetchBrands(nextPage, true);
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
  }, [isLoading, isLoadingMore, hasMore, fetchBrands]);

  const refreshBrands = () => {
    setCurrentPage(1);
    setHasMore(true);
    fetchBrands(1, false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingBrand) {
        // Update brand
        const updateData: { name: string; image?: File } = {
          name: formData.name,
        };
        if (formData.image) {
          updateData.image = formData.image;
        }
        await brandsApi.update(editingBrand._id, updateData);
        toast.success(t("brandUpdated"));
      } else {
        // Create new brand - image is required
        if (!formData.image) {
          toast.error(t("imageRequired"));
          setIsSubmitting(false);
          return;
        }
        await brandsApi.create({
          name: formData.name,
          image: formData.image,
        });
        toast.success(t("brandCreated"));
      }

      setIsModalOpen(false);
      setEditingBrand(null);
      setFormData({ name: "", image: null });
      refreshBrands();
    } catch {
      toast.error(t("saveError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name, image: null });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      await brandsApi.delete(id);
      toast.success(t("brandDeleted"));
      refreshBrands();
    } catch {
      toast.error(t("deleteError"));
    }
  };

  const openNewModal = () => {
    setEditingBrand(null);
    setFormData({ name: "", image: null });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("brands")}</h1>
          <p className="text-muted-foreground">{t("manageBrands")}</p>
        </div>
        <Button onClick={openNewModal}>
          <Plus className="h-4 w-4 me-2" />
          {t("addBrand")}
        </Button>
      </div>

      {/* Brands Grid */}
      <Card>
        <CardHeader>
          <CardTitle>{t("allBrands")}</CardTitle>
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
          ) : brands.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {t("noBrands")}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {brands.map((brand) => (
                  <div
                    key={brand._id}
                    className="group p-4 border border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                      <SafeImage
                        src={getImageUrl(brand.image)}
                        alt={brand.name}
                        fill
                        className="object-contain p-4"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => handleEdit(brand)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(brand._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="text-center font-medium">{brand.name}</h3>
                  </div>
                ))}
              </div>

              {/* Infinite Scroll Trigger */}
              <div ref={loadMoreRef} className="mt-6 py-4">
                {isLoadingMore && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{t("loadingMore") || "Loading more..."}</span>
                  </div>
                )}
                {!hasMore && brands.length > 0 && (
                  <p className="text-center text-muted-foreground text-sm">
                    {t("noMoreItems") || "No more items to load"}
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
        title={editingBrand ? t("editBrand") : t("addBrand")}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t("brandName")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t("enterBrandName")}
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
              {editingBrand ? t("update") : t("create")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
