export const DB_ALLOWED_CATEGORIES = ['Indoor Plants', 'Outdoor Plants', 'Succulents', 'Pots & Planters']

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
  return p
}

export function normalizeProducts(products: any[]) {
  if (!Array.isArray(products)) return products
  return products.map(normalizeProduct)
}
