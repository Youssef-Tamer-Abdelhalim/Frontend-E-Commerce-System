"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import { SafeImage } from "@/components/ui/SafeImage";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { productsApi } from "@/lib/api/products";
import { brandsApi } from "@/lib/api/brands";
import { categoriesApi } from "@/lib/api/categories";
import { getImageUrl } from "@/lib/utils/helpers";

interface ShowcaseItem {
  id: string;
  image: string;
  name: string;
  type: "product" | "brand" | "category";
  link: string;
}

export function HeroSection() {
  const t = useTranslations("home");
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShowcaseData = async () => {
      try {
        const [productsRes, brandsRes, categoriesRes] = await Promise.all([
          productsApi.getAll({ limit: 6 }),
          brandsApi.getAll({ limit: 4 }),
          categoriesApi.getAll({ limit: 4 }),
        ]);

        const items: ShowcaseItem[] = [];

        // Add products
        productsRes.data?.forEach((product) => {
          if (product.imageCover) {
            items.push({
              id: product._id,
              image: getImageUrl(product.imageCover),
              name: product.title,
              type: "product",
              link: `/products/${product._id}`,
            });
          }
        });

        // Add brands
        brandsRes.data?.forEach((brand) => {
          if (brand.image) {
            items.push({
              id: brand._id,
              image: getImageUrl(brand.image),
              name: brand.name,
              type: "brand",
              link: `/products?brand=${brand._id}`,
            });
          }
        });

        // Add categories
        categoriesRes.data?.forEach((category) => {
          if (category.image) {
            items.push({
              id: category._id,
              image: getImageUrl(category.image),
              name: category.name,
              type: "category",
              link: `/products?category=${category._id}`,
            });
          }
        });

        // Shuffle the items
        const shuffled = items.sort(() => Math.random() - 0.5);
        setShowcaseItems(shuffled);
        setIsLoading(false);
      } catch {
        setIsLoading(false);
      }
    };

    fetchShowcaseData();
  }, []);

  // Auto-rotate showcase items
  useEffect(() => {
    if (showcaseItems.length <= 4) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (showcaseItems.length - 3));
    }, 3000);

    return () => clearInterval(interval);
  }, [showcaseItems.length]);

  const visibleItems = showcaseItems.slice(currentIndex, currentIndex + 4);
  // If we don't have enough items at the end, wrap around
  const displayItems =
    visibleItems.length < 4
      ? [...visibleItems, ...showcaseItems.slice(0, 4 - visibleItems.length)]
      : visibleItems;

  const getTypeLabel = (type: ShowcaseItem["type"]) => {
    switch (type) {
      case "product":
        return "منتج";
      case "brand":
        return "براند";
      case "category":
        return "تصنيف";
    }
  };

  const getTypeColor = (type: ShowcaseItem["type"]) => {
    switch (type) {
      case "product":
        return "bg-primary text-primary-foreground";
      case "brand":
        return "bg-blue-500 text-white";
      case "category":
        return "bg-green-500 text-white";
    }
  };

  return (
    <section className="relative bg-linear-to-b from-primary/10 to-background py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Content */}
          <div className="flex-1 text-center lg:text-start">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              {t("heroTitle")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  <ShoppingBag className="me-2 h-5 w-5" />
                  {t("shopNow")}
                </Button>
              </Link>
              <Link href="/categories">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {t("browseCategories")}
                  <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="flex-1 relative">
            <div className="relative aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
              <div className="relative bg-card rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-all duration-500 hover:shadow-3xl">
                <div className="grid grid-cols-2 gap-4">
                  {isLoading || displayItems.length === 0
                    ? // Loading skeleton
                      [1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="aspect-square bg-muted rounded-xl animate-pulse"
                        />
                      ))
                    : // Actual items with animation
                      displayItems.map((item, index) => (
                        <Link
                          key={`${item.id}-${currentIndex}-${index}`}
                          href={item.link}
                          className="group relative aspect-square rounded-xl overflow-hidden bg-muted transform transition-all duration-500 hover:scale-105 hover:z-10 hover:shadow-xl animate-fadeSlideIn"
                          style={{
                            animationDelay: `${index * 100}ms`,
                          }}
                        >
                          <SafeImage
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          {/* Type badge */}
                          <span
                            className={`absolute top-2 start-2 text-[10px] px-2 py-0.5 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 ${getTypeColor(
                              item.type
                            )}`}
                          >
                            {getTypeLabel(item.type)}
                          </span>
                          {/* Name */}
                          <div className="absolute bottom-0 inset-x-0 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <p className="text-white text-xs font-medium truncate text-center">
                              {item.name}
                            </p>
                          </div>
                        </Link>
                      ))}
                </div>

                {/* Progress dots */}
                {showcaseItems.length > 4 && (
                  <div className="flex justify-center gap-1.5 mt-4">
                    {Array.from({
                      length: Math.min(Math.ceil(showcaseItems.length / 4), 5),
                    }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i * 4)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          Math.floor(currentIndex / 4) === i
                            ? "bg-primary w-6"
                            : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 start-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-bounce" />
      <div
        className="absolute bottom-20 end-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
    </section>
  );
}
