import { Package, Truck, ShieldCheck, HeadphonesIcon } from 'lucide-react'

export function FeatureBoxes() {
  return (
    <section className="py-10 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="flex items-center gap-4 bg-[#F8FAFC] p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-[#1A73E8]">
              <Package className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-sans font-bold text-gray-900 text-sm md:text-base leading-tight mb-1">Authentic Craftsmanship</h4>
              <p className="text-xs text-gray-500 font-medium">100% Handwoven Guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#F8FAFC] p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-[#1A73E8]">
              <Truck className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-sans font-bold text-gray-900 text-sm md:text-base leading-tight mb-1">Free Shipping</h4>
              <p className="text-xs text-gray-500 font-medium">On orders over ₹20,000</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#F8FAFC] p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-[#1A73E8]">
              <ShieldCheck className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-sans font-bold text-gray-900 text-sm md:text-base leading-tight mb-1">Flexible Payment</h4>
              <p className="text-xs text-gray-500 font-medium">EMI & Secure checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#F8FAFC] p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-[#1A73E8]">
              <HeadphonesIcon className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-sans font-bold text-gray-900 text-sm md:text-base leading-tight mb-1">24/7 Priority Support</h4>
              <p className="text-xs text-gray-500 font-medium">Personal shopping assistant</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
