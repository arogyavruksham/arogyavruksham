'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const posts = [
  {
    id: 1,
    title: 'What Is The Best Plant For You?',
    date: 'December 12, 2023',
    comments: '4 Comments',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean tellus dui, rhoncus efficitur eu, varius sit amet elit. Suspendisse potenti. Quisque id mi risus.',
    imageKey: 'blog_1',
    fallbackText: 'Plant+1'
  },
  {
    id: 2,
    title: 'New Roses From Star Roses & Plants',
    date: 'December 12, 2023',
    comments: '4 Comments',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean tellus dui, rhoncus efficitur eu, varius sit amet elit. Suspendisse potenti. Quisque id mi risus.',
    imageKey: 'blog_2',
    fallbackText: 'Plant+2'
  },
  {
    id: 3,
    title: 'Liz Kirby: Host, The Indoor Garden',
    date: 'December 12, 2023',
    comments: '4 Comments',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean tellus dui, rhoncus efficitur eu, varius sit amet elit. Suspendisse potenti. Quisque id mi risus.',
    imageKey: 'blog_3',
    fallbackText: 'Plant+3'
  }
]

export function LatestFromBlog({ images }: { images: Record<string, string> }) {

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-16">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-sans text-[28px] text-[#166534] font-semibold leading-none">
            Top Trending Plants
          </h2>
          <Link
            href="/blogs"
            className="text-[#166534] text-[15px] flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            view all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div key={post.id} className="flex flex-col items-center text-center">
              <Link href={`/blogs/${post.id}`} className="w-full aspect-[4/3] bg-gray-100 overflow-hidden mb-5 block">
                <img 
                  src={images[post.imageKey as keyof typeof images] || `https://placehold.co/600x450/eeeeee/cccccc?text=${post.fallbackText}`}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </Link>
              
              <div className="flex items-center gap-4 text-[12px] text-gray-400 mb-3 font-medium">
                <span>{post.date}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>{post.comments}</span>
              </div>
              
              <Link href={`/blogs/${post.id}`}>
                <h3 className="font-sans text-[18px] font-bold text-[#166534] mb-3 hover:opacity-80 transition-opacity leading-snug">
                  {post.title}
                </h3>
              </Link>
              
              <p className="text-[14px] text-gray-500 leading-relaxed font-sans max-w-[90%]">
                {post.excerpt}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
