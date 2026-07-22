-- Add more products to make the store look full
insert into public.products (title, description, price, category, image_url, stock_count)
values
  (
    'Fiddle Leaf Fig',
    'A popular indoor tree featuring very large, heavily veined, violin-shaped leaves that grow upright. Requires bright, filtered light.',
    2400.00,
    'Indoor Plants',
    'https://images.unsplash.com/photo-1606240217032-4e2e28a9b2c3?auto=format&fit=crop&q=80',
    12
  ),
  (
    'Aloe Vera Plant',
    'A beautiful succulent known for its medicinal properties and low-maintenance care requirements. Thrives in bright light.',
    350.00,
    'Succulents',
    'https://images.unsplash.com/photo-1596547609652-9fc5d8d42e4b?auto=format&fit=crop&q=80',
    45
  ),
  (
    'Echeveria Rosette',
    'A stunning, rose-shaped succulent with plump, fleshy leaves in pastel hues. Extremely drought-tolerant and cute.',
    250.00,
    'Succulents',
    'https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&q=80',
    40
  ),
  (
    'Terracotta Pot (Large)',
    'A classic, breathable terracotta pot that is excellent for plants that prefer drier soil. Comes with a matching drainage saucer.',
    450.00,
    'Pots & Planters',
    'https://images.unsplash.com/photo-1598512752271-33f913a8bed1?auto=format&fit=crop&q=80',
    18
  ),
  (
    'Bougainvillea',
    'A vibrant, sun-loving outdoor plant that bursts with bright pink or purple papery flowers. Perfect for balconies and gardens.',
    1200.00,
    'Outdoor Plants',
    'https://images.unsplash.com/photo-1627914838612-9c3f303f8a49?auto=format&fit=crop&q=80',
    8
  ),
  (
    'ZZ Plant (Zamioculcas)',
    'One of the toughest indoor plants around. Features shiny, waxy green leaves and can survive in very low light with infrequent watering.',
    899.00,
    'Indoor Plants',
    'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&q=80',
    22
  ),
  (
    'Hanging Macrame Planter',
    'A beautiful handmade cotton macrame hanger for displaying your favorite trailing plants elegantly.',
    600.00,
    'Pots & Planters',
    'https://images.unsplash.com/photo-1597055181308-f2b7f32d8fb6?auto=format&fit=crop&q=80',
    35
  ),
  (
    'String of Pearls',
    'A unique trailing succulent that features small, bead-like leaves. Looks stunning when hung near a sunny window.',
    750.00,
    'Succulents',
    'https://images.unsplash.com/photo-1620127161875-104dcb037e4b?auto=format&fit=crop&q=80',
    15
  );
