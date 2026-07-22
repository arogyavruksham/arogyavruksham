-- Create Product Reviews Table
create table public.product_reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.users(id),
  order_id uuid not null references public.orders(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  review_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- A user can only review a specific product in a specific order once
  unique (user_id, order_id, product_id)
);

-- Enable Row Level Security
alter table public.product_reviews enable row level security;

-- Everyone can read reviews
create policy "Reviews are viewable by everyone" on public.product_reviews
  for select using (true);

-- Authenticated users can insert their own reviews
create policy "Users can insert their own reviews" on public.product_reviews
  for insert with check (auth.uid() = user_id);

-- Authenticated users can update their own reviews
create policy "Users can update their own reviews" on public.product_reviews
  for update using (auth.uid() = user_id);

-- Authenticated users can delete their own reviews
create policy "Users can delete their own reviews" on public.product_reviews
  for delete using (auth.uid() = user_id);
