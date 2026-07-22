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
