import { getHomepageImages } from '@/lib/serverHomepageImages';
import { DualHeroBanners } from "@/components/home/DualHeroBanners";
import { PromoBanners } from "@/components/home/PromoBanners";
import { CategoryCards } from "@/components/home/CategoryCards";
import { NewArrivalsAndDeals } from "@/components/home/NewArrivalsAndDeals";
import { TrendingBanner } from "@/components/home/TrendingBanner";
import { PlantGallery } from "@/components/home/PlantGallery";
import { LatestFromBlog } from "@/components/home/LatestFromBlog";
import { FooterFeatures } from "@/components/home/FooterFeatures";

export const revalidate = 3600; // Cache for 1 hour to massively boost performance

export default async function Home() {
  const images = await getHomepageImages();
  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* 1. Hero — Split layout (desktop) / Image slider (mobile) */}
      <DualHeroBanners images={images} />

      {/* 2. Featured Plant — Product grid (desktop) / Promo banners (mobile) */}
      <PromoBanners />

      {/* 3. Category Cards — 3-column overlay cards (desktop only) */}
      <CategoryCards images={images} />

      {/* 4. Top Rating — Tab-filtered product grid (desktop) / New Arrivals (mobile) */}
      <NewArrivalsAndDeals />

      {/* 5. Benefits of Indoor Plants — Dark green banner */}
      <TrendingBanner images={images} />

      {/* 6. Plant Gallery — Masonry bento grid (desktop only) */}
      <PlantGallery images={images} />

      {/* 7. Top Trending Plants — Article cards */}
      <LatestFromBlog images={images} />

      {/* 8. Newsletter Subscribe Banner */}
      <FooterFeatures />

    </div>
  );
}
