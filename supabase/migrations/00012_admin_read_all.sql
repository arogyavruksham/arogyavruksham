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
