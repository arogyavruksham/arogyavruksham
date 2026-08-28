'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useHomepageImages } from '@/lib/homepageImages'

const posts = [
  {
    id: 1,
    imageKey: 'blog_1',
    date: 'December 12, 2024',
    comments: 6,
    title: 'What Is The Best Plant For You?',
    excerpt:
      'Looking for the perfect houseplant? We break down the top picks by lifestyle, light conditions, and care level to help you find your ideal match.',
  },
  {
    id: 2,
    imageKey: 'blog_2',
    date: 'December 15, 2024',
    comments: 4,
    title: 'New Roses From Star Roses & Plants',
    excerpt:
      "Star Roses & Plants has introduced stunning new varieties this season. From climbers to hybrid teas, discover what's blooming in the world of roses.",
  },
  {
    id: 3,
    imageKey: 'blog_3',
    date: 'December 18, 2024',
    comments: 8,
    title: 'Liz Kirby, Host: The Indoor Garden',
    excerpt:
      'We sit down with Liz Kirby to talk indoor gardening trends, her favorite low-light plants, and tips for keeping your green friends thriving year-round.',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.7,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
    },
  }),
}

export function LatestFromBlog() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const images = useHomepageImages()

  return (
    <>
      {/* ─── MOBILE VIEW ─── */}
      <section className="block md:hidden py-12 bg-white px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-[28px] font-medium text-[#1a1a1a] tracking-tight">
            Top Trending
          </h2>
          <Link
            href="/blogs"
            className="text-[11px] font-bold text-[#1E4631] uppercase tracking-[0.15em] flex items-center"
          >
            View All <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[#FAFAF7] rounded-[20px] overflow-hidden border border-[#F4F6F4]"
            >
              <div className="h-[200px] overflow-hidden">
                <img
                  src={images[post.imageKey]}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <p className="text-[11px] text-gray-400 font-medium mb-2">
                  {post.date}
                </p>
                <h3 className="font-serif text-[18px] font-medium text-[#1a1a1a] mb-2 leading-tight">
                  {post.title}
                </h3>
                <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DESKTOP VIEW — Top Trending Plants ─── */}
      <section className="hidden md:block py-24 bg-white" ref={ref}>
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="flex items-end justify-between mb-14"
          >
            <h2 className="font-serif text-[40px] text-[#1a1a1a] font-medium leading-none">
              Top Trending Plants
            </h2>
            <Link
              href="/blogs"
              className="flex items-center gap-2 text-[#1E4631] font-bold text-[13px] tracking-wide hover:text-[#D27D56] transition-colors group"
            >
              view all{' '}
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 group-hover:border-[#D27D56] group-hover:bg-[#D27D56] group-hover:text-white transition-all">
                →
              </span>
            </Link>
          </motion.div>

          {/* Article Cards Grid */}
          <div className="grid grid-cols-3 gap-8 lg:gap-10">
            {posts.map((post, i) => (
              <motion.article
                key={post.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                className="group cursor-pointer"
              >
                {/* Image */}
                <div className="h-[260px] rounded-[20px] overflow-hidden mb-6">
                  <img
                    src={images[post.imageKey]}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 mb-3 text-[12px] text-gray-400 font-medium">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.comments} Comments</span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-[22px] font-medium text-[#1a1a1a] leading-tight mb-3 group-hover:text-[#1E4631] transition-colors">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-500 text-[14px] leading-relaxed font-sans line-clamp-3 mb-4">
                  {post.excerpt}
                </p>

                {/* Read More Arrow */}
                <div className="flex items-center gap-2 text-[#1E4631] font-semibold text-[13px] group-hover:translate-x-2 transition-transform duration-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
