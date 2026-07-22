-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing tables to allow re-running the script
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.products cascade;
drop table if exists public.users cascade;

-- Create Users Table (extends Supabase auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to automatically create a user record when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create Products Table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  price numeric not null,
  category text not null check (category in ('Indoor Plants', 'Outdoor Plants', 'Succulents', 'Pots & Planters')),
  image_url text,
  stock_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Orders Table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id),
  total_amount numeric not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Order Items Table
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null,
  price_at_time numeric not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Policies for Users
create policy "Users can view their own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own data" on public.users
  for update using (auth.uid() = id);

-- Policies for Products
-- Anyone can read products
create policy "Products are viewable by everyone" on public.products
  for select using (true);

-- Authenticated users can modify products (acting as admins for this demo)
create policy "Authenticated users can insert products" on public.products
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update products" on public.products
  for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete products" on public.products
  for delete using (auth.role() = 'authenticated');

-- Policies for Orders
create policy "Users can view their own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Users can insert their own orders" on public.orders
  for insert with check (auth.uid() = user_id);

-- Policies for Order Items
create policy "Users can view their own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Users can insert order items for their own orders" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );
-- Create Admin Secrets Table
drop table if exists public.admin_secrets cascade;
create table public.admin_secrets (
  id uuid default gen_random_uuid() primary key,
  passcode text not null
);

-- Insert the default master password ('admin123')
insert into public.admin_secrets (passcode) values ('admin123');

-- Restrict access to admin secrets
alter table public.admin_secrets enable row level security;

-- Only authenticated users can read (or we can just let anon read for simplicity in this demo, but authenticated is safer)
create policy "Authenticated users can read admin secrets" on public.admin_secrets
  for select using (auth.role() = 'authenticated');
-- 1. Add actual_price to products (the cost to the business)
alter table public.products add column if not exists actual_price numeric default 0;

-- 2. Add actual_price_at_time to order_items (locks in the cost at the moment of checkout)
alter table public.order_items add column if not exists actual_price_at_time numeric default 0;

-- 3. Create Storage Bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;


-- 5. Storage Policies for product-images bucket
drop policy if exists "Public Access to product-images" on storage.objects;
create policy "Public Access to product-images" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "Authenticated users can upload to product-images" on storage.objects;
create policy "Authenticated users can upload to product-images" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
  
drop policy if exists "Authenticated users can update product-images" on storage.objects;
create policy "Authenticated users can update product-images" on storage.objects
  for update using (bucket_id = 'product-images' and auth.role() = 'authenticated');
  
drop policy if exists "Authenticated users can delete from product-images" on storage.objects;
create policy "Authenticated users can delete from product-images" on storage.objects
  for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- 6. Trigger to automatically reduce stock when an order is placed
create or replace function public.reduce_stock_on_order()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.products
  set stock_count = greatest(0, stock_count - new.quantity)
  where id = new.product_id;
  return new;
end;
$$;

drop trigger if exists on_order_item_created on public.order_items;
create trigger on_order_item_created
  after insert on public.order_items
  for each row execute procedure public.reduce_stock_on_order();
alter table public.orders add column shipping_address jsonb;
drop table if exists public.user_addresses cascade;
create table public.user_addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  email text,
  phone text not null,
  "fullAddress" text not null,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_addresses enable row level security;

-- Policies
create policy "Users can view their own addresses" on public.user_addresses
  for select using (auth.uid() = user_id);

create policy "Users can insert their own addresses" on public.user_addresses
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own addresses" on public.user_addresses
  for update using (auth.uid() = user_id);

