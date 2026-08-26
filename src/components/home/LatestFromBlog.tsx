'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link2, Quote, Music, User, ArrowRight } from 'lucide-react'

const posts = [
  {
    id: 1,
    title: 'The Ultimate Guide to Watering',
    date: 'FEBRUARY 27, 2024',
    excerpt: 'Here are some golden rules for watering your plants. Keep these on hand to prevent overwatering and root rot.',
    author: 'Arogyavruksham Team',
    image: 'https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?auto=format&fit=crop&q=80',
    icon: Link2
  },
  {
    id: 2,
    title: 'Spring Care for Indoor Botanicals',
    date: 'MARCH 15, 2024',
    excerpt: 'We\'re talking about all things spring and how you should care for your plants when the temperature finally warms up.',
    author: 'Plant Experts',
    image: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&q=80',
    icon: Quote
  },
  {
    id: 3,
    title: 'Choosing the Right Drainage',
    date: 'APRIL 02, 2024',
    excerpt: 'If it\'s rained for a couple of days, lay off on watering, make sure your planters have proper drainage systems.',
    author: 'Arogyavruksham Team',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80',
    icon: Music
  }
]

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
  })
}

export function LatestFromBlog() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="py-24 bg-[#FAFAF7]" ref={ref}>
      <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
          className="mb-16 flex flex-col md:flex-row md:items-end justify-between border-b border-[#E5ECE5] pb-6 gap-4">
          <div>
            <h2 className="font-serif text-[40px] text-[#1a1a1a] font-medium leading-none mb-2">Our Journal</h2>
            <p className="text-gray-500 font-sans text-sm md:text-base">Tips, stories, and guides for plant lovers.</p>
          </div>
          <button className="flex items-center text-[#1E4631] font-bold text-[12px] tracking-[0.15em] uppercase hover:text-[#D27D56] transition-colors group">
            Read All Articles <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {posts.map((post, i) => {
            const Icon = post.icon
            return (
              <motion.div custom={i} variants={cardVariants} initial="hidden" animate={inView ? "visible" : "hidden"} key={post.id} className="group cursor-pointer bg-white rounded-[32px] overflow-hidden flex flex-col h-full hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 border border-[#F4F6F4] hover:-translate-y-2">
                
                {/* Image Box */}
                <div className="relative h-[260px] md:h-[300px] w-full overflow-hidden p-2">
                  <div className="w-full h-full rounded-[24px] overflow-hidden relative">
                    <motion.img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Overlay Icon */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors group-hover:bg-[#1E4631]">
                      <Icon className="w-4 h-4 text-[#1E4631] group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-8 pt-6 flex flex-col flex-1">
                  <p className="text-[#D27D56] text-[11px] font-bold tracking-[0.2em] uppercase mb-4">{post.date}</p>
                  <h3 className="font-serif font-medium text-[24px] text-[#1a1a1a] mb-4 group-hover:text-[#1E4631] transition-colors leading-tight">{post.title}</h3>
                  <p className="text-gray-500 text-[14px] leading-relaxed flex-1 font-sans mb-6">{post.excerpt}</p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-4 pt-6 border-t border-[#F4F6F4]">
                    <div className="w-10 h-10 bg-[#E5ECE5] rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[#1E4631]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Written By</p>
                      <p className="text-[13px] font-bold text-[#1a1a1a]">{post.author}</p>
                    </div>
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
