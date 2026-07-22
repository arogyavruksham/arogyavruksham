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
