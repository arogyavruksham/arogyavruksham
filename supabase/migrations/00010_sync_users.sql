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
