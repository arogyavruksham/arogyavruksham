import Link from 'next/link'

export function PromoBanners() {
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Banner 1 */}
          <Link href="/shop?category=Silk" className="block relative h-64 md:h-80 rounded-2xl overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1610189013233-6e273ffcb638?auto=format&fit=crop&q=80" 
              alt="Silk Collection" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#B21F36]/90 via-[#B21F36]/40 to-transparent mix-blend-multiply"></div>
            
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-10">
              <span className="text-yellow-300 font-bold tracking-wider text-sm mb-2 drop-shadow-sm">FESTIVE SPECIAL</span>
              <h3 className="font-serif text-3xl font-bold leading-tight drop-shadow-md">Pure Silk<br/>Collection</h3>
              <p className="mt-2 text-white/90 text-sm drop-shadow-md">Up to 40% Off</p>
              
              <div className="mt-6">
                <span className="inline-block bg-white text-[#B21F36] text-sm font-bold py-2 px-6 rounded-full shadow-md group-hover:bg-gray-100 transition-colors">
                  Shop Now
                </span>
              </div>
            </div>
          </Link>

          {/* Banner 2 */}
          <Link href="/shop?category=Bridal" className="block relative h-64 md:h-80 rounded-2xl overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1596455607563-ad6193f76b17?auto=format&fit=crop&q=80" 
              alt="Bridal Exclusive" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A73E8]/90 via-[#1A73E8]/40 to-transparent mix-blend-multiply"></div>
            
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-10 text-center items-center">
              <h3 className="font-serif text-3xl font-bold leading-tight drop-shadow-md mb-2">Bridal<br/>Exclusive</h3>
              <p className="text-white/90 text-sm drop-shadow-md mb-6">Handwoven perfection for your special day.</p>
              
              <span className="inline-block bg-[#1A73E8] text-white border border-white/50 text-sm font-bold py-2 px-6 rounded-full shadow-md group-hover:bg-white group-hover:text-[#1A73E8] transition-colors">
                Explore Bridal
              </span>
            </div>
          </Link>

          {/* Banner 3 */}
          <Link href="/shop?sale=true" className="block relative h-64 md:h-80 rounded-2xl overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1583391733958-693b3f29b809?auto=format&fit=crop&q=80" 
              alt="Clearance Sale" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/90 via-[#D4AF37]/40 to-transparent mix-blend-multiply"></div>
            
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-10 text-right items-end">
              <div className="bg-[#B21F36] text-white text-xs font-bold px-3 py-1 rounded mb-4 shadow-md">
                LIMITED TIME
              </div>
              <h3 className="font-serif text-4xl font-black leading-tight drop-shadow-md">60%<br/>OFF</h3>
              <p className="mt-1 text-white/90 text-sm drop-shadow-md font-medium">On Selected Banarasi</p>
            </div>
          </Link>
          
        </div>
      </div>
    </section>
  )
}
