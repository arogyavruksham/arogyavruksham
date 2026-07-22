import { DualHeroBanners } from "@/components/home/DualHeroBanners";
import { CircularCategories } from "@/components/home/CircularCategories";
import { BestDealsGrid } from "@/components/home/BestDealsGrid";
import { NewArrivalsSlider } from "@/components/home/NewArrivalsSlider";
import { PromoBanners } from "@/components/home/PromoBanners";
import { NewArrivalsAndDeals } from "@/components/home/NewArrivalsAndDeals";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* 1. Full-Screen Hero Slider */}
      <DualHeroBanners />

      {/* 2. Scrolling Marquee + Just Launched */}
      <BestDealsGrid />

      {/* 3. Promotional Banners (3-col) */}
      <PromoBanners />

      {/* 4. New Arrivals + Deal of the Day */}
      <NewArrivalsAndDeals />

      {/* 5. Shop by Category (animated grid) */}
      <CircularCategories />

      {/* 6. Featured Products Horizontal Slider */}
      <div className="border-t border-gray-100">
        <NewArrivalsSlider />
      </div>

    </div>
  );
}
