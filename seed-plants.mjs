import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zxifzmurtlhrzkymbhmc.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const newPlants = [
  {
    title: 'Monstera Deliciosa',
    description: 'Also known as the Swiss Cheese Plant, this tropical beauty is famous for its large, glossy leaves with natural holes. Perfect for bright, indirect light indoors.',
    price: 1299.00,
    category: 'Indoor Plants',
    image_url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80',
    stock_count: 15
  },
  {
    title: 'Snake Plant (Sansevieria)',
    description: 'An extremely hardy indoor plant that thrives on neglect. Excellent at purifying the air and requires very little water.',
    price: 499.00,
    category: 'Indoor Plants',
    image_url: 'https://images.unsplash.com/photo-1593480749021-96894c502b4d?auto=format&fit=crop&q=80',
    stock_count: 25
  },
  {
    title: 'Areca Palm',
    description: 'Bring a tropical feel to your home with the elegant Areca Palm. It is a fantastic air purifier and adds a lush green vibe.',
    price: 1850.00,
    category: 'Outdoor Plants',
    image_url: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&q=80',
    stock_count: 10
  },
  {
    title: 'Ceramic Planter Set',
    description: 'A set of three beautifully glazed ceramic pots in varying sizes. Perfect for your indoor and outdoor plants.',
    price: 2299.00,
    category: 'Pots & Planters',
    image_url: 'https://images.unsplash.com/photo-1487798452839-c748a707a6b2?auto=format&fit=crop&q=80',
    stock_count: 30
  },
  {
    title: 'Fiddle Leaf Fig',
    description: 'A popular indoor tree featuring very large, heavily veined, violin-shaped leaves that grow upright. Requires bright, filtered light.',
    price: 2400.00,
    category: 'Indoor Plants',
    image_url: 'https://images.unsplash.com/photo-1606240217032-4e2e28a9b2c3?auto=format&fit=crop&q=80',
    stock_count: 12
  },
  {
    title: 'Aloe Vera Plant',
    description: 'A beautiful succulent known for its medicinal properties and low-maintenance care requirements. Thrives in bright light.',
    price: 350.00,
    category: 'Succulents',
    image_url: 'https://images.unsplash.com/photo-1596547609652-9fc5d8d42e4b?auto=format&fit=crop&q=80',
    stock_count: 45
  },
  {
    title: 'Echeveria Rosette',
    description: 'A stunning, rose-shaped succulent with plump, fleshy leaves in pastel hues. Extremely drought-tolerant and cute.',
    price: 250.00,
    category: 'Succulents',
    image_url: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&q=80',
    stock_count: 40
  },
  {
    title: 'Terracotta Pot (Large)',
    description: 'A classic, breathable terracotta pot that is excellent for plants that prefer drier soil. Comes with a matching drainage saucer.',
    price: 450.00,
    category: 'Pots & Planters',
    image_url: 'https://images.unsplash.com/photo-1598512752271-33f913a8bed1?auto=format&fit=crop&q=80',
    stock_count: 18
  },
  {
    title: 'Bougainvillea',
    description: 'A vibrant, sun-loving outdoor plant that bursts with bright pink or purple papery flowers. Perfect for balconies and gardens.',
    price: 1200.00,
    category: 'Outdoor Plants',
    image_url: 'https://images.unsplash.com/photo-1627914838612-9c3f303f8a49?auto=format&fit=crop&q=80',
    stock_count: 8
  },
  {
    title: 'ZZ Plant (Zamioculcas)',
    description: 'One of the toughest indoor plants around. Features shiny, waxy green leaves and can survive in very low light with infrequent watering.',
    price: 899.00,
    category: 'Indoor Plants',
    image_url: 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&q=80',
    stock_count: 22
  },
  {
    title: 'Hanging Macrame Planter',
    description: 'A beautiful handmade cotton macrame hanger for displaying your favorite trailing plants elegantly.',
    price: 600.00,
    category: 'Pots & Planters',
    image_url: 'https://images.unsplash.com/photo-1597055181308-f2b7f32d8fb6?auto=format&fit=crop&q=80',
    stock_count: 35
  },
  {
    title: 'String of Pearls',
    description: 'A unique trailing succulent that features small, bead-like leaves. Looks stunning when hung near a sunny window.',
    price: 750.00,
    category: 'Succulents',
    image_url: 'https://images.unsplash.com/photo-1620127161875-104dcb037e4b?auto=format&fit=crop&q=80',
    stock_count: 15
  }
];

async function seedData() {
  console.log('Connecting to Supabase and clearing old products...')
  
  // 1. Delete old products
  // We cannot delete all rows directly without a filter if RLS is on, but with service key it should work.
  // To bypass any issues, we can just delete where id is not null.
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .not('id', 'is', null)

  if (deleteError) {
    console.error('Error deleting old products:', deleteError)
    return
  }
  
  console.log('Old products cleared. Inserting new plants data...')

  // 2. Insert new products
  const { data, error: insertError } = await supabase
    .from('products')
    .insert(newPlants)
    .select()

  if (insertError) {
    console.error('Error inserting new plants:', insertError)
  } else {
    console.log(`Successfully seeded ${data.length} plants into the database!`)
  }
}

seedData();
