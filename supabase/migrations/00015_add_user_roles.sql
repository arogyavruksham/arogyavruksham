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
