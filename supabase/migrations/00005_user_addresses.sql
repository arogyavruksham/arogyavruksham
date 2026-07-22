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
