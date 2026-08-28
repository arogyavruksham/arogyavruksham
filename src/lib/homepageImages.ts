'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

/* ────────────────────────────────────────────────────
   Default Unsplash images for every editable slot.
   These are used immediately on render and replaced
   if the admin has uploaded custom images.
   ──────────────────────────────────────────────────── */
export const DEFAULT_IMAGES: Record<string, string> = {
  // Hero mosaic (5 images)
  hero_grid_1: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800',
  hero_grid_2: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=800',
  hero_grid_3: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=600',
  hero_grid_4: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&q=80&w=600',
  hero_grid_5: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&q=80&w=800',

  // Category cards (3)
  category_1: 'https://images.unsplash.com/photo-1597405230303-3ea76b91c0d4?auto=format&fit=crop&q=80&w=600',
  category_2: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&q=80&w=600',
  category_3: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&q=80&w=600',

  // Plant Gallery (6)
  gallery_1: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800',
  gallery_2: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&q=80&w=600',
  gallery_3: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&q=80&w=800',
  gallery_4: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&q=80&w=600',
  gallery_5: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&q=80&w=600',
  gallery_6: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800',

  // Blog/Trending article images (3)
  blog_1: 'https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?auto=format&fit=crop&q=80&w=600',
  blog_2: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&q=80&w=600',
  blog_3: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=600',

  // Newsletter decorative
  newsletter_leaf: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=300',
  newsletter_person: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=300',

  // Footer Instagram grid (8)
  footer_ig_1: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=200',
  footer_ig_2: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&q=80&w=200',
  footer_ig_3: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&q=80&w=200',
  footer_ig_4: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&q=80&w=200',
  footer_ig_5: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=200',
  footer_ig_6: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&q=80&w=200',
  footer_ig_7: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&q=80&w=200',
  footer_ig_8: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=200',
}

/**
 * Hook: fetches all homepage image overrides from Supabase.
 * Returns a map of image IDs → URLs, with defaults as fallback.
 */
export function useHomepageImages() {
  const [images, setImages] = useState<Record<string, string>>(DEFAULT_IMAGES)

  useEffect(() => {
    async function loadImages() {
      try {
        const { data } = await supabase
          .from('homepage_images')
          .select('id, image_url')
        
        if (data && data.length > 0) {
          const merged = { ...DEFAULT_IMAGES }
          data.forEach((img: any) => {
            if (img.image_url) merged[img.id] = img.image_url
          })
          setImages(merged)
        }
      } catch (err) {
        // Table might not exist yet — silently use defaults
      }
    }
    
    loadImages()
  }, [])

  return images
}
