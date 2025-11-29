import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { productsApi } from "@/lib/api";
import { Category } from "@/types";
import { ProductDetails } from "./_components/ProductDetails";
import { ProductReviews } from "./_components/ProductReviews";
import { RelatedProducts } from "./_components/RelatedProducts";

interface ProductPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  try {
    const response = await productsApi.getById(id);
    const product = response.data;

    if (!product) {
      notFound();
    }

    const categoryId =
      typeof product.category === "string"
        ? product.category
        : (product.category as Category)?._id;

    return (
      <div className="container mx-auto px-4 py-8">
        <ProductDetails product={product} />
        <ProductReviews productId={id} />
        <RelatedProducts productId={id} categoryId={categoryId} />
      </div>
    );
  } catch {
    notFound();
  }
}
