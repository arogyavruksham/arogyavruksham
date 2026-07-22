import { DualHeroBanners } from "@/components/home/DualHeroBanners";
import { PromoBanners } from "@/components/home/PromoBanners";
import { NewArrivalsAndDeals } from "@/components/home/NewArrivalsAndDeals";
import { TrendingBanner } from "@/components/home/TrendingBanner";
import { NewArrivalsSlider } from "@/components/home/NewArrivalsSlider";
import { LatestFromBlog } from "@/components/home/LatestFromBlog";
import { FooterFeatures } from "@/components/home/FooterFeatures";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Hero Slider */}
      <DualHeroBanners />

      {/* 1. Promotional Banners (SALE, House Plants, Potted) */}
      <PromoBanners />

      {/* 2. New Arrivals (Tabs) + Deal of the Day */}
      <NewArrivalsAndDeals />

      {/* 3. Trending Cactus Banner (Full width split) */}
      <TrendingBanner />

      {/* 4. Featured Products (Slider/Grid) */}
      <NewArrivalsSlider />

      {/* 5. Latest From Blog */}
      <LatestFromBlog />

      {/* 6. Footer Features (Free Shipping, Support, Money Back) */}
      <FooterFeatures />

    </div>
  );
}
