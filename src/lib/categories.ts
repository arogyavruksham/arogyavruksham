'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { normalizeProducts } from '@/lib/product-helper'
export { DB_ALLOWED_CATEGORIES, normalizeProduct, normalizeProducts } from '@/lib/product-helper'

export interface CategoryItem {
  name: string
  slug: string
  image: string
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { name: 'Indoor Plants', slug: 'Indoor', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80' },
  { name: 'Outdoor Plants', slug: 'Outdoor', image: 'https://images.unsplash.com/photo-1558293842-c0fd3db86157?auto=format&fit=crop&q=80' },
  { name: 'Succulents', slug: 'Succulents', image: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&q=80' },
  { name: 'Seeds', slug: 'Seeds', image: 'https://images.unsplash.com/photo-1599813580555-520556272545?auto=format&fit=crop&q=80' },
  { name: 'Tools', slug: 'Tools', image: 'https://images.unsplash.com/photo-1416879598555-220025f82c0b?auto=format&fit=crop&q=80' },
  { name: 'Pots & Planters', slug: 'Pots', image: 'https://images.unsplash.com/photo-1487798452839-c748a707a6b2?auto=format&fit=crop&q=80' }
]

export function getStoredCategories(): CategoryItem[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES
  try {
    const stored = localStorage.getItem('arogyavruksham_categories')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Error reading categories:', e)
  }
  return DEFAULT_CATEGORIES
}

export function saveStoredCategories(categories: CategoryItem[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('arogyavruksham_categories', JSON.stringify(categories))
    window.dispatchEvent(new Event('categories_updated'))
  } catch (e) {
    console.error('Error saving categories:', e)
  }
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES)

  useEffect(() => {
    function load() {
      const cats = getStoredCategories()
      setCategories(cats)
    }
    load()

    // Sync with products to enrich category images with real launched products
    async function syncWithProducts() {
      try {
        const { data: rawProducts } = await supabase
          .from('products')
          .select('category, image_url, images, description')
          .order('created_at', { ascending: false })

        const products = normalizeProducts(rawProducts || [])

        if (products && products.length > 0) {
          const currentCats = getStoredCategories()
          let changed = false
          const updatedCats = [...currentCats]

          // For each product, update matching category image or add new category
          for (const prod of products) {
            if (!prod.category) continue
            const img = prod.image_url || (prod.images && prod.images[0])
            if (!img) continue

            const existingIndex = updatedCats.findIndex(
              c => c.name.toLowerCase() === prod.category.toLowerCase() || c.slug.toLowerCase() === prod.category.toLowerCase()
            )

            if (existingIndex >= 0) {
              // Replace unsplash or old image with real product image
              if (updatedCats[existingIndex].image.includes('unsplash.com') || !updatedCats[existingIndex].image) {
                updatedCats[existingIndex].image = img
                changed = true
              }
            } else {
              // Add new category discovered in products
              updatedCats.push({
                name: prod.category,
                slug: prod.category,
                image: img
              })
              changed = true
            }
          }

          if (changed) {
            saveStoredCategories(updatedCats)
            setCategories(updatedCats)
          }
        }
      } catch (e) {
        console.error('Error syncing categories with products:', e)
      }
    }

    syncWithProducts()

    const handleUpdate = () => load()
    window.addEventListener('categories_updated', handleUpdate)
    return () => window.removeEventListener('categories_updated', handleUpdate)
  }, [])

  return categories
}

