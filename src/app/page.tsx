import { getHomepageImages } from '@/lib/serverHomepageImages';
import { DualHeroBanners } from "@/components/home/DualHeroBanners";
import { PromoBanners } from "@/components/home/PromoBanners";
import { CategoryCards } from "@/components/home/CategoryCards";
import { NewArrivalsAndDeals } from "@/components/home/NewArrivalsAndDeals";
import { PromotionBanner } from "@/components/home/PromotionBanner";
import { ProductSlider } from "@/components/home/ProductSlider";
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

      {/* 5. Benefits of Indoor Plants — Promotion Banner */}
      <PromotionBanner 
        title="The Benefits Of Indoor Plants"
        description="Phasellus tempus dignissim crasendum facilisis. Mauris ut elit sed tincidunt convallis."
        buttonText="Shop Now"
        buttonLink="/shop?category=Indoor%20Plants"
        imageSrc={images.benefits || "https://placehold.co/400x500/eeeeee/cccccc?text=Plant+Image"}
      />

      {/* 5.1 Related Products (Indoor Plants) */}
      <ProductSlider 
        title="Related Indoor Plants" 
        categoryFilter="Indoor Plants" 
      />

      {/* 5.2 50% Off Promotion Banner */}
      <PromotionBanner 
        title="Get 50% Off On Selected Plants"
        description="Transform your home into a green oasis with our special half-price collection. Limited time offer."
        buttonText="Explore Deals"
        buttonLink="/shop"
        imageSrc={images.promo_50_off || "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800"}
      />

      {/* 5.3 Related Sale Products */}
      <ProductSlider 
        title="50% Off Sale Items" 
        saleOnly={true} 
      />

      {/* 6. Plant Gallery — Masonry bento grid (desktop only) */}
      <PlantGallery images={images} />

      {/* 7. Top Trending Plants — Article cards */}
      <LatestFromBlog images={images} />

      {/* 8. Newsletter Subscribe Banner */}
      <FooterFeatures />

    </div>
  );
}
