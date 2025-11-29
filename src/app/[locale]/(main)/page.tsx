import { setRequestLocale } from "next-intl/server";
import { HeroSection } from "./_components/HeroSection";
import { CategoriesSection } from "./_components/CategoriesSection";
import { FeaturedProducts } from "./_components/FeaturedProducts";
import { BrandsSection } from "./_components/BrandsSection";
import { FeaturesSection } from "./_components/FeaturesSection";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <BrandsSection />
      <FeaturesSection />
    </>
  );
}
