"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useForm, Resolver } from "react-hook-form";
import { productsApi, categoriesApi, brandsApi } from "@/lib/api";
import { SafeImage } from "@/components/ui/SafeImage";
import { getImageUrl } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Textarea,
  Skeleton,
} from "@/components/ui";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  _id: string;
  name: string;
}

interface Brand {
  _id: string;
  name: string;
}

interface ProductFormData {
  title: string;
  description: string;
  quantity: number;
  price: number;
  priceAfterDiscount?: number;
  category: string;
  brand?: string;
}

// Custom resolver to handle validation
const productResolver: Resolver<ProductFormData> = async (values) => {
  const errors: Record<string, { type: string; message: string }> = {};

  if (!values.title || values.title.length < 3) {
    errors.title = {
      type: "manual",
      message: "Title must be at least 3 characters",
    };
  }
  if (!values.description || values.description.length < 20) {
    errors.description = {
      type: "manual",
      message: "Description must be at least 20 characters",
    };
  }
  if (!values.quantity || values.quantity < 1) {
    errors.quantity = {
      type: "manual",
      message: "Quantity must be at least 1",
    };
  }
  if (!values.price || values.price < 1) {
    errors.price = { type: "manual", message: "Price must be greater than 0" };
  }
  if (!values.category) {
    errors.category = { type: "manual", message: "Category is required" };
  }

  return {
    values: Object.keys(errors).length === 0 ? values : {},
    errors,
  };
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("admin");
  const productId = params.id as string;
  const isNew = productId === "new";

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [imageCover, setImageCover] = useState<File | string | null>(null);
  const [images, setImages] = useState<(File | string)[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("#000000");
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: productResolver,
  });

  // Fetch categories and brands
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          categoriesApi.getAll({ limit: 100 }),
          brandsApi.getAll({ limit: 100 }),
        ]);
        setCategories(catRes.data || []);
        setBrands(brandRes.data || []);
      } catch (error) {
        console.error("Failed to fetch categories/brands:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch product data if editing
  const fetchProduct = useCallback(async () => {
    if (isNew) return;

    setIsLoading(true);
    try {
      const response = await productsApi.getById(productId);
      const product = response.data;

      reset({
        title: product.title,
        description: product.description,
        quantity: product.quantity,
        price: product.price,
        priceAfterDiscount: product.priceAfterDiscount || undefined,
        category:
          typeof product.category === "string"
            ? product.category
            : product.category && "_id" in product.category
            ? product.category._id
            : "",
        brand:
          typeof product.brand === "string"
            ? product.brand
            : product.brand && "_id" in product.brand
            ? product.brand._id
            : undefined,
      });

      setImageCover(product.imageCover);
      setImages(product.images || []);
      setColors(product.colors || []);
    } catch (error) {
      console.error("Failed to fetch product:", error);
      toast.error(t("loadProductError"));
      router.push("/admin/products");
    } finally {
      setIsLoading(false);
    }
  }, [productId, isNew, reset, router, t]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleImageCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageCover(file);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setImages((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addColor = () => {
    if (newColor && !colors.includes(newColor)) {
      setColors((prev) => [...prev, newColor]);
    }
  };

  const removeColor = (color: string) => {
    setColors((prev) => prev.filter((c) => c !== color));
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!imageCover) {
      toast.error(t("coverImageRequired"));
      return;
    }

    setIsSaving(true);
    try {
      const productData = {
        ...data,
        imageCover: imageCover,
        images: images.length > 0 ? images : undefined,
        colors: colors.length > 0 ? colors : undefined,
        brand: data.brand || undefined,
        priceAfterDiscount: data.priceAfterDiscount || undefined,
      };

      if (isNew) {
        await productsApi.create(productData);
        toast.success(t("productCreated"));
        router.push("/admin/products");
      } else {
        const response = await productsApi.update(productId, productData);
        toast.success(t("productUpdated"));

        // Update local state with new image URLs from response
        if (response.data) {
          setImageCover(response.data.imageCover);
          setImages(response.data.images || []);
          // Update timestamp to bust cache and show new images
          setImageTimestamp(Date.now());
        }
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error(isNew ? t("createProductError") : t("updateProductError"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isNew ? t("addProduct") : t("editProduct")}
          </h1>
          <p className="text-muted-foreground">
            {isNew ? t("addProductDesc") : t("editProductDesc")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                {t("productName")} *
              </label>
              <Input
                {...register("title")}
                placeholder={t("enterProductName")}
                error={errors.title?.message}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                {t("description")} *
              </label>
              <Textarea
                {...register("description")}
                placeholder={t("enterDescription")}
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t("category")} *
                </label>
                <select
                  {...register("category")}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">{t("selectCategory")}</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t("brand")}
                </label>
                <select
                  {...register("brand")}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">{t("selectBrand")}</option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>{t("pricingInventory")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t("price")} ($) *
                </label>
                <Input
                  type="number"
                  {...register("price")}
                  placeholder="0"
                  error={errors.price?.message}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t("priceAfterDiscount")}
                </label>
                <Input
                  type="number"
                  {...register("priceAfterDiscount")}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t("quantity")} *
                </label>
                <Input
                  type="number"
                  {...register("quantity")}
                  placeholder="0"
                  error={errors.quantity?.message}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>{t("images")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cover Image */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("coverImage")} *
              </label>
              <div className="flex items-start gap-4">
                {imageCover && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                    <SafeImage
                      src={
                        imageCover instanceof File
                          ? URL.createObjectURL(imageCover)
                          : `${getImageUrl(imageCover)}?t=${imageTimestamp}`
                      }
                      alt="Cover"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImageCover(null)}
                      className="absolute top-1 end-1 p-1 bg-destructive text-white rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">
                    {t("uploadImage")}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageCoverChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Additional Images */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("additionalImages")}
              </label>
              <div className="flex flex-wrap items-start gap-4">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border"
                  >
                    <SafeImage
                      src={
                        img instanceof File
                          ? URL.createObjectURL(img)
                          : `${getImageUrl(img)}?t=${imageTimestamp}`
                      }
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 end-1 p-1 bg-destructive text-white rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle>{t("availableColors")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {colors.map((color) => (
                <div
                  key={color}
                  className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full"
                >
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm">{color}</span>
                  <button
                    type="button"
                    onClick={() => removeColor(color)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="#000000"
                className="w-32"
              />
              <Button type="button" variant="outline" onClick={addColor}>
                {t("addColor")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t("cancel")}
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {isNew ? t("create") : t("update")}
          </Button>
        </div>
      </form>
    </div>
  );
}
