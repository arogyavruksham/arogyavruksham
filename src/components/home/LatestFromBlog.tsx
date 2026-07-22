'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link2, Quote, Music, User } from 'lucide-react'

const posts = [
  {
    id: 1,
    title: 'Post Format Link',
    date: 'FEBRUARY 27, 2018',
    excerpt: 'Here are some golden rules for watering your plants. Keep these on hand when watering.',
    author: 'g5plusacc',
    image: 'https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?auto=format&fit=crop&q=80',
    icon: Link2
  },
  {
    id: 2,
    title: 'Season-Care: Spring',
    date: 'FEBRUARY 13, 2018',
    excerpt: 'We\'re talking about all things spring and how you should care for your plants when the temperature warms up.',
    author: 'g5plusacc',
    image: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&q=80',
    icon: Quote
  },
  {
    id: 3,
    title: 'Audio Post Example',
    date: 'FEBRUARY 10, 2018',
    excerpt: 'If it\'s rained for a couple of days, lay off on watering, make sure your planters have drainage.',
    author: 'g5plusacc',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80',
    icon: Music
  }
]

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const }
  })
}

export function LatestFromBlog() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
          className="mb-12 border-b border-[#f0f0f0] pb-3">
          <h2 className="font-serif text-[28px] md:text-[32px] text-[#333] font-normal leading-none">Latest From Blog</h2>
        </motion.div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {posts.map((post, i) => {
            const Icon = post.icon
            return (
              <motion.div custom={i} variants={cardVariants} initial="hidden" animate={inView ? "visible" : "hidden"} key={post.id} className="group cursor-pointer bg-white overflow-hidden flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                
                {/* Image Box */}
                <div className="relative h-[240px] md:h-[280px] w-full overflow-hidden">
                  <motion.img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Overlay Icon */}
                  <div className="absolute top-4 right-4 bg-[#2b351e]/80 w-8 h-8 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-md transition-colors group-hover:bg-[#689f38]">
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                {/* Content Box */}
                <div className="pt-6 pb-4 flex flex-col flex-1">
                  <p className="text-[#689f38] text-[10px] font-bold tracking-[2px] uppercase mb-3">{post.date}</p>
                  <h3 className="font-bold text-[18px] text-[#222] mb-3 group-hover:text-[#689f38] transition-colors">{post.title}</h3>
                  <p className="text-[#777] text-[13px] leading-[1.8] flex-1">{post.excerpt}</p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-3 mt-6 pt-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-[12px] text-[#666]">By <span className="text-[#689f38] italic hover:underline"> {post.author} </span></p>
                  </div>
                </div>

              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
