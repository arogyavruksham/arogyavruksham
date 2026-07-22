import { DualHeroBanners } from "@/components/home/DualHeroBanners";
import { CircularCategories } from "@/components/home/CircularCategories";
import { BestDealsGrid } from "@/components/home/BestDealsGrid";
import { AllProductsGrid } from "@/components/home/AllProductsGrid";
import { NewArrivalsSlider } from "@/components/home/NewArrivalsSlider";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      
      {/* 1. Mega Hero Section */}
      <DualHeroBanners />
      
      {/* 2. Popular Categories */}
      <CircularCategories />
      
      {/* 3. Today's Best Deals */}
      <BestDealsGrid />
      
      {/* 4. All Products Grid instead of Promo Banners */}
      <AllProductsGrid />
      
      {/* 5. New Arrivals / AI Collection showcase */}
      <div className="pt-8 bg-white">
        <NewArrivalsSlider />
      </div>

    </div>
  );
}
