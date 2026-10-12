import { getCategories, getProducts } from "@/lib/api";

import { CategorySection } from "@/components/home/category-section";
import { HeroSection } from "@/components/home/hero-section";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeNavbar } from "@/components/home/home-navbar";
import { PopularProducts } from "@/components/home/popular-products";
import { VendorCta } from "@/components/home/vendor-cta";

export default async function HomePage() {
  const [productsResponse, categoriesResponse] =
    await Promise.all([
      getProducts(),
      getCategories(),
    ]);

  return (
    <main className="min-h-screen bg-muted/30">
      <HomeNavbar />

      <HeroSection />

      <CategorySection
        categories={categoriesResponse.data}
      />

      <PopularProducts
        products={productsResponse.data}
      />

      <VendorCta />

      <HomeFooter />
    </main>
  );
}