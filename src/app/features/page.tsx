'use client'

import React from 'react'
import Link from 'next/link'
import { ShieldCheck, Truck, Sprout, HeartPulse, Sun, Droplet, RefreshCw, Award } from 'lucide-react'

const featuresList = [
  {
    icon: Sprout,
    title: "100% Organic Soil & Custom Root Nutrients",
    description: "Every plant is rooted in our proprietary botanical substrate formulated with organic mycorrhizae, neem cake, and rich forest humus for perpetual vitality."
  },
  {
    icon: ShieldCheck,
    title: "7-Day Live Thrive Guarantee",
    description: "We guarantee your plant arrives lush, intact, and vigorous. If your plant suffers transit trauma within 7 days, we replace it instantly with a fresh speciman."
  },
  {
    icon: Truck,
    title: "Shockproof Eco-Engineered Packaging",
    description: "Our innovative breathable eco-lock cartons protect stems, leaves, and soil beds against inversion, bumps, and dehydration across all delivery zones in India."
  },
  {
    icon: HeartPulse,
    title: "Live Horticulturist Support",
    description: "Get lifetime access to our certified plant agronomists. Need diagnosis or repotting advice? Connect with our botanical care deck anytime."
  },
  {
    icon: Sun,
    title: "Climate-Adaptive Conditioning",
    description: "Before dispatch, plants undergo a 5-day acclimation regimen in our controlled greenhouse nurseries to ensure effortless adjustment to home lighting."
  },
  {
    icon: Droplet,
    title: "Pure Rain-Water Irrigation Culture",
    description: "Our cultivation nursery utilizes purified rainwater and natural mineral infusions, free from municipal chloramines that stress tender fibrous root systems."
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#F8FAF7] text-gray-800 py-12 xl:pt-40 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#235839]/10 text-[#235839] font-bold text-xs uppercase tracking-wider mb-4">
            <Award className="w-4 h-4" /> The Arogyavruksham Standard
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-[#1E4631] tracking-tight mb-4 leading-tight">
            Why Our Flora Thrives Forever
          </h1>
          <p className="font-sans text-gray-600 text-base md:text-lg leading-relaxed">
            From uncompromising organic agronomy to breakthrough breathable packaging, discover the scientific excellence built into every botanical we deliver.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {featuresList.map((f, i) => {
            const IconComponent = f.icon
            return (
              <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#E7F0DF] text-[#235839] flex items-center justify-center mb-6 shadow-sm">
                    <IconComponent className="w-7 h-7" strokeWidth={2} />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#1E4631] mb-3">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {f.description}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-[#235839] uppercase tracking-wider">
                  <span>Tested & Proven</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quality Seal Section */}
        <div className="bg-gradient-to-r from-[#1c3f25] to-[#235839] rounded-3xl p-10 md:p-14 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">Experience Premium Living Botanicals</h2>
            <p className="text-white/80 text-sm md:text-base leading-relaxed">
              Every order comes complete with a dedicated watering tag, organic soil starter pack, and our 7-Day Live Thrive replacement warranty.
            </p>
          </div>
          <div className="shrink-0">
            <Link 
              href="/shop" 
              className="inline-block px-8 py-4 rounded-2xl bg-white text-[#1E4631] font-bold font-sans text-base hover:bg-emerald-50 transition-transform hover:scale-105 shadow-xl"
            >
              Shop Our Thriving Collection
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
