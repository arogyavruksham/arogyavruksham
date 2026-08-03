'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingBag, User, FileText, HelpCircle, Phone, Lock, ChevronRight, Layers, Home, Sparkles } from 'lucide-react'

const pageCategories = [
  {
    category: "Shop & Discovery",
    description: "Explore our lush living sanctuaries, botanical collections, and creative showcase.",
    links: [
      { name: "Home Sanctuary", href: "/", icon: Home, badge: "Main" },
      { name: "Shop All Collection", href: "/shop", icon: ShoppingBag, badge: "Popular" },
      { name: "Living Architecture Portfolio", href: "/portfolio", icon: Sparkles },
      { name: "Botanical Care Journal", href: "/blogs", icon: FileText },
    ]
  },
  {
    category: "Account & Support",
    description: "Manage your profile, track active orders, or consult with our plant agronomist team.",
    links: [
      { name: "My Profile Dashboard", href: "/profile", icon: User },
      { name: "Customer Login & Sign Up", href: "/login", icon: User },
      { name: "Live Greenhouse Support", href: "/contact", icon: Phone, badge: "24/7" },
    ]
  },
  {
    category: "Institutional & Legal",
    description: "Review our transparent botanical warranty, privacy guarantees, and administrative portal.",
    links: [
      { name: "Shipping & Thrive Warranty", href: "/policies/shipping", icon: FileText },
      { name: "Terms of Service", href: "/policies/terms", icon: FileText },
      { name: "Privacy & Data Policy", href: "/policies/privacy", icon: FileText },
      { name: "Admin Console", href: "/admin", icon: Lock, badge: "Protected" },
    ]
  }
]

export default function PagesDirectoryPage() {
  return (
    <div className="min-h-screen bg-[#FAFCF9] text-gray-800 py-12 xl:pt-40 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#235839]/10 text-[#235839] font-bold text-xs uppercase tracking-widest mb-4">
            <Layers className="w-4 h-4" /> Master Site Directory
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-[#1E4631] tracking-tight mb-4">
            Arogyavruksham Navigation Hub
          </h1>
          <p className="font-sans text-gray-600 text-base md:text-lg">
            Effortlessly navigate our botanical repository, customer care portals, legal documentation, and specialty plant guides from a unified directory.
          </p>
        </div>

        {/* Directory Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pageCategories.map((section, index) => (
            <div key={index} className="bg-white rounded-3xl p-7 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1E4631] mb-2">
                  {section.category}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-6 border-b border-gray-100 pb-4">
                  {section.description}
                </p>
                <div className="space-y-3">
                  {section.links.map((link, lIdx) => {
                    const Icon = link.icon
                    return (
                      <Link 
                        key={lIdx} 
                        href={link.href}
                        className="group flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/70 hover:bg-[#E7F0DF] transition-all border border-gray-100/60 hover:border-[#CCE8B5]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white text-[#235839] flex items-center justify-center shadow-xs group-hover:bg-[#235839] group-hover:text-white transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-gray-800 group-hover:text-[#1E4631]">
                            {link.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {link.badge && (
                            <span className="text-[10px] font-mono uppercase bg-[#235839]/10 text-[#235839] px-2 py-0.5 rounded-md font-extrabold">
                              {link.badge}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#235839] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
