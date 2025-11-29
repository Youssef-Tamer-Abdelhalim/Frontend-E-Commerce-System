import { setRequestLocale } from "next-intl/server";
import { ProductsContent } from "./_components/ProductsContent";
import { ProductsFilters } from "./_components/ProductsFilters";

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const search = await searchParams;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <ProductsFilters />
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          <ProductsContent searchParams={search} />
        </main>
      </div>
    </div>
  );
}