create policy "Users can delete their own addresses" on public.user_addresses
  for delete using (auth.uid() = user_id);
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
-- Create Coupons Table
drop table if exists public.coupons cascade;
create table public.coupons (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  title text not null,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric not null check (discount_value > 0),
  start_date timestamp with time zone not null default timezone('utc'::text, now()),
  expiry_date timestamp with time zone not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Alter Orders Table to support coupons
alter table public.orders
add column if not exists coupon_code text,
add column if not exists discount_amount numeric default 0;

-- Enable Row Level Security (RLS)
alter table public.coupons enable row level security;

-- Policies for Coupons
-- Anyone can view active coupons
create policy "Active coupons are viewable by everyone" on public.coupons
  for select using (is_active = true);

-- Authenticated users (admin) can view all and manage
create policy "Authenticated users can view all coupons" on public.coupons
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert coupons" on public.coupons
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update coupons" on public.coupons
  for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete coupons" on public.coupons
  for delete using (auth.role() = 'authenticated');
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
-- Function to decrement product stock securely
create or replace function public.decrement_stock(product_id uuid, quantity int)
returns void
language plpgsql
security definer
as $$
begin
  update public.products
  set stock_count = stock_count - quantity
  where id = product_id and stock_count >= quantity;
end;
$$;
-- Sync missing users from auth.users to public.users
-- This fixes foreign key constraint issues when a user exists in auth.users
-- but the trigger failed or the user was created before the trigger existed.

insert into public.users (id, email, full_name)
select 
  id, 
  email, 
  raw_user_meta_data->>'full_name' as full_name
from auth.users
where id not in (select id from public.users);
-- Create the daily_analytics table
CREATE TABLE IF NOT EXISTS daily_analytics (
    date DATE PRIMARY KEY,
    total_income DECIMAL(12, 2) DEFAULT 0,
    total_expenses DECIMAL(12, 2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_customers INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;

-- Allow public read access to daily_analytics
CREATE POLICY "Enable read access for all users" ON daily_analytics
    FOR SELECT USING (true);

-- Create the trigger function
CREATE OR REPLACE FUNCTION update_daily_analytics()
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
BEGIN
    -- Only process orders that are not cancelled
    IF NEW.status != 'cancelled' THEN
        -- If this is a new order or the status changed from cancelled to something else
        IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status = 'cancelled') THEN
            INSERT INTO daily_analytics (date, total_income, total_expenses, total_orders, total_customers)
            VALUES (
                DATE(NEW.created_at), 
                NEW.total_amount, 
                NEW.total_amount * 0.4, 
                1, 
                1 -- A rough estimate for customers via trigger; will need unique distinct logic if exact is needed, but this works for basic progress
            )
            ON CONFLICT (date) DO UPDATE SET 
                total_income = daily_analytics.total_income + EXCLUDED.total_income,
                total_expenses = daily_analytics.total_expenses + EXCLUDED.total_expenses,
                total_orders = daily_analytics.total_orders + 1,
                total_customers = daily_analytics.total_customers + 1; -- Roughly incrementing

        -- If the status changed to cancelled, we should deduct
        ELSIF TG_OP = 'UPDATE' AND NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
            UPDATE daily_analytics SET 
                total_income = total_income - OLD.total_amount,
                total_expenses = total_expenses - (OLD.total_amount * 0.4),
                total_orders = total_orders - 1,
                total_customers = total_customers - 1
            WHERE date = DATE(OLD.created_at);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on orders
DROP TRIGGER IF EXISTS on_order_status_change ON orders;
CREATE TRIGGER on_order_status_change
    AFTER INSERT OR UPDATE OF status
    ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_analytics();

-- Seed existing data into daily_analytics
INSERT INTO daily_analytics (date, total_income, total_expenses, total_orders, total_customers)
SELECT 
    DATE(created_at) as date,
    SUM(total_amount) as total_income,
    SUM(total_amount) * 0.4 as total_expenses,
    COUNT(id) as total_orders,
    COUNT(DISTINCT user_id) as total_customers
FROM orders
WHERE status != 'cancelled'
GROUP BY DATE(created_at)
ON CONFLICT (date) DO UPDATE SET 
    total_income = EXCLUDED.total_income,
    total_expenses = EXCLUDED.total_expenses,
    total_orders = EXCLUDED.total_orders,
    total_customers = EXCLUDED.total_customers;
-- Allow authenticated users (admins) to view all users
drop policy if exists "Authenticated users can view all users" on public.users;
create policy "Authenticated users can view all users" on public.users
  for select using (auth.role() = 'authenticated');

-- Allow authenticated users (admins) to view all orders
drop policy if exists "Authenticated users can view all orders" on public.orders;
create policy "Authenticated users can view all orders" on public.orders
  for select using (auth.role() = 'authenticated');

-- Allow authenticated users (admins) to update all orders (to change status)
drop policy if exists "Authenticated users can update all orders" on public.orders;
create policy "Authenticated users can update all orders" on public.orders
  for update using (auth.role() = 'authenticated');

-- Allow authenticated users (admins) to view all order items
drop policy if exists "Authenticated users can view all order items" on public.order_items;
create policy "Authenticated users can view all order items" on public.order_items
  for select using (auth.role() = 'authenticated');

-- Allow authenticated users to view all user addresses
drop policy if exists "Authenticated users can view all addresses" on public.user_addresses;
create policy "Authenticated users can view all addresses" on public.user_addresses
  for select using (auth.role() = 'authenticated');
-- Fix for DB Proxy Error: 500 when deleting products that have existing orders
-- This allows products to be deleted while keeping the order history intact.

ALTER TABLE public.order_items DROP CONSTRAINT order_items_product_id_fkey;
ALTER TABLE public.order_items ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
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
-- Create an ENUM type for roles so it shows up as a dropdown in Supabase Studio
do $$ begin
    create type public.user_role as enum ('user', 'editor', 'manager', 'admin');
exception
    when duplicate_object then null;
end $$;

-- Drop the check constraint if it was created previously
alter table public.users drop constraint if exists users_role_check;

-- Add the column if it doesn't exist at all
alter table public.users add column if not exists role public.user_role default 'user';

-- If it exists as text, convert it to the enum type
alter table public.users alter column role drop default;
alter table public.users alter column role type public.user_role using role::text::public.user_role;
alter table public.users alter column role set default 'user'::public.user_role;

-- Update existing admin user
update public.users set role = 'admin' where email = 'admin@gmail.com';
-- Add phone column to users table
ALTER TABLE public.users ADD COLUMN phone VARCHAR(20) UNIQUE;

-- Create an index for faster lookups by phone
CREATE INDEX IF NOT EXISTS users_phone_idx ON public.users(phone);
-- Add original_price to products table
ALTER TABLE public.products ADD COLUMN original_price numeric;
