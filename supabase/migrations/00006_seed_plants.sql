-- Seed Products with Images
insert into public.products (title, description, price, category, image_url, stock_count)
values
  (
    'Premium Royal Red Silk Plant',
    'A beautiful premium silk plant elegantly draped with rich vibrant red and gold colors. Perfect for weddings and special occasions.',
    12999.00,
    'Silk',
    '/images/products/silk_plant_1781324994817.png',
    15
  ),
  (
    'Pastel Blue Elegant Cotton Plant',
    'An elegant cotton plant in pastel blue with intricate borders. Lightweight and perfect for summer wear or daytime events.',
    3499.00,
    'Cotton',
    '/images/products/cotton_plant_1781325025886.png',
    25
  ),
  (
    'Deep Green Banarasi Plant',
    'A stunning Banarasi plant in deep green and exquisite gold zari work. An heirloom piece that stands out in any festive gathering.',
    18500.00,
    'Banarasi',
    '/images/products/banarasi_plant_1781325047747.png',
    10
  ),
  (
    'Vibrant Magenta Georgette Plant',
    'A beautiful flowing georgette plant in vibrant magenta with subtle embroidery. Modern yet traditional.',
    5299.00,
    'Georgette',
    '/images/products/georgette_plant_1781325076562.png',
    30
  );
