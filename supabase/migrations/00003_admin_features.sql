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
