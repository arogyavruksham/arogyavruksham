import React from 'react'
import Link from 'next/link'
import { BookOpen, Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react'
import { LatestFromBlog } from '@/components/home/LatestFromBlog'
import { getHomepageImages } from '@/lib/serverHomepageImages'

const guides = [
  {
    title: "The Master Guide to Indoor Humidity & Foliage Misting",
    excerpt: "Discover how tropical indoor botanicals react to micro-climates, and learn the optimal misting cycles for vibrant leaf luster.",
    date: "August 2, 2026",
    readTime: "5 min read",
    category: "Horticulturist Advice",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "Organic Soil Enrichment: Nurturing Root Ecosystems",
    excerpt: "Why synthetic fertilizers fall short, and how mycorrhizal inoculants and composted forest humus create everlasting root resilience.",
    date: "July 28, 2026",
    readTime: "7 min read",
    category: "Soil & Nutrients",
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "Revitalizing Dropping Leaves: A Diagnostic Handbook",
    excerpt: "Identify early indicators of root rot, overwatering versus drought stress, and natural light deficiency in rare house plants.",
    date: "July 19, 2026",
    readTime: "4 min read",
    category: "Plant Health",
    image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?q=80&w=600&auto=format&fit=crop"
  }
]

export default async function BlogsPage() {
  const images = await getHomepageImages()

  return (
    <div className="min-h-screen bg-white py-12 xl:pt-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#235839] font-bold text-xs uppercase tracking-widest mb-4">
            <BookOpen className="w-3.5 h-3.5" /> Botanical Journal
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-[#1E4631] tracking-tight mb-4">
            Green Care & Agronomy Insights
          </h1>
          <p className="font-sans text-gray-600 text-base md:text-lg">
            Cultivate deep plant wisdom with research-backed horticulture tutorials, watering calendars, and propagation manuals curated by Arogyavruksham botanists.
          </p>
        </div>

        {/* Featured Blogs Component from Home */}
        <div className="mb-20">
          <LatestFromBlog images={images} />
        </div>

        {/* Extended Articles Grid */}
        <div className="border-t border-gray-100 pt-16">
          <h2 className="font-serif text-2xl font-bold text-[#1E4631] mb-8">Deep-Dive Care Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {guides.map((post, idx) => (
              <article key={idx} className="bg-[#FAFCF9] border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                <div className="h-52 w-full overflow-hidden relative">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 right-3 bg-[#235839] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 mb-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#1E4631] mb-3 hover:text-emerald-600 cursor-pointer transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      {post.excerpt}
                    </p>
                  </div>
                  <Link href="/shop" className="inline-flex items-center gap-1.5 font-bold text-xs uppercase text-[#235839] hover:underline tracking-wider">
                    Explore Relevant Botanicals <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
