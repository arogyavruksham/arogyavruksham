export const DB_ALLOWED_CATEGORIES = ['Indoor Plants', 'Outdoor Plants', 'Succulents', 'Pots & Planters']

const PLANT_IMAGE_MAP: { [key: string]: string } = {
  'fiddle': 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop',
  'fig': 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop',
  'terracotta': 'https://images.unsplash.com/photo-1487798452839-c748a707a6b2?q=80&w=800&auto=format&fit=crop',
  'pot': 'https://images.unsplash.com/photo-1487798452839-c748a707a6b2?q=80&w=800&auto=format&fit=crop',
  'planter': 'https://images.unsplash.com/photo-1487798452839-c748a707a6b2?q=80&w=800&auto=format&fit=crop',
  'bougainvillea': 'https://images.unsplash.com/photo-1592496001020-d31bd830651f?q=80&w=800&auto=format&fit=crop',
  'flower': 'https://images.unsplash.com/photo-1592496001020-d31bd830651f?q=80&w=800&auto=format&fit=crop',
  'monstera': 'https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=800&auto=format&fit=crop',
  'snake': 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?q=80&w=800&auto=format&fit=crop',
  'succulent': 'https://images.unsplash.com/photo-1459156212016-c812468e2115?q=80&w=800&auto=format&fit=crop',
  'cactus': 'https://images.unsplash.com/photo-1459156212016-c812468e2115?q=80&w=800&auto=format&fit=crop',
  'aloe': 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?q=80&w=800&auto=format&fit=crop',
  'palm': 'https://images.unsplash.com/photo-1558293842-c0fd3db86157?q=80&w=800&auto=format&fit=crop',
  'bonsai': 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=800&auto=format&fit=crop',
  'peace': 'https://images.unsplash.com/photo-1599813580555-520556272545?q=80&w=800&auto=format&fit=crop'
}

const DEFAULT_BOTANICAL_IMAGES = [
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1459156212016-c812468e2115?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558293842-c0fd3db86157?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1487798452839-c748a707a6b2?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1599813580555-520556272545?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1416879598555-220025f82c0b?q=80&w=800&auto=format&fit=crop'
]

export function getBotanicalImage(title?: string, id?: string | number): string {
  if (title && typeof title === 'string') {
    const lower = title.toLowerCase()
    for (const [key, imgUrl] of Object.entries(PLANT_IMAGE_MAP)) {
      if (lower.includes(key)) return imgUrl
    }
  }
  let index = 0
  if (id) {
    const idStr = String(id)
    let hash = 0
    for (let i = 0; i < idStr.length; i++) {
      hash = (hash << 5) - hash + idStr.charCodeAt(i)
      hash |= 0
    }
    index = Math.abs(hash) % DEFAULT_BOTANICAL_IMAGES.length
  }
  return DEFAULT_BOTANICAL_IMAGES[index]
}

export function normalizeProduct(product: any) {
  if (!product) return product
  const p = { ...product }
  if (p.description && typeof p.description === 'string' && p.description.startsWith('[CAT:')) {
    const endIdx = p.description.indexOf(']')
    if (endIdx > 0) {
      p.category = p.description.slice(5, endIdx).trim()
      p.description = p.description.slice(endIdx + 1).replace(/^\n/, '')
    }
  }

  // Ensure valid botanical image URL and override broken/missing/saree links
  const currentImg = p.image_url || (p.images && p.images[0])
  const isBrokenOrSaree = !currentImg || 
                          typeof currentImg !== 'string' || 
                          !currentImg.startsWith('http') || 
                          currentImg.includes('saree') || 
                          currentImg.includes('localhost') ||
                          currentImg.includes('via.placeholder')

  const isKnownPlant = p.title && typeof p.title === 'string' && (
    p.title.toLowerCase().includes('fiddle') || 
    p.title.toLowerCase().includes('terracotta') || 
    p.title.toLowerCase().includes('bougainvillea')
  )

  if (isBrokenOrSaree || isKnownPlant) {
    const validBotanicalImage = getBotanicalImage(p.title, p.id)
    p.image_url = validBotanicalImage
    if (Array.isArray(p.images) && p.images.length > 0) {
      p.images = [validBotanicalImage, ...p.images.slice(1)]
    } else {
      p.images = [validBotanicalImage]
    }
  }

  return p
}

export function normalizeProducts(products: any[]) {
  if (!Array.isArray(products)) return products
  return products.map(normalizeProduct)
}
