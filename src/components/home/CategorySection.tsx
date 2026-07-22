import Link from 'next/link'
import Image from 'next/image'

const categories = [
  { name: 'Silk', href: '/shop?category=Silk', image: 'https://images.unsplash.com/photo-1610189013233-6e273ffcb638?auto=format&fit=crop&q=80' },
  { name: 'Banarasi', href: '/shop?category=Banarasi', image: 'https://images.unsplash.com/photo-1583391733958-693b3f29b809?auto=format&fit=crop&q=80' },
  { name: 'Cotton', href: '/shop?category=Cotton', image: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&q=80' },
  { name: 'Georgette', href: '/shop?category=Georgette', image: 'https://images.unsplash.com/photo-1596455607563-ad6193f76b17?auto=format&fit=crop&q=80' },
]

export function CategorySection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">Shop by Category</h2>
          <div className="w-16 h-1 bg-secondary mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link 
              key={category.name} 
              href={category.href}
              className="group relative h-96 overflow-hidden rounded-lg shadow-md block"
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 z-10" />
              <img 
                src={category.image} 
                alt={`${category.name} Plant`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
              />
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <h3 className="text-white font-serif text-2xl font-semibold drop-shadow-md">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
