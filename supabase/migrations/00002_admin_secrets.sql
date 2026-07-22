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
