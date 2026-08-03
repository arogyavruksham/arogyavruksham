-- Create Announcements Table
create table if not exists public.announcements (
  id text primary key default 'main',
  text text not null,
  mobile_text text,
  link_text text,
  link_url text,
  bg_color text default '#689f38',
  text_color text default '#ffffff',
  is_active boolean default true,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.announcements enable row level security;

-- Everyone can read announcements
create policy "Announcements are viewable by everyone" on public.announcements
  for select using (true);

-- Seed default announcement if it does not exist
insert into public.announcements (id, text, mobile_text, link_text, link_url, bg_color, text_color, is_active)
values (
  'main',
  'Free Shipping Every Day, Every Order Over ₹999',
  'Free Shipping Every Day Over ₹999',
  'Shop Now',
  '/shop',
  '#689f38',
  '#ffffff',
  true
) on conflict (id) do nothing;
