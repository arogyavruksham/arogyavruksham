'use client'

import React from 'react'
import Link from 'next/link'
import { Sparkles, MapPin, Award, ChevronRight } from 'lucide-react'

const portfolioItems = [
  {
    title: "Zen Botanical Oasis",
    location: "Bangalore Corporate Tech Center",
    category: "Indoor Living Sanctuary",
    description: "A custom 4,500 sq.ft. indoor botanical installation featuring air-purifying rubber plants, layered philodendrons, and custom drip-irrigation living walls.",
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=800&auto=format&fit=crop",
    stats: "2,400+ Rare Plants Installed"
  },
  {
    title: "Vertical Rainforest Atrium",
    location: "Mumbai Luxury Residence",
    category: "Architectural Horticulture",
    description: "Towering monstera deliciosa and exotic calatheas integrated into a glass atrium, bringing micro-climate biodiversity right into an urban pent-house.",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop",
    stats: "100% Organic Substrate"
  },
  {
    title: "Succulent & Cacti Sculpture Garden",
    location: "Hyderabad Boutique Studio",
    category: "Minimalist Desert Flora",
    description: "An artistically sculpted terrarium and desert cacti garden requiring minimal irrigation while offering profound architectural geometry and calm.",
    image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?q=80&w=800&auto=format&fit=crop",
    stats: "Zero-Maintenance Design"
  },
  {
    title: "Himalayan Medicinal Conservatory",
    location: "Dehradun Wellness Retreat",
    category: "Therapeutic Botany",
    description: "A restorative indoor-outdoor wellness conservatory dedicated to therapeutic Indian herbs, aromatic tulsi varieties, and authentic rejuvenating botanicals.",
    image: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=800&auto=format&fit=crop",
    stats: "Certified Medicinal Flora"
  }
]

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-[#F8FAF7] text-gray-800 py-12 xl:pt-40 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#235839]/10 text-[#235839] font-bold text-xs uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Living Architecture & Design
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-[#1E4631] tracking-tight mb-4 leading-tight">
            Our Botanical Portfolio
          </h1>
          <p className="font-sans text-gray-600 text-base md:text-lg leading-relaxed">
            Explore our hallmark installations, immersive living indoor gardens, and sustainable architectural green spaces custom designed by Arogyavruksham master botanists.
          </p>
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {portfolioItems.map((item, index) => (
            <div 
              key={index}
              className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgb(35,88,57,0.12)] transition-all duration-300 flex flex-col"
            >
              <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-gray-100">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-[#235839] shadow-sm">
                  {item.category}
                </div>
                <div className="absolute bottom-4 right-4 bg-[#1E4631]/90 backdrop-blur-md px-3 py-1 rounded-lg text-white font-mono text-xs font-semibold shadow-md flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" /> {item.stats}
                </div>
              </div>

              <div className="p-7 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
                    <MapPin className="w-3.5 h-3.5 text-[#235839]" /> {item.location}
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#1E4631] mb-3 group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Commissioned Works</span>
                  <Link 
                    href="/contact" 
                    className="inline-flex items-center gap-1 text-sm font-bold text-[#235839] hover:text-emerald-700 transition-colors"
                  >
                    Request Consultation <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-20 bg-[#1E4631] text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-4">Ready to Transform Your Space?</h2>
            <p className="text-white/80 text-sm sm:text-base mb-8">
              Partner with our botanical architects to conceptualize and craft lush, living sanctuaries tailored to your home or office environment.
            </p>
            <Link 
              href="/shop" 
              className="inline-block px-8 py-3.5 rounded-xl bg-white text-[#1E4631] font-bold font-sans text-sm hover:bg-emerald-50 transition-all shadow-lg"
            >
              Explore Living Botanicals
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
