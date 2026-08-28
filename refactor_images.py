import os
import re

components = [
    "src/components/home/DualHeroBanners.tsx",
    "src/components/home/CategoryCards.tsx",
    "src/components/home/TrendingBanner.tsx",
    "src/components/home/PlantGallery.tsx",
    "src/components/home/LatestFromBlog.tsx"
]

for filepath in components:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove the import for useHomepageImages
    content = re.sub(r"import\s+{\s*useHomepageImages\s*}\s+from\s+'@/lib/homepageImages'\n", "", content)
    
    # Extract the component name
    match = re.search(r"export\s+function\s+([A-Za-z0-9_]+)\s*\(\s*\)", content)
    if match:
        comp_name = match.group(1)
        # Add the prop
        content = content.replace(
            f"export function {comp_name}() {{",
            f"export function {comp_name}({{ images }}: {{ images: Record<string, string> }}) {{"
        )
        
        # Remove the hook call
        content = re.sub(r"\s*const\s+(?:images|heroImages)\s*=\s*useHomepageImages\(\)", "", content)
        
        # If it was named heroImages, replace heroImages with images
        if comp_name == "DualHeroBanners":
            content = content.replace("heroImages", "images")
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
            
# Create server fetching utility
server_file_content = """import { supabase } from '@/lib/supabase'
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
"""
with open("src/lib/serverHomepageImages.ts", "w", encoding="utf-8") as f:
    f.write(server_file_content)

# Update page.tsx
with open("src/app/page.tsx", "r", encoding="utf-8") as f:
    page_content = f.read()

page_content = "import { getHomepageImages } from '@/lib/serverHomepageImages';\n" + page_content
page_content = page_content.replace(
    "export default function Home() {",
    "export default async function Home() {\n  const images = await getHomepageImages();"
)
page_content = page_content.replace("<DualHeroBanners />", "<DualHeroBanners images={images} />")
page_content = page_content.replace("<CategoryCards />", "<CategoryCards images={images} />")
page_content = page_content.replace("<TrendingBanner />", "<TrendingBanner images={images} />")
page_content = page_content.replace("<PlantGallery />", "<PlantGallery images={images} />")
page_content = page_content.replace("<LatestFromBlog />", "<LatestFromBlog images={images} />")

with open("src/app/page.tsx", "w", encoding="utf-8") as f:
    f.write(page_content)

print("Refactor complete.")
