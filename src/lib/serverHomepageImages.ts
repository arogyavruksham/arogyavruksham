import { supabase } from '@/lib/supabase'
import { DEFAULT_IMAGES } from '@/lib/homepageImages'

export async function getHomepageImages(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase
      .from('homepage_images')
      .select('id, image_url')
    
    if (data && data.length > 0) {
      const merged = { ...DEFAULT_IMAGES }
      data.forEach((img: any) => {
        if (img.image_url) merged[img.id] = img.image_url
      })
      return merged
    }
  } catch (err) {
    // silently use defaults
  }
  return DEFAULT_IMAGES
}
