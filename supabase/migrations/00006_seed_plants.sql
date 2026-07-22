-- Seed Products with Real Plant Images and Data
insert into public.products (title, description, price, category, image_url, stock_count)
values
  (
    'Monstera Deliciosa',
    'Also known as the Swiss Cheese Plant, this tropical beauty is famous for its large, glossy leaves with natural holes. Perfect for bright, indirect light indoors.',
    1299.00,
    'Indoor Plants',
    'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80',
    15
  ),
  (
    'Snake Plant (Sansevieria)',
    'An extremely hardy indoor plant that thrives on neglect. Excellent at purifying the air and requires very little water.',
    499.00,
    'Indoor Plants',
    'https://images.unsplash.com/photo-1593480749021-96894c502b4d?auto=format&fit=crop&q=80',
    25
  ),
  (
    'Areca Palm',
    'Bring a tropical feel to your home with the elegant Areca Palm. It is a fantastic air purifier and adds a lush green vibe.',
    1850.00,
    'Outdoor Plants',
    'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&q=80',
    10
  ),
  (
    'Ceramic Planter Set',
    'A set of three beautifully glazed ceramic pots in varying sizes. Perfect for your indoor and outdoor plants.',
    2299.00,
    'Pots & Planters',
    'https://images.unsplash.com/photo-1487798452839-c748a707a6b2?auto=format&fit=crop&q=80',
    30
  );
